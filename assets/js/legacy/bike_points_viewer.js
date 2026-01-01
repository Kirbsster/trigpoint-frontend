


// bike_points_viewer.js
// Canvas-centric viewer: the canvas draws the image and the points.
// Points live in IMAGE coordinates, so geometry is resolution- and device-independent.
(function () {

    // function log(...args) {
    //     console.log("[BikeViewer]", ...args);
    // }

    window.initBikePointsViewer = function initBikePointsViewer(containerId, initialData) {

        const BV = window.BikeViewer;

        let __bv_needs_draw = false;

        function invalidate(msg) {
            if (msg) setDebug(msg);
            if (__bv_needs_draw) return;
            __bv_needs_draw = true;
            requestAnimationFrame(() => {
                __bv_needs_draw = false;
                drawAll();
            });
        }


        const container = document.getElementById("bike-viewer-container");
        if (!container) {
            console.error("[BikeViewer] container not found:", containerId);
            return;
        }

        // Local aliases so the rest of the file stays unchanged
        const log = (...args) => BV.log(...args);
        const setDebug = (text) => BV.setDebug(container, text);
        const cssVar = (name) => BV.cssVar(name);
        const qs = (sel, root) => BV.qs(sel, root);
        const qsa = (sel, root) => BV.qsa(sel, root);


        log("initBikePointsViewer called with:", containerId, initialData);

        const inner = container.querySelector("#bike-viewer-inner") || container;
        const img = inner.querySelector("img");
        if (!img) {
            console.error("[BikeViewer] no <img> found inside container");
            return;
        }

        // function cssVar(name) {
        //     return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        // }

        // === Canvas overlay (draws the image + points) ===
        const canvas = document.createElement("canvas");
        canvas.style.position = "absolute";
        canvas.style.inset = "0";
        canvas.style.pointerEvents = "auto";
        canvas.style.touchAction = "none";
        inner.appendChild(canvas);
        const ctx = canvas.getContext("2d");

        // --- State ---
        // const bikeId = container.dataset.bikeId || null;
        // --- State ---
        // Try data attribute first
        let bikeId = container.dataset.bikeId || "";

        // Fallback: parse from URL /bike_analyser/<id>
        if (!bikeId && window.location && window.location.pathname) {
            const m = window.location.pathname.match(/bike_analyser\/([^/]+)/);
            if (m && m[1]) {
                bikeId = m[1];
                console.log("[BikeViewer] Fallback bikeId from URL:", bikeId);
            }
        }

        const accessToken = container.dataset.accessToken || null;

        // Log once so we can see what we actually have
        console.log("[BikeViewer] bikeId from dataset/URL:", bikeId);

        // --- Geometry state ---
        let points = [];
        let rearAxlePath = []
        let pointTrails = [];
        let nextId = 1;

        // --- just under: let points = []; let nextId = 1; ---
        function recomputeNextIdFromPoints() {
            let maxNum = 0;
            for (const p of points) {
                const m = String(p.id || "").match(/pt_(\d+)/);
                if (m) {
                    const n = parseInt(m[1], 10);
                    if (!Number.isNaN(n) && n > maxNum) {
                        maxNum = n;
                    }
                }
            }
            nextId = maxNum + 1;
        }

        // NEW: bodies as per backend schema
        // each body: { id, name, point_ids: [ "pt_1", "pt_2", ... ], closed: bool }
        let bodies = [];
        let bars = [];              // [{ id, a, b }]
        let connectMode = false;    // if true, clicks connect points
        let connectChain = [];      // [pointId, pointId, ...] current polyline being built
        let nextBodyId = 1;
        let selectedBodyId = null;
        let bodyDeleteHit = null;
        let currentLinkType = null;

        function rebuildBarsFromBodies() {
            bars = [];
            let counter = 1;

            bodies.forEach((body) => {
                const ids = Array.isArray(body.point_ids) ? body.point_ids : [];
                if (ids.length < 2) return;

                for (let i = 0; i < ids.length - 1; i++) {
                    bars.push({
                        id: `bar_${counter++}`,
                        a: ids[i],
                        b: ids[i + 1],
                        bodyId: body.id,
                        bodyType: body.type || null,
                    });
                }

                if (body.closed && ids.length > 2) {
                    bars.push({
                        id: `bar_${counter++}`,
                        a: ids[ids.length - 1],
                        b: ids[0],
                        bodyId: body.id,
                        bodyType: body.type || null,
                    });
                }
            });
        }


        // ---- Measurement system (v1: rear_center only) ----
        const meas = {
            show: true,
            activeScaleKey: null,     // "rear_center" later "wheelbase" etc.
        };

        function getPtsByType() {
            const out = {};
            for (const p of points) out[p.type] = p;
            return out;
        }

        // function setScaleFromMeasurement(key, mmValue) {
        //     const pts = getPtsByType();

        //     if (key === "rear_center") {
        //         const bbPt = pts.bb || pts.bottom_bracket;
        //         const rearPt = pts.rear_axle;

        //         if (!bbPt || !rearPt) {
        //             setDebug("Rear center set but BB/rear axle point missing");
        //             return null;
        //         }

        //         const dPx = Math.hypot(rearPt.x - bbPt.x, rearPt.y - bbPt.y);
        //         if (!(dPx > 0)) {
        //             setDebug("Rear center set but BB and rear axle coincide; no scale");
        //             return null;
        //         }

        //         const scaleMmPerPx = mmValue / dPx;
        //         container.bikeViewer.scale_mm_per_px = scaleMmPerPx;
        //         meas.activeScaleKey = key;

        //         setDebug(
        //             `Rear center set: ${mmValue} mm, d_px=${dPx.toFixed(2)}, scale=${scaleMmPerPx.toFixed(6)} mm/px`
        //         );
        //         return scaleMmPerPx;
        //     }

        //     return null;
        // }

        let activeType = null;
        let activeLinkType = null; // "bar" | "shock" | null
        let selectedPointId = null;
        let draggingPointId = null;

        let rearMeasureAnim = {
            running: false,
            startTime: 0,
            fromX: 0,
            toX: 0,
            duration: 220,   // ms
        };


        const MEASURE_DEFS = {
            rear_center: {
                id: "rear_center",
                label: "Rear Center",
                units: "mm",
                type: "input",
                scaleCandidate: true,
                anchors: { aType: "bb", bType: "rear_axle" },
                place: {
                    orientation: "horizontal",
                    normalOffsetPx: -50,
                    pillOffsetPx: 25,
                },
                style: { headW: 10, headH: 14, shaftThickness: 3, minSpanPx: 20 },
                ticks: {
                    enabled: true,

                    // which end(s) get ticks
                    ends: "both",            // "both" | "a" | "b" | "none"

                    // tick direction relative to the measurement line (root-space +Y is “normal”)
                    side: "both",            // "both" | "pos" | "neg"
                    lengthPosPx: 25,          // length toward +normal
                    lengthNegPx: 50,          // length toward -normal

                    thicknessPx: 3,
                    offsetPx: 0,             // shifts the tick center along normal (rarely needed)
                },
            },

            front_center: {
                id: "front_center",
                label: "Front Center",
                units: "mm",
                type: "input",
                scaleCandidate: true,
                anchors: { aType: "bb", bType: "front_axle" },
                place: {
                    orientation: "horizontal",
                    normalOffsetPx: 50,
                    pillOffsetPx: -25,
                },
                style: { headW: 10, headH: 14, shaftThickness: 3, minSpanPx: 20 },
                ticks: {
                    enabled: true,

                    // which end(s) get ticks
                    ends: "both",            // "both" | "a" | "b" | "none"

                    // tick direction relative to the measurement line (root-space +Y is “normal”)
                    side: "both",            // "both" | "pos" | "neg"
                    lengthPosPx: 50,          // length toward +normal
                    lengthNegPx: 25,          // length toward -normal

                    thicknessPx: 3,
                    offsetPx: 0,             // shifts the tick center along normal (rarely needed)
                },
            },

            wheelbase: {
                id: "wheelbase",
                label: "Wheelbase",
                units: "mm",
                type: "input",
                scaleCandidate: true,
                anchors: { aType: "rear_axle", bType: "front_axle" },
                place: {
                    orientation: "horizontal",   // wheelbase is usually horizontal span
                    normalOffsetPx: 125,         // push it further away so it doesn’t clash with RC
                    pillOffsetPx: -25,
                },
                style: { headW: 10, headH: 14, shaftThickness: 3, minSpanPx: 40 },
                ticks: {
                    enabled: true,

                    // which end(s) get ticks
                    ends: "both",            // "both" | "a" | "b" | "none"

                    // tick direction relative to the measurement line (root-space +Y is “normal”)
                    side: "both",            // "both" | "pos" | "neg"
                    lengthPosPx: 100,          // length toward +normal
                    lengthNegPx: 100,          // length toward -normal

                    thicknessPx: 3,
                    offsetPx: 50,             // shifts the tick center along normal (rarely needed)
                },
            },
        };

        const measurementDom = {};
        let activeScaleMeasurementId = "rear_center";
        const measurementValues = {}; // { rear_center: number }

        function pxDistanceForMeasurement(def, a, b) {
            const orient = def.place?.orientation || "point_to_point";
            if (orient === "horizontal") return Math.abs(b.x - a.x);
            if (orient === "vertical") return Math.abs(b.y - a.y);
            return Math.hypot(b.x - a.x, b.y - a.y);
        }

        function setScaleFromMeasurement(measId, mmValue) {
            const def = MEASURE_DEFS?.[measId];
            if (!def || !def.anchors) return null;

            const pts = getPtsByType(); // your helper (type -> point)
            const aType = def.anchors.aType;
            const bType = def.anchors.bType;

            // Prefer your pts map, but fall back to scanning points if needed
            const a = pts?.[aType] || points.find((p) => p.type === aType);
            const b = pts?.[bType] || points.find((p) => p.type === bType);

            if (!a || !b) {
                setDebug(`${def.label || measId} set but anchor points missing`);
                return null;
            }

            const orient = def.place?.orientation || "point_to_point";
            let dPx = 0;

            if (orient === "horizontal") dPx = Math.abs(b.x - a.x);
            else if (orient === "vertical") dPx = Math.abs(b.y - a.y);
            else dPx = Math.hypot(b.x - a.x, b.y - a.y);

            if (!(dPx > 0)) {
                setDebug(`${def.label || measId} set but pixel distance is zero`);
                return null;
            }

            const scaleMmPerPx = mmValue / dPx;
            container.bikeViewer.scale_mm_per_px = scaleMmPerPx;

            // ✅ use your actual state var name
            activeScaleMeasurementId = measId;

            setDebug(
                `${def.label || measId} set: ${mmValue} mm, d_px=${dPx.toFixed(
                    2
                )}, scale=${scaleMmPerPx.toFixed(6)} mm/px`
            );

            // trigger redraw so all measurement overlays update immediately
            drawAll();

            return scaleMmPerPx;
        }

        function recomputeMeasurementsFromScale() {
            const scale = container.bikeViewer?.scale_mm_per_px;
            if (!scale || scale <= 0) return;

            const pts = getPtsByType();

            for (const id in MEASURE_DEFS) {

                if (id === activeScaleMeasurementId) continue;  // ✅ keep the user-entered source

                const def = MEASURE_DEFS[id];
                if (!def?.anchors) continue;

                // Don’t fight the user while they’re typing
                const dom = measurementDom?.[id];
                const pill = dom?.pill;
                const isEditing = pill && document.activeElement === pill;
                if (isEditing) continue;

                const a = pts?.[def.anchors.aType] || points.find((p) => p.type === def.anchors.aType);
                const b = pts?.[def.anchors.bType] || points.find((p) => p.type === def.anchors.bType);
                if (!a || !b) continue;

                const dPx = pxDistanceForMeasurement(def, a, b);
                if (!(dPx > 0)) continue;

                measurementValues[id] = +(dPx * scale).toFixed(1);
            }
        }

        function recomputeGeometryFromScale() {
            const scale = container.bikeViewer.scale_mm_per_px;
            if (!scale || scale <= 0) return null;

            const pts = getPtsByType(); // { bb, rear_axle, front_axle, ... } using point.type

            const out = {
                scale_mm_per_px: scale,
                scale_source: activeScaleMeasurementId || null,
                rear_center_mm: null,
                wheelbase_mm: null,
                front_center_mm: null,
            };

            const distPx = (a, b, orient = "point_to_point") => {
                if (!a || !b) return null;
                if (orient === "horizontal") return Math.abs(b.x - a.x);
                if (orient === "vertical") return Math.abs(b.y - a.y);
                return Math.hypot(b.x - a.x, b.y - a.y);
            };

            for (const id in MEASURE_DEFS) {

                if (id === activeScaleMeasurementId) continue;  // ✅ keep the user-entered source

                const def = MEASURE_DEFS[id];
                const a = pts[def.anchors?.aType];
                const b = pts[def.anchors?.bType];
                const dPx = distPx(a, b, def.place?.orientation || "point_to_point");
                if (!dPx || dPx <= 0) continue;

                const mm = +(dPx * scale).toFixed(1);
                measurementValues[id] = mm; // keep UI in sync

                // map measurement id -> geometry field
                if (id === "rear_center") out.rear_center_mm = mm;
                if (id === "wheelbase") out.wheelbase_mm = mm;
                if (id === "front_center") out.front_center_mm = mm;
            }

            return out;
        }

        // async function commitMeasurement(measureId, mmValue) {
        //     // 1) store value locally
        //     measurementValues[measureId] = mmValue;

        //     // 2) last edited wins = scale source (for now)
        //     activeScaleMeasurementId = measureId;

        //     // 3) compute scale from this measurement
        //     const scale = setScaleFromMeasurement(measureId, mmValue);
        //     if (!scale) return;

        //     // 4) recompute derived values (if you have that)
        //     if (typeof recomputeMeasurementsFromScale === "function") {
        //         recomputeMeasurementsFromScale();
        //     }

        //     // // 5) push to backend
        //     // if (measureId === "rear_center") {
        //     //     const res = await BV.putRearCenter({
        //     //         container,
        //     //         bikeId,
        //     //         accessToken,
        //     //         rearCenterPayload: { rear_center_mm: mmValue },
        //     //     });
        //     //     if (!res.ok) throw new Error(`rear_center PUT failed (${res.status}): ${await res.text()}`);
        //     // } else if (measureId === "wheelbase") {
        //     //     const res = await BV.putWheelbase({
        //     //         container,
        //     //         bikeId,
        //     //         accessToken,
        //     //         wheelbasePayload: { wheelbase_mm: mmValue },
        //     //     });
        //     //     if (!res.ok) throw new Error(`wheelbase PUT failed (${res.status}): ${await res.text()}`);
        //     // } else if (measureId === "front_center") {
        //     //     const res = await BV.putFrontCenter({
        //     //         container,
        //     //         bikeId,
        //     //         accessToken,
        //     //         frontCenterPayload: { front_center_mm: mmValue },
        //     //     });
        //     //     if (!res.ok) throw new Error(`front_center PUT failed (${res.status}): ${await res.text()}`);
        //     // }

        //     setScaleFromMeasurement(measureId, mmValue);
        //     const geom = recomputeGeometryFromScale();
        //     if (geom) await BV.putGeometry({ container, bikeId, accessToken, payload: geom });

        //     setDebug(`${measureId} saved ✔`);
        //     invalidate(); // prefer this over drawAll() if you have it
        // }
        async function commitMeasurement(measureId, mmValue) {
            measurementValues[measureId] = mmValue;
            activeScaleMeasurementId = measureId;

            // 1) compute scale from the edited measurement
            const scale = setScaleFromMeasurement(measureId, mmValue);
            if (!scale) return;

            // 2) recompute ALL derived geometry from the scale (and refresh UI values)
            const geom = recomputeGeometryFromScale();
            if (!geom) return;

            // 3) push the whole geometry blob
            const res = await BV.putGeometry({ container, bikeId, accessToken, payload: geom });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`geometry PUT failed (${res.status}): ${text}`);
            }

            setDebug(`${measureId} saved ✔`);
            invalidate();
        }

        function setActiveMeasurementHighlight(inputEl, isActive) {
            // super minimal “active” styling; tweak later
            inputEl.style.outline = isActive ? "2px solid var(--accent)" : "none";
            inputEl.style.outlineOffset = "2px";
        }

        // // === Rear-center input box (HTML overlay) ===
        // const rearCenterInput = document.createElement("input");
        // rearCenterInput.type = "text";
        // rearCenterInput.id = "rear-center-input";
        // rearCenterInput.placeholder = "Enter Length [mm] - Rear Center (RC)";

        // // --- Full JS styling for double-ended arrow pill ---
        // Object.assign(rearCenterInput.style, {
        //     position: "absolute",
        //     zIndex: 50,
        //     display: "none",

        //     // Layout
        //     padding: "4px 10px",
        //     minWidth: "120px",
        //     textAlign: "center",
        //     whiteSpace: "pre-line",

        //     // Visuals
        //     background: cssVar("--text-dark"),
        //     border: "0px",
        //     color: cssVar("--text-light"),
        //     fontSize: "13px",
        //     lineHeight: "1.2",
        //     borderRadius: "999px",

        //     // 🔻 Double-ended arrow shape
        //     clipPath: "polygon(6% 0, 94% 0, 100% 50%, 94% 100%, 6% 100%, 0 50%)",

        //     // Smooth resizing as the span changes
        //     // transition: "width 0.18s ease, left 0.18s ease, right 0.18s ease",

        //     // Needed to allow typing
        //     pointerEvents: "auto",
        // });

        function makeArrowDom(container, cssVar) {
            const root = document.createElement("div");
            Object.assign(root.style, {
                position: "absolute",
                left: "0px",
                top: "0px",
                transformOrigin: "0 0",
                pointerEvents: "none",
                zIndex: 50,
                display: "none",
            });

            const leftHead = document.createElement("div");
            const rightHead = document.createElement("div");
            const shaft = document.createElement("div");

            Object.assign(shaft.style, {
                position: "absolute",
                height: "2px",
                background: cssVar("--text-dark"),
            });

            Object.assign(leftHead.style, {
                position: "absolute",
                width: "0px",
                height: "0px",
            });

            Object.assign(rightHead.style, {
                position: "absolute",
                width: "0px",
                height: "0px",
            });

            // ---------- NEW: tick elements ----------
            function makeTick() {
                const t = document.createElement("div");
                Object.assign(t.style, {
                    position: "absolute",
                    display: "none",
                    background: cssVar("--text-dark"),
                });
                root.appendChild(t);
                return t;
            }

            const tickA_pos = makeTick();
            const tickA_neg = makeTick();
            const tickB_pos = makeTick();
            const tickB_neg = makeTick();
            // ---------------------------------------

            const pill = document.createElement("input");
            pill.type = "text";
            pill.autocomplete = "off";
            Object.assign(pill.style, {
                position: "absolute",
                padding: "4px 10px",
                borderRadius: "999px",
                background: cssVar("--text-dark"),
                color: cssVar("--text-light"),
                fontSize: "13px",
                border: "0",
                outline: "none",
                pointerEvents: "auto",
                textAlign: "center",
                minWidth: "120px",
            });

            function applyHeadStyles(left, right, color, w, h) {
                const hh = h / 2;
                Object.assign(left.style, {
                    borderTop: `${hh}px solid transparent`,
                    borderBottom: `${hh}px solid transparent`,
                    borderRight: `${w}px solid ${color}`,
                });
                Object.assign(right.style, {
                    borderTop: `${hh}px solid transparent`,
                    borderBottom: `${hh}px solid transparent`,
                    borderLeft: `${w}px solid ${color}`,
                });
            }

            root.append(leftHead, shaft, rightHead, pill);
            container.appendChild(root);

            return {
                root,
                leftHead,
                rightHead,
                shaft,
                pill,
                tickA_pos,
                tickA_neg,
                tickB_pos,
                tickB_neg,
                applyHeadStyles,
            };
        }

        function bindMmInputPill(pill, {
            getMeasureId,            // () => string
            setActive,               // (isActive:boolean) => void
            onCommit,                // async (measureId, mmValue:number) => void
            setDebug,                // (msg:string) => void
        }) {
            const NUMERIC = /^\d*\.?\d*$/;
            let lastValid = "";

            // numeric-only typing
            pill.addEventListener("input", (e) => {
                let raw = String(e.target.value || "").replace(/mm/i, "").trim();
                if (raw === "") {
                    lastValid = "";
                    return;
                }
                if (NUMERIC.test(raw)) {
                    lastValid = raw;
                    return;
                }
                e.target.value = lastValid;
            });

            // strip units on focus
            pill.addEventListener("focus", (e) => {
                const raw = String(e.target.value || "").replace(/mm/i, "").trim();
                e.target.value = raw;
            });

            // Enter commits
            pill.addEventListener("keydown", (e) => {
                if (e.key === "Enter") pill.blur();
            });

            // commit on blur
            pill.addEventListener("blur", async (e) => {
                const measureId = getMeasureId();
                if (!measureId) return;

                let raw = String(e.target.value || "").replace(/mm/i, "").trim();

                // empty allowed
                if (raw === "") {
                    lastValid = "";
                    e.target.value = "";
                    setActive(false);
                    return;
                }

                const val = Number.parseFloat(raw);

                // validate
                if (!Number.isFinite(val) || val <= 0) {
                    lastValid = "";
                    e.target.value = "";
                    setDebug("Measurement invalid; cleared");
                    setActive(false);
                    return;
                }

                // normalize + suffix
                const norm = String(val);
                lastValid = norm;
                e.target.value = norm + " mm";

                try {
                    await onCommit(measureId, val);
                } catch (err) {
                    console.error("[BikeViewer] measurement commit failed:", err);
                    setDebug("Error saving measurement (see console)");
                }
            });
        }

        function resolveAnchors(points, def) {
            const a = points.find(p => p.type === def.anchors.aType);
            const b = points.find(p => p.type === def.anchors.bType);
            if (!a || !b) return null;
            return { a, b };
        }

        function imgToCss(view, x, y) {
            return { x: view.tx + view.scale * x, y: view.ty + view.scale * y };
        }
        function layoutMeasurement(def, view, aImg, bImg) {
            const A = { x: view.tx + view.scale * aImg.x, y: view.ty + view.scale * aImg.y };
            const B = { x: view.tx + view.scale * bImg.x, y: view.ty + view.scale * bImg.y };

            const orient = def.place?.orientation || "point_to_point";

            // Choose the reference segment in CSS space
            let P = A, Q = B;
            if (orient === "horizontal") {
                // measure x-separation; keep y centered
                const y = (A.y + B.y) / 2;
                P = { x: A.x, y };
                Q = { x: B.x, y };
            } else if (orient === "vertical") {
                // measure y-separation; keep x centered
                const x = (A.x + B.x) / 2;
                P = { x, y: A.y };
                Q = { x, y: B.y };
            } // else point_to_point: P=A, Q=B

            const dx = Q.x - P.x;
            const dy = Q.y - P.y;
            const L = Math.hypot(dx, dy);
            if (!(L > 1e-6)) return null;

            const angle = Math.atan2(dy, dx);

            // constant pixel sizes
            const headW = def.style?.headW ?? 10;
            const headH = def.style?.headH ?? 14;
            const shaftThickness = def.style?.shaftThickness ?? 3;

            const normalOffsetPx = def.place?.normalOffsetPx ?? 26;
            const pillOffsetPx = def.place?.pillOffsetPx ?? 18;

            // In root-local coords: X along PQ, Y normal to PQ
            const yArrow = normalOffsetPx;
            const shaftX = headW;
            const shaftW = Math.max(0, L - 2 * headW);

            return {
                origin: { x: P.x, y: P.y }, // root placed at P
                angle,                      // root rotated so +X points along PQ
                L,
                leftHead: { x: 0, y: yArrow - headH / 2, w: headW, h: headH },
                rightHead: { x: L - headW, y: yArrow - headH / 2, w: headW, h: headH },
                shaft: { x: shaftX, y: yArrow - shaftThickness / 2, w: shaftW, h: shaftThickness },
                pill: { cx: L * 0.5, cy: yArrow - pillOffsetPx },
            };
        }

        function placeTickFromPoint({
            el,
            ptCss,            // {x,y} in CSS px of the associated point
            angle,            // measurement axis angle (radians) in CSS space
            normalOffsetPx,   // same sign convention as your arrow offset
            thickPx,
            lenPosPx,
            lenNegPx,
            color,
        }) {
            if (!el) return;

            // Unit normal to measurement axis
            const nx = -Math.sin(angle);
            const ny = Math.cos(angle);

            // Tick center is at the POINT, pushed off by the same normal offset as the arrow
            const cx = ptCss.x + nx * normalOffsetPx;
            const cy = ptCss.y + ny * normalOffsetPx;

            // We draw a vertical "bar" then rotate it so its long axis is along the NORMAL
            // Normal angle = axis angle + 90deg
            const tickAngle = angle + Math.PI / 2;

            // Total height is lenNeg + lenPos, with the "center" located lenNeg from the top
            const H = (lenNegPx + lenPosPx);

            Object.assign(el.style, {
                position: "absolute",
                display: "block",
                width: `${thickPx}px`,
                height: `${H}px`,
                background: color,

                // place top-left then rotate around the point-aligned center
                left: `${cx - thickPx / 2}px`,
                top: `${cy - lenNegPx}px`,

                transformOrigin: `${thickPx / 2}px ${lenNegPx}px`,
                transform: `rotate(${tickAngle}rad)`,
            });
        }

        function updateMeasurementsOverlay({
            container,
            canvas,
            view,
            points,
            cssVar,
            defs,
            domMap,
            activeScaleId,
            valuesById,
        }) {
            // Ensure container is a positioning context
            const cs = getComputedStyle(container);
            if (cs.position === "static") container.style.position = "relative";

            const color = cssVar("--text-dark");

            const hide = (dom) => {
                dom.root.style.display = "none";
            };
            const show = (dom) => {
                dom.root.style.display = "block";
            };

            for (const id in defs) {
                const def = defs[id];
                const dom = domMap[id] || (domMap[id] = makeArrowDom(container, cssVar));

                const anchors = resolveAnchors(points, def);
                if (!anchors) {
                    hide(dom);
                    continue;
                }

                const layout = layoutMeasurement(def, view, anchors.a, anchors.b);
                if (!layout) {
                    hide(dom);
                    continue;
                }

                const ticks = def.ticks;
                [
                    dom.tickA_pos,
                    dom.tickA_neg,
                    dom.tickB_pos,
                    dom.tickB_neg,
                ].forEach(t => t.style.display = "none");

                if (ticks?.enabled) {
                    const thick = ticks.thicknessPx ?? 3;
                    const lenPos = ticks.lengthPosPx ?? 8;
                    const lenNeg = ticks.lengthNegPx ?? 8;
                    const side = ticks.side ?? "both";
                    const ends = ticks.ends ?? "both";

                    // Y position = same normal offset as the arrow shaft
                    const y0 = layout.shaft.y + layout.shaft.h / 2;

                    const placeTick = (el, x, dir) => {
                        if (!el) return;
                        el.style.display = "block";
                        el.style.width = `${thick}px`;
                        el.style.height = `${dir > 0 ? lenPos : lenNeg}px`;
                        el.style.left = `${x - thick / 2}px`;
                        el.style.top = `${y0 + (dir > 0 ? 0 : -lenNeg)}px`;
                    };

                    // A end (x = 0)
                    if (ends === "both" || ends === "a") {
                        if (side === "both" || side === "pos")
                            placeTick(dom.tickA_pos, 0, +1);
                        if (side === "both" || side === "neg")
                            placeTick(dom.tickA_neg, 0, -1);
                    }

                    // B end (x = L)
                    if (ends === "both" || ends === "b") {
                        if (side === "both" || side === "pos")
                            placeTick(dom.tickB_pos, layout.L, +1);
                        if (side === "both" || side === "neg")
                            placeTick(dom.tickB_neg, layout.L, -1);
                    }
                }

                show(dom);

                dom.leftHead.style.display = "block";
                dom.rightHead.style.display = "block";

                // Apply head sizes (DOM triangles) to match layout sizes
                dom.applyHeadStyles(
                    dom.leftHead,
                    dom.rightHead,
                    color,
                    def.style?.headW ?? 10,
                    def.style?.headH ?? 14
                );

                // Root transform: place at P and rotate along measurement axis
                dom.root.style.transformOrigin = "0 0";
                dom.root.style.transform =
                    `translate(${layout.origin.x}px, ${layout.origin.y}px) rotate(${layout.angle}rad)`;

                // Shaft
                dom.shaft.style.left = `${layout.shaft.x}px`;
                dom.shaft.style.top = `${layout.shaft.y}px`;
                dom.shaft.style.width = `${layout.shaft.w}px`;
                dom.shaft.style.height = `${layout.shaft.h}px`;
                dom.shaft.style.background = color;

                // Heads
                dom.leftHead.style.left = `${layout.leftHead.x}px`;
                dom.leftHead.style.top = `${layout.leftHead.y}px`;

                dom.rightHead.style.left = `${layout.rightHead.x}px`;
                dom.rightHead.style.top = `${layout.rightHead.y}px`;

                // Pill: center it, and counter-rotate so text is upright
                dom.pill.style.left = `${layout.pill.cx}px`;
                dom.pill.style.top = `${layout.pill.cy}px`;
                dom.pill.style.transformOrigin = "50% 50%";
                dom.pill.style.transform = `translate(-50%, -50%) rotate(${-layout.angle}rad)`;

                // Highlight active scale source
                const isActive = activeScaleId === id;
                dom.pill.style.boxShadow = isActive ? "0 0 0 1px var(--accent)" : "none";

                // Label/value UX:
                // - Put the label in placeholder
                // - Put only the numeric value in value (if we have one)
                // - Don’t overwrite if user is currently editing
                // const v = valuesById?.[id];
                // dom.pill.placeholder = def.label ? `${def.label} (${def.units || ""})`.trim() : "";

                // const isFocused = document.activeElement === dom.pill;
                // if (!isFocused) {
                //     if (v != null && v !== "") {
                //         dom.pill.value = String(v);
                //     } else if (!dom.pill.value) {
                //         dom.pill.value = "";
                //     }
                // }

                const v = valuesById?.[id];
                dom.pill.placeholder = def.label ? `${def.label} (${def.units || ""})`.trim() : "";

                const isFocused = document.activeElement === dom.pill;
                if (!isFocused) {
                    dom.pill.value = (v != null && v !== "") ? `${v}` : "";
                }
                // always set measure id so the binder knows what it is
                dom.pill.dataset.measureId = id;

                // bind only once
                if (dom.pill.dataset.bound !== "1") {
                    dom.pill.dataset.bound = "1";

                    bindMmInputPill(dom.pill, {
                        getMeasureId: () => dom.pill.dataset.measureId,
                        setActive: (on) => {
                            // optional: you can remove this if you prefer highlight only via activeScaleId
                            dom.pill.style.boxShadow = on ? "0 0 0 1px var(--accent)" : "none";
                        },
                        setDebug,
                        onCommit: async (measureId, mmValue) => {
                            await commitMeasurement(measureId, mmValue);
                        },
                    });
                }
            }
        }




        //         // Visual arrow (not interactive)
        //         const rearCenterArrow = document.createElement("div");
        //         rearCenterArrow.id = "rear-center-arrow";
        //         Object.assign(rearCenterArrow.style, {
        //             position: "absolute",
        //             zIndex: 40,
        //             display: "none",
        //             pointerEvents: "none", // IMPORTANT: don't block canvas gestures
        //         });

        //         rearCenterArrow.innerHTML = `
        //   <svg viewBox="0 0 100 20" preserveAspectRatio="none" width="100%" height="100%">
        //     <path d="M8 10 L92 10" stroke="currentColor" stroke-width="2" fill="none"/>
        //     <path d="M8 10 L14 6 L14 14 Z" fill="currentColor"/>
        //     <path d="M92 10 L86 6 L86 14 Z" fill="currentColor"/>
        //   </svg>
        // `;
        //         rearCenterArrow.style.color = cssVar("--text-dark");

        //         // Text input pill (interactive)
        //         const rearCenterInput = document.createElement("input");
        //         rearCenterInput.type = "text";
        //         rearCenterInput.id = "rear-center-input";
        //         rearCenterInput.placeholder = "Rear Center (mm)";
        //         Object.assign(rearCenterInput.style, {
        //             position: "absolute",
        //             zIndex: 50,
        //             display: "none",
        //             padding: "4px 10px",
        //             minWidth: "100px",
        //             textAlign: "center",
        //             background: cssVar("--text-dark"),
        //             border: "0px",
        //             color: cssVar("--text-light"),
        //             fontSize: "13px",
        //             lineHeight: "1.2",
        //             borderRadius: "999px",
        //             pointerEvents: "auto",
        //         });

        // container.appendChild(rearCenterArrow);
        // container.appendChild(rearCenterInput);

        // // Optional nicer focus ring
        // rearCenterInput.addEventListener("focus", () => {
        //     rearCenterInput.style.boxShadow =
        //         "0 0 0 1px var(--accent), 0 0 10px rgba(0, 229, 255, 0.6)";
        // });
        // rearCenterInput.addEventListener("blur", () => {
        //     rearCenterInput.style.boxShadow = "none";
        // });

        // container.appendChild(rearCenterInput);

        // // -------------------------------
        // // Numeric-only + " mm" suffix UX
        // // -------------------------------
        // let lastValidRearCenter = "";
        // const RC_NUMERIC_REGEX = /^\d*\.?\d*$/;

        // // Handle typing (numbers only)
        // rearCenterInput.addEventListener("input", (e) => {
        //     let raw = e.target.value;
        //     // Strip any accidental "mm" typed by user
        //     raw = raw.replace(/mm/i, "").trim();

        //     // Empty allowed
        //     if (raw === "") {
        //         lastValidRearCenter = "";
        //         return;
        //     }

        //     // Accept only simple integers/floats
        //     if (RC_NUMERIC_REGEX.test(raw)) {
        //         lastValidRearCenter = raw;
        //         return;
        //     }

        //     // Invalid → revert
        //     e.target.value = lastValidRearCenter;
        // });

        // // Remove "mm" when focusing so user can edit the number
        // rearCenterInput.addEventListener("focus", (e) => {
        //     const raw = e.target.value.replace(/mm/i, "").trim();
        //     e.target.value = raw;
        // });

        // rearCenterInput.addEventListener("blur", async (e) => {
        //     let raw = e.target.value.replace(/mm/i, "").trim();

        //     // --- Empty allowed ---
        //     if (raw === "") {
        //         lastValidRearCenter = "";
        //         e.target.value = "";
        //         setActiveMeasurementHighlight(rearCenterInput, false);
        //         return;
        //     }

        //     const val = Number.parseFloat(raw);

        //     // --- Validate ---
        //     if (!Number.isFinite(val) || val <= 0) {
        //         lastValidRearCenter = "";
        //         e.target.value = "";
        //         setDebug("Rear center invalid; cleared");
        //         setActiveMeasurementHighlight(rearCenterInput, false);
        //         return;
        //     }

        //     // --- Normalise + suffix ---
        //     const norm = String(val);
        //     lastValidRearCenter = norm;
        //     e.target.value = norm + " mm";

        //     // ============================================================
        //     // 1) Compute scale via measurement system
        //     // ============================================================
        //     const scaleMmPerPx = setScaleFromMeasurement("rear_center", val);
        //     setActiveMeasurementHighlight(
        //         rearCenterInput,
        //         meas.activeScaleKey === "rear_center"
        //     );

        //     // ============================================================
        //     // 2) Push to backend
        //     // ============================================================
        //     try {
        //         if (!bikeId) {
        //             console.warn("[BikeViewer] No bikeId; skipping rear_center PUT");
        //             return;
        //         }

        //         const payload = { rear_center_mm: val };

        //         const res = await BV.putRearCenter({
        //             container,
        //             bikeId,
        //             accessToken,
        //             rearCenterPayload: payload,
        //         });

        //         if (!res.ok) {
        //             const text = await res.text();
        //             console.warn(
        //                 "[BikeViewer] rear_center PUT failed:",
        //                 res.status,
        //                 text
        //             );
        //             setDebug(`Failed to save rear center (${res.status})`);
        //             return;
        //         }

        //         setDebug("Rear center + scale saved ✔");
        //     } catch (err) {
        //         console.error("[BikeViewer] rear_center PUT error:", err);
        //         setDebug("Error saving rear center (see console)");
        //     }
        // });

        // rearCenterInput.addEventListener("blur", async (e) => {
        //     let raw = e.target.value.replace(/mm/i, "").trim();

        //     if (raw === "") {
        //         lastValidRearCenter = "";
        //         e.target.value = "";   // no units when empty
        //         return;
        //     }

        //     const val = Number.parseFloat(raw);

        //     if (!Number.isFinite(val) || val <= 0) {
        //         // Invalid → clear
        //         lastValidRearCenter = "";
        //         e.target.value = "";
        //         setDebug("Rear center invalid; cleared");
        //         return;
        //     }

        //     // Normalised numeric string (e.g. "440" or "440.5")
        //     const norm = String(val);
        //     lastValidRearCenter = norm;
        //     e.target.value = norm + " mm";

        //     // --- 1) Compute scale from current points (if BB + rear axle exist) ---
        //     let scaleMmPerPx = null;
        //     const bbPt = points.find((p) => p.type === "bb" || p.type === "bottom_bracket");
        //     const rearPt = points.find((p) => p.type === "rear_axle");

        //     if (bbPt && rearPt) {
        //         const dx = rearPt.x - bbPt.x;
        //         const dy = rearPt.y - bbPt.y;
        //         const dPx = Math.hypot(dx, dy);
        //         if (dPx > 0) {
        //             scaleMmPerPx = val / dPx;  // mm per image-pixel
        //             container.bikeViewer.scale_mm_per_px = scaleMmPerPx;
        //             setDebug(
        //                 `Rear center set: ${norm} mm, d_px=${dPx.toFixed(
        //                     2
        //                 )}, scale=${scaleMmPerPx.toFixed(6)} mm/px`
        //             );
        //         } else {
        //             setDebug("Rear center set but BB and rear axle coincide; no scale");
        //         }
        //     } else {
        //         setDebug("Rear center set but BB/rear axle point missing");
        //     }

        //     // --- 2) Push to backend ---
        //     try {
        //         if (!bikeId) {
        //             console.warn("[BikeViewer] No bikeId; skipping rear_center PUT");
        //             return;
        //         }
        //         // const API_BASE =
        //         //     container.dataset.backendOrigin ||
        //         //     window.BACKEND_ORIGIN ||
        //         //     "";
        //         // if (!API_BASE) {
        //         //     console.warn("[BikeViewer] No BACKEND_ORIGIN; skipping rear_center PUT");
        //         //     return;
        //         // }

        //         const payload = { rear_center_mm: val };

        //         // const h = { "Content-Type": "application/json" };
        //         // if (accessToken) {
        //         //     h["Authorization"] = `Bearer ${accessToken}`;
        //         // }

        //         // const res = await fetch(`${API_BASE}/bikes/${bikeId}/rear_center`, {
        //         //     method: "PUT",
        //         //     headers: h,
        //         //     credentials: "include",
        //         //     body: JSON.stringify(payload),
        //         // });
        //         const res = await BV.putRearCenter({
        //             container,
        //             bikeId,
        //             accessToken,
        //             rearCenterPayload: payload,
        //         });

        //         if (!res.ok) {
        //             const text = await res.text();
        //             console.warn(
        //                 "[BikeViewer] rear_center PUT failed:",
        //                 res.status,
        //                 res.statusText,
        //                 text
        //             );
        //             setDebug(`Failed to save rear center (${res.status})`);
        //             return;
        //         }

        //         setDebug("Rear center + scale saved ✔");
        //     } catch (err) {
        //         console.error("[BikeViewer] rear_center PUT error:", err);
        //         setDebug("Error saving rear center (see console)");
        //     }
        // });

        // === Shock stroke input box (HTML overlay) ===
        const shockStrokeInput = document.createElement("input");
        shockStrokeInput.type = "text";  // ⬅️ text = no number arrows
        shockStrokeInput.id = "shock-stroke-input";
        shockStrokeInput.placeholder = "Stroke [mm]";

        // --- Styling for a short pill box ---
        Object.assign(shockStrokeInput.style, {
            position: "absolute",
            zIndex: 50,
            display: "none",
            // Layout
            padding: "3px 8px",
            minWidth: "80px",           // ⬅️ narrower
            textAlign: "center",
            whiteSpace: "nowrap",
            // Visuals
            background: cssVar("--text-dark"),
            border: "0px",
            color: cssVar("--text-light"),
            fontSize: "12px",
            lineHeight: "1.2",
            borderRadius: "999px",
            // simple pill, no arrow clipPath
            // clipPath removed
            // transition: "left 0.18s ease, top 0.18s ease",
            pointerEvents: "auto",
        });
        // Optional nicer focus ring
        shockStrokeInput.addEventListener("focus", () => {
            shockStrokeInput.style.boxShadow =
                "0 0 0 1px var(--accent), 0 0 10px rgba(0, 229, 255, 0.6)";
        });
        shockStrokeInput.addEventListener("blur", () => {
            shockStrokeInput.style.boxShadow = "none";
        });
        container.appendChild(shockStrokeInput);
        shockStrokeInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                shockStrokeInput.blur();   // 🔥 triggers the save
            }
        });

        // -------------------------------
        // Numeric-only + " mm" suffix UX
        // -------------------------------
        // somewhere near your other setup code
        let lastValidStroke = "";

        const STROKE_NUMERIC_REGEX = /^\d*\.?\d*$/;

        shockStrokeInput.addEventListener("input", (e) => {
            let raw = e.target.value;
            raw = raw.replace(/mm/i, "").trim();
            if (raw === "") {
                lastValidStroke = "";
                return;
            }
            if (STROKE_NUMERIC_REGEX.test(raw)) {
                lastValidStroke = raw;
                return;
            }
            // revert on invalid
            e.target.value = lastValidStroke;
        });

        shockStrokeInput.addEventListener("focus", (e) => {
            const raw = e.target.value.replace(/mm/i, "").trim();
            e.target.value = raw;
        });

        shockStrokeInput.addEventListener("blur", async (e) => {
            let raw = e.target.value.replace(/mm/i, "").trim();

            if (raw === "") {
                lastValidStroke = "";
                e.target.value = "";
                // clear local stroke
                const shockBody = (bodies || []).find((b) => b.type === "shock");
                if (shockBody) {
                    shockBody.stroke = null;
                    invalidate();
                }
                return;
            }

            const val = Number.parseFloat(raw);
            if (!Number.isFinite(val) || val <= 0) {
                lastValidStroke = "";
                e.target.value = "";
                setDebug("Shock stroke invalid; cleared");
                const shockBody = (bodies || []).find((b) => b.type === "shock");
                if (shockBody) {
                    shockBody.stroke = null;
                    invalidate();
                }
                return;
            }

            const norm = String(val);
            lastValidStroke = norm;
            e.target.value = norm + " mm";

            // --- 1) Update LOCAL shock body immediately ---
            const shockBody = (bodies || []).find((b) => b.type === "shock");
            if (shockBody) {
                shockBody.stroke = val;       // this is what invalidate() reads
            }
            invalidate();;  // 🔥 instant visual update

            // --- 2) Fire-and-forget save to backend ---
            try {
                if (!bikeId) {
                    console.warn("[BikeViewer] No bikeId; skipping stroke PUT");
                    return;
                }
                // const API_BASE =
                //     container.dataset.backendOrigin ||
                //     window.BACKEND_ORIGIN ||
                //     "";
                // if (!API_BASE) {
                //     console.warn("[BikeViewer] No BACKEND_ORIGIN; skipping stroke PUT");
                //     return;
                // }

                // reuse existing bodies payload format
                const payload = {
                    bodies: bodies.map((b) => ({
                        id: b.id,
                        name: b.name,
                        point_ids: b.point_ids,
                        closed: !!b.closed,
                        type: b.type,
                        // include stroke if this is the shock body
                        stroke: b.type === "shock" ? (b.stroke ?? null) : null
                    })),
                };

                // const h = { "Content-Type": "application/json" };
                // if (accessToken) {
                //     h["Authorization"] = `Bearer ${accessToken}`;
                // }

                // const res = await fetch(`${API_BASE}/bikes/${bikeId}/bodies`, {
                //     method: "PUT",
                //     headers: h,
                //     credentials: "include",
                //     body: JSON.stringify(payload),
                // });
                const res = await BV.putBodies({
                    container,
                    bikeId,
                    accessToken,
                    payload: payload,
                });

                const text = await res.text();
                if (!res.ok) {
                    console.warn("[BikeViewer] stroke PUT failed:", res.status, text);
                    setDebug(`Failed to save stroke (${res.status})`);
                    return;
                }

                setDebug("Shock stroke saved ✔");
                // We *don't* call loadBodies() here, because we already updated locally.
            } catch (err) {
                console.error("[BikeViewer] stroke PUT error:", err);
                setDebug("Error saving stroke (see console)");
            }
        });

        // Numeric-only typing
        shockStrokeInput.addEventListener("input", (e) => {
            let raw = e.target.value;
            raw = raw.replace(/mm/i, "").trim();

            if (raw === "") {
                lastValidShockStroke = "";
                return;
            }
            if (STROKE_NUMERIC_REGEX.test(raw)) {
                lastValidShockStroke = raw;
                return;
            }
            // Invalid → revert
            e.target.value = lastValidShockStroke;
        });

        // Remove "mm" when focusing so user can edit just the number
        shockStrokeInput.addEventListener("focus", (e) => {
            const raw = e.target.value.replace(/mm/i, "").trim();
            e.target.value = raw;
        });

        shockStrokeInput.addEventListener("blur", async (e) => {
            let raw = e.target.value.replace(/mm/i, "").trim();

            if (raw === "") {
                lastValidShockStroke = "";
                e.target.value = "";
                return;
            }

            const val = Number.parseFloat(raw);
            if (!Number.isFinite(val) || val <= 0) {
                lastValidShockStroke = "";
                e.target.value = "";
                setDebug("Shock stroke invalid; cleared");
                return;
            }

            const norm = String(val);
            lastValidShockStroke = norm;
            e.target.value = norm + " mm";

            // 1) Store locally on the viewer (optional)
            container.bikeViewer.shock_stroke_mm = val;
            setDebug(`Shock stroke set: ${norm} mm`);

            // 2) Update shock body in local bodies list
            try {
                const bodiesLocal = container.bikeViewer.bodies || bodies || [];
                const shockBody = bodiesLocal.find((b) => b.type === "shock");
                if (!shockBody) {
                    setDebug("No shock body found to update stroke");
                    return;
                }
                shockBody.stroke = val;  // length0 stays as geometry-based

                // 3) Push updated bodies to backend
                if (!bikeId) {
                    console.warn("[BikeViewer] No bikeId; skipping shock stroke PUT");
                    return;
                }

                const API_BASE =
                    container.dataset.backendOrigin ||
                    window.BACKEND_ORIGIN ||
                    "";
                if (!API_BASE) {
                    console.warn("[BikeViewer] No BACKEND_ORIGIN; skipping shock stroke PUT");
                    return;
                }

                const payload = { bodies: bodiesLocal };
                const headers = { "Content-Type": "application/json" };
                if (accessToken) {
                    headers["Authorization"] = `Bearer ${accessToken}`;
                }

                const res = await fetch(`${API_BASE}/bikes/${bikeId}/bodies`, {
                    method: "PUT",
                    headers,
                    credentials: "include",
                    body: JSON.stringify(payload),
                });

                if (!res.ok) {
                    const text = await res.text();
                    console.warn(
                        "[BikeViewer] shock stroke PUT failed:",
                        res.status,
                        res.statusText,
                        text
                    );
                    setDebug(`Failed to save shock stroke (${res.status})`);
                    return;
                }

                // Keep canonical copy on viewer too
                container.bikeViewer.bodies = bodiesLocal;
                setDebug("Shock stroke saved ✔");
            } catch (err) {
                console.error("[BikeViewer] shock stroke PUT error:", err);
                setDebug("Error saving shock stroke (see console)");
            }
        });

        function imageDxDyToMm(dxImg, dyImg) {
            const s = container.bikeViewer?.scale_mm_per_px;
            if (!s) return null;
            const dPx = Math.hypot(dxImg, dyImg);
            return dPx * s;  // mm
        }

        // // Optional: Enter commits + blurs (same behaviour as loss of focus)
        // rearCenterInput.addEventListener("keydown", (e) => {
        //     if (e.key === "Enter") {
        //         e.preventDefault();
        //         rearCenterInput.blur();
        //     }
        // });

        // Crosshair state: stored in canvas CSS coords
        let crosshair = {
            x: null,
            y: null,
            visible: false,
        };
        // Image intrinsic size
        let imgW = 0;
        let imgH = 0;

        // Pan/zoom interaction
        let isPanning = false;
        let panStart = null;

        // Touch interaction
        const touchPoints = new Map();
        let pinchStart = null;

        // --- Debug HUD ---
        const debug = document.createElement("div");
        debug.style.position = "absolute";
        debug.style.left = "8px";
        debug.style.bottom = "8px";
        debug.style.padding = "4px 8px";
        debug.style.borderRadius = "4px";
        debug.style.fontSize = "11px";
        debug.style.background = "rgba(0,0,0,0.6)";
        debug.style.color = "#0ff";
        debug.style.pointerEvents = "none";
        debug.textContent = "BikeViewer: init…";
        container.appendChild(debug);

        // function setDebug(text) {
        //     debug.textContent = text;
        //     log(text);
        // }

        // function updateTypeButtonHighlight() {
        //     const buttons = qsa(".point-type-btn");
        //     const active = activeType || null;

        //     buttons.forEach((btn) => {
        //         const btnType = btn.dataset.pointType;
        //         const labelEl = btn.querySelector(".point-type-label");
        //         const iconEl = btn.querySelector(".point-type-icon");
        //         const isActive = active && btnType === active;

        //         // --- make sure icon forwards clicks to the button (for Reflex on_click) ---
        //         if (iconEl && !iconEl.dataset._clickForwardBound) {
        //             iconEl.addEventListener("click", (ev) => {
        //                 ev.stopPropagation();
        //                 // this will trigger the original button on_click handler
        //                 btn.click();
        //             });
        //             iconEl.dataset._clickForwardBound = "1";
        //         }

        //         if (isActive) {
        //             btn.style.width = "100%";
        //             btn.style.justifyContent = "flex-start";
        //             btn.style.background = "var(--select-dark-50)";
        //             btn.style.boxShadow = "0 0 6px var(--select-dark-50)";
        //             btn.style.borderColor = "#00e5ff";

        //             if (labelEl) {
        //                 labelEl.style.maxWidth = "200px";
        //                 labelEl.style.opacity = "1";
        //                 labelEl.style.marginLeft = "0.35rem";
        //             }
        //         } else {
        //             btn.style.width = "40px";
        //             btn.style.justifyContent = "center";
        //             btn.style.background = "";
        //             btn.style.boxShadow = "";
        //             btn.style.borderColor = "";

        //             if (labelEl) {
        //                 labelEl.style.maxWidth = "0px";
        //                 labelEl.style.opacity = "0";
        //                 labelEl.style.marginLeft = "0";
        //             }
        //         }
        //     });
        // }
        function updateTypeButtonHighlight() {
            BV.updateTypeButtonHighlight(activeType);
        }

        // function updateLinkButtonHighlight() {
        //     const buttons = qsa(".link-type-btn");
        //     if (!buttons.length) return;

        //     buttons.forEach((btn) => {
        //         const labelEl = btn.querySelector(".link-type-label");
        //         const iconEl = btn.querySelector(".link-type-icon");
        //         const btnType = btn.dataset.linkType || btn.dataset.pointType; // safety

        //         // forward icon click to the button (works nicely with Reflex)
        //         if (iconEl && !iconEl.dataset._clickForwardBound) {
        //             iconEl.addEventListener("click", (ev) => {
        //                 ev.stopPropagation();
        //                 btn.click();
        //             });
        //             iconEl.dataset._clickForwardBound = "1";
        //         }

        //         const isActive = connectMode && activeLinkType && btnType === activeLinkType;

        //         if (isActive) {
        //             btn.style.width = "100%";
        //             btn.style.justifyContent = "flex-start";
        //             btn.style.background = "var(--select-dark-50)";
        //             btn.style.boxShadow = "0 0 6px var(--select-dark-50)";
        //             btn.style.borderColor = "#00e5ff";

        //             if (labelEl) {
        //                 labelEl.style.maxWidth = "200px";
        //                 labelEl.style.opacity = "1";
        //                 labelEl.style.marginLeft = "0.35rem";
        //             }
        //         } else {
        //             btn.style.width = "40px";
        //             btn.style.justifyContent = "center";
        //             btn.style.background = "";
        //             btn.style.boxShadow = "";
        //             btn.style.borderColor = "";

        //             if (labelEl) {
        //                 labelEl.style.maxWidth = "0px";
        //                 labelEl.style.opacity = "0";
        //                 labelEl.style.marginLeft = "0";
        //             }
        //         }
        //     });
        // }
        function updateLinkButtonHighlight() {
            BV.updateLinkButtonHighlight(connectMode, activeLinkType);
        }

        // === Geometry helpers ===
        const view = {
            scale: 1,
            tx: 0,
            ty: 0,
            minScale: 1, // fit-to-canvas zoom
            baseTx: 0,   // centred translation at minScale
            baseTy: 0,
        };

        function resizeCanvas() {
            const rect = inner.getBoundingClientRect();
            const dpr = Math.max(1, window.devicePixelRatio || 1);

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = rect.width + "px";
            canvas.style.height = rect.height + "px";

            // Keep current view if we already have one; otherwise fit-once in resetView.
            if (imgW && imgH) {
                resetView();
            } else {
                invalidate();
            }
        }

        function resetView() {
            if (!imgW || !imgH) return;

            const rect = canvas.getBoundingClientRect();
            const wCss = rect.width;
            const hCss = rect.height;

            // --- FIT TO WIDTH ONLY ---
            const scale = wCss / imgW;  // width-fit scale

            const scaledW = imgW * scale;
            const scaledH = imgH * scale;

            // horizontally centred always
            const tx = 0; // or (wCss - scaledW) / 2; but scaledW === wCss

            // vertically center the image (may crop top/bottom)
            const ty = (hCss - scaledH) / 2;

            // Store view state
            view.scale = scale;
            view.minScale = scale;   // minimum zoom is this width-fit state
            view.tx = tx;
            view.ty = ty;

            // Because the image may be shorter/taller than viewport
            clampPan();

            invalidate("View reset (fit-to-width)");
        }

        let panCenterAnimId = null;

        function animatePanToCenter() {
            if (!imgW || !imgH) return;

            // Cancel any existing animation
            if (panCenterAnimId !== null) {
                cancelAnimationFrame(panCenterAnimId);
                panCenterAnimId = null;
            }

            const rect = canvas.getBoundingClientRect();
            const wCss = rect.width;
            const hCss = rect.height;

            // Current scaled image size at the *current* zoom
            const scaledW = imgW * view.scale;
            const scaledH = imgH * view.scale;

            // Target: image centred in the viewport
            const targetTx = (wCss - scaledW) / 2;
            const targetTy = (hCss - scaledH) / 2;

            const startTx = view.tx;
            const startTy = view.ty;
            const duration = 220; // ms
            const t0 = performance.now();

            function step(now) {
                let t = Math.min(1, (now - t0) / duration);
                // easeOutCubic
                const u = 1 - Math.pow(1 - t, 3);

                view.tx = startTx + (targetTx - startTx) * u;
                view.ty = startTy + (targetTy - startTy) * u;

                // If you have clampPan(), keep it:
                if (typeof clampPan === "function") {
                    clampPan();
                }

                invalidate();

                if (t < 1) {
                    panCenterAnimId = requestAnimationFrame(step);
                } else {
                    panCenterAnimId = null;
                }
            }

            panCenterAnimId = requestAnimationFrame(step);
        }

        function clampPanAtMinScale() {
            if (!imgW || !imgH) return;
            if (Math.abs(view.scale - (view.minScale || 1)) > 1e-3) {
                // Only clamp in this special way when we're at min zoom
                return;
            }

            const rect = canvas.getBoundingClientRect();
            const wCss = rect.width;
            const hCss = rect.height;

            const drawW = imgW * view.scale;
            const drawH = imgH * view.scale;

            // --- Horizontal: fit width → no side scrolling at min scale ---
            // If drawW >= wCss, we lock tx so image spans full width
            const minTx = Math.min(0, wCss - drawW);   // usually <= 0
            const maxTx = Math.max(0, wCss - drawW);   // usually 0
            if (view.tx < minTx) view.tx = minTx;
            if (view.tx > maxTx) view.tx = maxTx;

            // --- Vertical: allow sliding between "show top" and "show bottom" ---
            // top-aligned:     ty = 0
            // bottom-aligned:  ty = hCss - drawH (<= 0)
            const minTy = hCss - drawH;  // bottom aligned
            const maxTy = 0;             // top aligned
            if (view.ty < minTy) view.ty = minTy;
            if (view.ty > maxTy) view.ty = maxTy;
        }

        function biasViewTowardsCenter() {
            const minScale = view.minScale || 1;
            // Only start biasing when we're near the reset zoom
            const startBiasScale = minScale * 1.0;  // no bias above this
            if (view.scale > startBiasScale) return;

            // t goes from 1 at startBiasScale → 0 at minScale
            const denom = startBiasScale - minScale || 1;
            let t = (view.scale - minScale) / denom;
            t = Math.max(0, Math.min(1, t));

            // Blend tx,ty towards the centred reset view
            view.tx = t * view.tx + (1 - t) * view.baseTx;
            view.ty = t * view.ty + (1 - t) * view.baseTy;
        }

        // Convert client (screen) -> image coordinates (pixels)
        function clientToImage(clientX, clientY) {
            const rect = canvas.getBoundingClientRect();
            const dpr = Math.max(1, window.devicePixelRatio || 1);
            const xDev = (clientX - rect.left) * dpr;
            const yDev = (clientY - rect.top) * dpr;
            const invScale = 1 / (view.scale * dpr);
            return {
                x: (xDev - view.tx * dpr) * invScale,
                y: (yDev - view.ty * dpr) * invScale,
            };
        }

        function clampPan() {
            if (!imgW || !imgH) return;

            const rect = canvas.getBoundingClientRect();
            const wCss = rect.width;
            const hCss = rect.height;

            const scaledW = imgW * view.scale;
            const scaledH = imgH * view.scale;

            // --- X AXIS ---
            if (scaledW <= wCss + 0.1) {
                // When width fits exactly → lock tx = 0 so we never drift
                view.tx = 0;
            } else {
                // Otherwise clamp normally
                const minTx = wCss - scaledW;
                const maxTx = 0;
                if (view.tx < minTx) view.tx = minTx;
                if (view.tx > maxTx) view.tx = maxTx;
            }

            // --- Y axis ---
            if (scaledH <= hCss) {
                // Image shorter than viewport: keep it centred vertically
                view.ty = (hCss - scaledH) / 2;
            } else {
                // Image taller than viewport: clamp so no empty gaps
                const minTy = hCss - scaledH;
                const maxTy = 0;
                if (view.ty < minTy) view.ty = minTy;
                if (view.ty > maxTy) view.ty = maxTy;
            }
        }

        let relaxAnimationId = null;
        function relaxToBaseView() {
            if (!imgW || !imgH) return;

            // Cancel any existing animation
            if (relaxAnimationId !== null) {
                cancelAnimationFrame(relaxAnimationId);
                relaxAnimationId = null;
            }

            const startScale = view.scale;
            const startTx = view.tx;
            const startTy = view.ty;
            const endScale = view.minScale;
            const endTx = view.baseTx;
            const endTy = view.baseTy;

            // If we're already basically at reset, do nothing
            const eps = 1e-3;
            if (
                Math.abs(startScale - endScale) < eps &&
                Math.abs(startTx - endTx) < 0.5 &&
                Math.abs(startTy - endTy) < 0.5
            ) {
                return;
            }

            const duration = 220; // ms
            const start = performance.now();

            function step(now) {
                const t = Math.min(1, (now - start) / duration);
                // easeOutCubic
                const u = 1 - Math.pow(1 - t, 3);

                view.scale = startScale + (endScale - startScale) * u;
                view.tx = startTx + (endTx - startTx) * u;
                view.ty = startTy + (endTy - startTy) * u;

                invalidate();

                if (t < 1) {
                    relaxAnimationId = requestAnimationFrame(step);
                } else {
                    relaxAnimationId = null;
                }
            }

            relaxAnimationId = requestAnimationFrame(step);
        }

        // Hit-test: nearest point in image space, with ~10px radius on screen
        function findNearestPointIdAtClient(clientX, clientY) {
            const imgPt = clientToImage(clientX, clientY);
            let bestId = null;

            const screenRadiusPx = 10;
            const hitRadiusImg = screenRadiusPx / view.scale;
            const hitRadiusImg2 = hitRadiusImg * hitRadiusImg;

            for (const p of points) {
                const dx = p.x - imgPt.x;
                const dy = p.y - imgPt.y;
                const d2 = dx * dx + dy * dy;
                if (d2 <= hitRadiusImg2) {
                    bestId = p.id;
                }
            }
            return bestId;
        }

        // function findBottomBracketPoint() {
        //     // Adjust these predicates if you use a different type/name for the BB
        //     return (
        //         points.find((p) => p.type === "bb")
        //     );
        // }

        // function findRearAxlePoint() {
        //     // Adjust these predicates if you use a different type/name for the BB
        //     return (
        //         points.find((p) => p.type === "rear_axle")
        //     );
        // }

        // After you’ve defined `bars` and `points` somewhere above invalidate
        function findShockBody() {
            if (!Array.isArray(bodies)) return null;
            return bodies.find((body) => body.type === "shock") || null;
        }

        function findShockBar() {
            const shockBody = findShockBody();
            if (!shockBody || !Array.isArray(bars)) return null;
            return bars.find((bar) => bar.bodyId === shockBody.id) || null;
        }

        // function findShockLinkPoints() {
        //     const shockBody = findShockBody();
        //     if (!shockBody || !Array.isArray(shockBody.point_ids)) return null;

        //     const [a, b] = shockBody.point_ids;
        //     const p1 = points[a];
        //     const p2 = points[b];

        //     if (!p1 || !p2) return null;

        //     return { p1, p2 };
        // }

        function isPointerOverPointToolButton(clientX, clientY) {
            // Check actual pill buttons (point types + link-mode), not the whole panel.
            const pills = document.querySelectorAll(".point-type-btn, .link-type-btn");
            for (const btn of pills) {
                const r = btn.getBoundingClientRect();
                if (
                    clientX >= r.left &&
                    clientX <= r.right &&
                    clientY >= r.top &&
                    clientY <= r.bottom
                ) {
                    return true;
                }
            }
            return false;
        }

        function hitBodyAtClient(clientX, clientY) {
            if (!bodies.length) return null;

            // Convert the tap/click to image coordinates
            const imgPt = clientToImage(clientX, clientY);
            const pxThreshold = 18;                // screen px
            const maxDistImg = pxThreshold / view.scale;
            const maxDist2 = maxDistImg * maxDistImg;

            let bestBodyId = null;
            let bestDist2 = Infinity;

            for (const body of bodies) {
                const ids = Array.isArray(body.point_ids) ? body.point_ids : [];
                if (ids.length < 2) continue;

                // Build segments from consecutive points (and close loop if needed)
                const segIndices = [];
                for (let i = 0; i < ids.length - 1; i++) {
                    segIndices.push([i, i + 1]);
                }
                if (body.closed && ids.length > 2) {
                    segIndices.push([ids.length - 1, 0]);
                }

                for (const [i1, i2] of segIndices) {
                    const p1 = points.find((pt) => pt.id === ids[i1]);
                    const p2 = points.find((pt) => pt.id === ids[i2]);
                    if (!p1 || !p2) continue;

                    // Distance from imgPt to segment p1–p2 in image space
                    const vx = p2.x - p1.x;
                    const vy = p2.y - p1.y;
                    const wx = imgPt.x - p1.x;
                    const wy = imgPt.y - p1.y;
                    const segLen2 = vx * vx + vy * vy;
                    if (segLen2 === 0) {
                        // p1 and p2 coincide: treat as a point
                        const d2pt = wx * wx + wy * wy;
                        if (d2pt < bestDist2 && d2pt <= maxDist2) {
                            bestDist2 = d2pt;
                            bestBodyId = body.id;
                        }
                        continue;
                    }
                    let t = (wx * vx + wy * vy) / segLen2;
                    if (t < 0) t = 0;
                    else if (t > 1) t = 1;
                    const projX = p1.x + t * vx;
                    const projY = p1.y + t * vy;
                    const dx = imgPt.x - projX;
                    const dy = imgPt.y - projY;
                    const d2 = dx * dx + dy * dy;

                    if (d2 < bestDist2 && d2 <= maxDist2) {
                        bestDist2 = d2;
                        bestBodyId = body.id;
                    }
                }
            }

            return bestBodyId;
        }

        // Place a point in image space at a client position
        function drawDotAtClient(x, y) {
            if (!activeType) {
                setDebug("Click ignored: no active point type.");
                return;
            }

            const imgPt = clientToImage(x, y);
            const point = {
                id: `pt_${nextId++}`,
                type: activeType,
                name: null,
                x: imgPt.x,
                y: imgPt.y,
            };
            points.push(point);
            invalidate(
                `Placed point id=${point.id}, type=${point.type}, img=(${imgPt.x.toFixed(
                    1
                )}, ${imgPt.y.toFixed(1)})`
            );
            // setDebug(
            //     `Placed point id=${point.id}, type=${point.type}, img=(${imgPt.x.toFixed(
            //         1
            //     )}, ${imgPt.y.toFixed(1)})`
            // );
            return point;
        }

        // === Nudge controls around selected point (donut with arrows) ===
        const NUDGE_INNER_RADIUS = 32; // px on screen
        const NUDGE_OUTER_RADIUS = 70; // px on screen
        const NUDGE_STEP_IMAGE = 0.5;  // image-space units

        function drawNudgeControlsForSelectedPoint() {
            if (!selectedPointId) return;
            const p = points.find((pt) => pt.id === selectedPointId);
            if (!p) return;

            const dpr = Math.max(1, window.devicePixelRatio || 1);
            const rect = canvas.getBoundingClientRect();

            // Image -> canvas device coords:
            const cx = (view.scale * p.x + view.tx) * dpr;
            const cy = (view.scale * p.y + view.ty) * dpr;
            const innerR = NUDGE_INNER_RADIUS * dpr;
            const outerR = NUDGE_OUTER_RADIUS * dpr;

            ctx.save();

            // --- donut sectors ---
            ctx.globalAlpha = 0.5;
            function drawSector(startDeg, endDeg, fill) {
                const start = (startDeg * Math.PI) / 180;
                const end = (endDeg * Math.PI) / 180;
                ctx.beginPath();
                ctx.arc(cx, cy, outerR, start, end, false);
                ctx.arc(cx, cy, innerR, end, start, true);
                ctx.closePath();
                ctx.fillStyle = fill;
                ctx.fill();
            }

            // Up, Right, Down, Left
            drawSector(-135, -45, cssVar("--accent"));
            drawSector(-45, 45, cssVar("--accent"));
            drawSector(45, 135, cssVar("--accent"));
            drawSector(135, 225, cssVar("--accent"));

            // --- arrows ---
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = cssVar("--accent");

            function drawArrow(angleRad) {
                const baseR = (innerR + outerR) / 2;
                const ax = cx + baseR * Math.cos(angleRad);
                const ay = cy + baseR * Math.sin(angleRad);
                const size = 6 * dpr;
                ctx.save();
                ctx.translate(ax, ay);
                ctx.rotate(angleRad);
                ctx.beginPath();
                ctx.moveTo(-size, -size);
                ctx.lineTo(size, 0);
                ctx.lineTo(-size, size);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            drawArrow((-90 * Math.PI) / 180); // up
            drawArrow(0);                      // right
            drawArrow((90 * Math.PI) / 180);   // down
            drawArrow((180 * Math.PI) / 180);  // left

            // --- Delete icon pill at bottom-right of donut ---
            const deleteRadial = (NUDGE_OUTER_RADIUS + 18) * dpr;  // distance from center
            const deleteAngle = (45 * Math.PI) / 180;              // down-right in canvas coords
            const delCx = cx + deleteRadial * Math.cos(deleteAngle);
            const delCy = cy + deleteRadial * Math.sin(deleteAngle);
            const delR = 15 * dpr;

            // pill background
            ctx.beginPath();
            ctx.arc(delCx, delCy + 5, delR, 0, Math.PI * 2);
            ctx.fillStyle = cssVar("--accent-60");
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // -------- Trash icon (canvas version) --------
            ctx.save();
            ctx.translate(delCx, delCy);
            ctx.scale(dpr, dpr);          // scale for crispness
            ctx.strokeStyle = cssVar("--accent");
            ctx.lineWidth = 1.5;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            // Top line
            ctx.beginPath();
            ctx.moveTo(-9, -2);
            ctx.lineTo(9, -2);
            ctx.stroke();

            // Bin outline
            ctx.beginPath();
            ctx.moveTo(8, -2);
            ctx.lineTo(6.7, 10.4);
            ctx.quadraticCurveTo(6.6, 12, 5, 12);
            ctx.lineTo(-5, 12);
            ctx.quadraticCurveTo(-6.6, 12, -6.7, 10.4);
            ctx.lineTo(-8, -2);
            ctx.stroke();

            // Left vertical
            ctx.beginPath();
            ctx.moveTo(-3, 3);
            ctx.lineTo(-3, 9);
            ctx.stroke();

            // Right vertical
            ctx.beginPath();
            ctx.moveTo(3, 3);
            ctx.lineTo(3, 9);
            ctx.stroke();

            // Handle
            ctx.beginPath();
            ctx.moveTo(-2.5, -4);
            ctx.lineTo(2.5, -4);
            ctx.stroke();

            ctx.restore();
        }

        function drawSelectedBodyOverlay() {
            bodyDeleteHit = null;
            if (!selectedBodyId) return;

            const body = bodies.find((b) => b.id === selectedBodyId);
            if (!body || !Array.isArray(body.point_ids) || body.point_ids.length === 0) {
                return;
            }

            // --- compute bbox in IMAGE coords ---
            let minX = +Infinity;
            let maxX = -Infinity;
            let minY = +Infinity;
            let maxY = -Infinity;
            let found = false;

            for (const pid of body.point_ids) {
                const p = points.find((pt) => pt.id === pid);
                if (!p) continue;
                found = true;
                if (p.x < minX) minX = p.x;
                if (p.x > maxX) maxX = p.x;
                if (p.y < minY) minY = p.y;
                if (p.y > maxY) maxY = p.y;
            }
            if (!found) return;

            const rect = canvas.getBoundingClientRect();
            const dpr = Math.max(1, window.devicePixelRatio || 1);

            // image -> canvas CSS coords
            const minXCss = view.tx + view.scale * minX;
            const maxXCss = view.tx + view.scale * maxX;
            const minYCss = view.ty + view.scale * minY;
            const maxYCss = view.ty + view.scale * maxY;

            // Expand box slightly for aesthetics
            const padCss = 8;
            const xCss = minXCss - padCss;
            const yCss = minYCss - padCss;
            const wCss = (maxXCss - minXCss) + 2 * padCss;
            const hCss = (maxYCss - minYCss) + 2 * padCss;

            // bottom-center for trash icon
            const btnRadiusCss = 16;
            const btnCxCss = xCss + wCss / 2;
            const btnCyCss = yCss + hCss + btnRadiusCss + 6; // just below box

            // store for hit-testing in client coords
            bodyDeleteHit = {
                cx: btnCxCss + rect.left,
                cy: btnCyCss + rect.top,
                r: btnRadiusCss,
            };

            // draw in DEVICE pixels
            const xDev = xCss * dpr;
            const yDev = yCss * dpr;
            const wDev = wCss * dpr;
            const hDev = hCss * dpr;
            const cxDev = btnCxCss * dpr;
            const cyDev = btnCyCss * dpr;
            const rDev = btnRadiusCss * dpr;

            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);

            // --- bounding box ---
            ctx.beginPath();
            ctx.rect(xDev, yDev, wDev, hDev);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "rgba(255, 80, 80, 0.8)";
            ctx.setLineDash([6 * dpr, 4 * dpr]);
            ctx.stroke();
            ctx.setLineDash([]);

            // --- trash circle ---
            ctx.beginPath();
            ctx.arc(cxDev, cyDev, rDev, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = "#ffcc00";
            ctx.stroke();

            // --- trash glyph (similar to your other one) ---
            ctx.translate(cxDev, cyDev);
            ctx.scale(dpr * 0.7, dpr * 0.7);
            ctx.strokeStyle = "#ffcc00";
            ctx.lineWidth = 1.5;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            // top line
            ctx.beginPath();
            ctx.moveTo(-9, -4);
            ctx.lineTo(9, -4);
            ctx.stroke();

            // bin outline
            ctx.beginPath();
            ctx.moveTo(7, -4);
            ctx.lineTo(5.8, 7.4);
            ctx.quadraticCurveTo(5.7, 9, 4, 9);
            ctx.lineTo(-4, 9);
            ctx.quadraticCurveTo(-5.7, 9, -5.8, 7.4);
            ctx.lineTo(-7, -4);
            ctx.stroke();

            // left vertical
            ctx.beginPath();
            ctx.moveTo(-2.5, 0);
            ctx.lineTo(-2.5, 6);
            ctx.stroke();

            // right vertical
            ctx.beginPath();
            ctx.moveTo(2.5, 0);
            ctx.lineTo(2.5, 6);
            ctx.stroke();

            // handle
            ctx.beginPath();
            ctx.moveTo(-2, -6);
            ctx.lineTo(2, -6);
            ctx.stroke();

            ctx.restore();
        }

        function hitNudgeControlAtClient(x, y) {
            if (!selectedPointId) return null;
            const p = points.find((pt) => pt.id === selectedPointId);
            if (!p) return null;

            const rect = canvas.getBoundingClientRect();

            // Image -> screen coords:
            const cxScreen = rect.left + view.scale * p.x + view.tx;
            const cyScreen = rect.top + view.scale * p.y + view.ty;

            const dx = x - cxScreen;
            const dy = y - cyScreen;
            const r = Math.hypot(dx, dy);

            // --- directional nudges: donut ring in screen px ---
            if (r >= NUDGE_INNER_RADIUS && r <= NUDGE_OUTER_RADIUS) {
                let angle = (Math.atan2(dy, dx) * 180) / Math.PI; // -180..180
                if (angle >= -135 && angle < -45) return "up";
                if (angle >= -45 && angle < 45) return "right";
                if (angle >= 45 && angle < 135) return "down";
                if (angle >= 135 || angle < -135) return "left";
            }

            // --- delete icon hit: small circle just outside the donut ---
            const deleteRadial = NUDGE_OUTER_RADIUS + 18;
            const deleteAngle = (45 * Math.PI) / 180;
            const delCxScreen = cxScreen + deleteRadial * Math.cos(deleteAngle);
            const delCyScreen = cyScreen + deleteRadial * Math.sin(deleteAngle);
            const delRScreen = 11; // hit radius in px

            const ddx = x - delCxScreen;
            const ddy = y - delCyScreen;
            const dr = Math.hypot(ddx, ddy);

            if (dr <= delRScreen) {
                return "delete";
            }
            return null;
        }

        function nudgeSelectedPoint(direction) {
            if (!selectedPointId) return;
            const p = points.find((pt) => pt.id === selectedPointId);
            if (!p) return;

            if (direction === "delete") {
                const idx = points.findIndex((pt) => pt.id === selectedPointId);
                if (idx !== -1) {
                    points.splice(idx, 1);
                    selectedPointId = null;
                    draggingPointId = null;
                    invalidate("Point deleted via nudge controls");
                    // save after delete
                    saveNowIfPossible();
                }
                return;
            }

            switch (direction) {
                case "up":
                    p.y -= NUDGE_STEP_IMAGE;
                    break;
                case "down":
                    p.y += NUDGE_STEP_IMAGE;
                    break;
                case "left":
                    p.x -= NUDGE_STEP_IMAGE;
                    break;
                case "right":
                    p.x += NUDGE_STEP_IMAGE;
                    break;
            }
            invalidate(`Nudged ${direction}`);
        }

        // === Backend: load & save ===
        // async function loadInitialPoints() {
        //     if (!bikeId) {
        //         console.warn("[BikeViewer] loadInitialPoints: missing bikeId");
        //         return;
        //     }
        //     // 🔑 Read origin lazily from data- attribute or window
        //     const API_BASE =
        //         container.dataset.backendOrigin ||
        //         window.BACKEND_ORIGIN ||
        //         "";
        //     if (!API_BASE) {
        //         console.warn("[BikeViewer] loadInitialPoints: BACKEND_ORIGIN missing");
        //         return;
        //     }
        //     const headers = {};
        //     if (accessToken) {
        //         headers["Authorization"] = `Bearer ${accessToken}`;
        //     }
        //     try {
        //         const res = await fetch(`${API_BASE}/bikes/${bikeId}`, {
        //             method: "GET",
        //             headers,
        //             credentials: "include",
        //         });
        //         if (!res.ok) {
        //             console.warn("[BikeViewer] loadInitialPoints: status", res.status);
        //             return;
        //         }
        //         const data = await res.json();

        //         // --- points ---
        //         const arr = Array.isArray(data.points) ? data.points : [];

        //         points = arr.map((p, idx) => ({
        //             id: p.id || `pt_${idx + 1}`,
        //             type: p.type || "free",
        //             name: p.name ?? null,
        //             x: p.x,
        //             y: p.y,
        //             coords: Array.isArray(p.coords) ? p.coords.slice() : [],  // NEW
        //         }));

        //         recomputeNextIdFromPoints();

        //         console.log(
        //             "[BikeViewer] Loaded",
        //             points.length,
        //             "points from backend; nextId =",
        //             nextId
        //         );

        //         // --- geometry: rear_center_mm / scale_mm_per_px ---
        //         if (data.geometry && typeof data.geometry.rear_center_mm === "number") {
        //             const rcVal = data.geometry.rear_center_mm;
        //             console.log("[BikeViewer] rear_center_mm from backend:", rcVal);
        //             const input = document.getElementById("rear-center-input");
        //             if (input) {
        //                 const asStr = rcVal.toString();
        //                 // assumes lastValidRearCenter is in scope above
        //                 lastValidRearCenter = asStr;
        //                 input.value = asStr + " mm";
        //             }
        //             if (typeof data.geometry.scale_mm_per_px === "number") {
        //                 const s = data.geometry.scale_mm_per_px;
        //                 container.bikeViewer.scale_mm_per_px = s;
        //                 console.log("[BikeViewer] scale_mm_per_px from backend:", s);
        //             }
        //         }

        //         // --- kinematics: rear axle path (if present) ---
        //         rearAxlePath = [];
        //         const kin = data.kinematics || null;
        //         if (kin && Array.isArray(kin.steps) && kin.steps.length > 0) {
        //             // Prefer explicit rear_axle_point_id from backend
        //             let rearAxleId = kin.rear_axle_point_id || null;

        //             // Fallback: infer from current points by type
        //             if (!rearAxleId) {
        //                 const rearPt = points.find((p) => p.type === "rear_axle");
        //                 if (rearPt) {
        //                     rearAxleId = rearPt.id;
        //                 }
        //             }

        //             if (rearAxleId) {
        //                 rearAxlePath = kin.steps
        //                     .map((step) => {
        //                         const pts = Array.isArray(step.points) ? step.points : [];
        //                         // depending on how you stored it, this might be pt.point_id or pt.id
        //                         const match = pts.find(
        //                             (pt) =>
        //                                 pt.point_id === rearAxleId ||
        //                                 pt.id === rearAxleId
        //                         );
        //                         if (!match) return null;
        //                         return { x: match.x, y: match.y };
        //                     })
        //                     .filter((p) => p !== null);

        //                 console.log(
        //                     "[BikeViewer] Loaded rear axle path with",
        //                     rearAxlePath.length,
        //                     "points"
        //                 );
        //             }
        //         }

        //         invalidate();
        //         setDebug(`Loaded ${points.length} points`);
        //     } catch (err) {
        //         console.error("[BikeViewer] loadInitialPoints error:", err);
        //     }
        // }
        function loadGeometryFromBikeDoc(bikeDoc) {
            const g = bikeDoc?.geometry || {};

            if (typeof g.scale_mm_per_px === "number" && g.scale_mm_per_px > 0) {
                container.bikeViewer.scale_mm_per_px = g.scale_mm_per_px;
            }

            if (typeof g.scale_source === "string") {
                activeScaleMeasurementId = g.scale_source;
            }

            if (typeof g.rear_center_mm === "number") measurementValues.rear_center = g.rear_center_mm;
            if (typeof g.wheelbase_mm === "number") measurementValues.wheelbase = g.wheelbase_mm;
            if (typeof g.front_center_mm === "number") measurementValues.front_center = g.front_center_mm;

            // don’t call invalidate here if you’re going to do it at end of loadInitialPoints
        }

        async function loadInitialPoints() {
            if (!bikeId) {
                console.warn("[BikeViewer] loadInitialPoints: missing bikeId");
                return;
            }
            // const API_BASE =
            //     container.dataset.backendOrigin ||
            //     window.BACKEND_ORIGIN ||
            //     "";
            // if (!API_BASE) {
            //     console.warn("[BikeViewer] loadInitialPoints: BACKEND_ORIGIN missing");
            //     return;
            // }
            // const headers = {};
            // if (accessToken) {
            //     headers["Authorization"] = `Bearer ${accessToken}`;
            // }
            // try {
            //     const res = await fetch(`${API_BASE}/bikes/${bikeId}`, {
            //         method: "GET",
            //         headers,
            //         credentials: "include",
            //     });
            //     if (!res.ok) {
            //         console.warn("[BikeViewer] loadInitialPoints: status", res.status);
            //         return;
            //     }
            //     const data = await res.json();
            try {
                const res = await BV.fetchBike({
                    container,
                    bikeId,
                    accessToken,
                });

                if (!res.ok) {
                    console.warn("[BikeViewer] loadInitialPoints: status", res.status);
                    return;
                }

                const data = await res.json();

                // ---- hydrate measurements + scale from backend ----
                const g = data.geometry || {};
                loadGeometryFromBikeDoc(data)

                // // 1) restore scale + source
                // if (typeof g.scale_mm_per_px === "number" && g.scale_mm_per_px > 0) {
                //     container.bikeViewer.scale_mm_per_px = g.scale_mm_per_px;
                // }

                // if (typeof g.scale_source === "string") {
                //     activeScaleMeasurementId = g.scale_source;
                // }

                // // 2) restore explicitly stored measurement values
                // if (typeof g.rear_center_mm === "number") {
                //     measurementValues.rear_center = g.rear_center_mm;
                // }

                // if (typeof g.front_center_mm === "number") {
                //     measurementValues.front_center = g.front_center_mm;
                // }

                // if (typeof g.wheelbase_mm === "number") {
                //     measurementValues.wheelbase = g.wheelbase_mm;
                // }

                // 3) recompute all other measurements from scale


                // --- points ---
                const arr = Array.isArray(data.points) ? data.points : [];
                points = arr.map((p, idx) => ({
                    id: p.id || `pt_${idx + 1}`,
                    type: p.type || "free",
                    name: p.name ?? null,
                    x: p.x,
                    y: p.y,
                }));
                recomputeNextIdFromPoints();
                console.log(
                    "[BikeViewer] Loaded",
                    points.length,
                    "points from backend; nextId =",
                    nextId
                );

                // --- build trails from coords for *all* points ---
                pointTrails = [];
                arr.forEach((p, idx) => {
                    if (!Array.isArray(p.coords) || p.coords.length === 0) return;
                    pointTrails.push({
                        id: p.id || `pt_${idx + 1}`,
                        type: p.type || "free",
                        coords: p.coords.map((c) => ({
                            x: c.x,
                            y: c.y,
                        })),
                    });
                });
                console.log(
                    "[BikeViewer] Built trails for",
                    pointTrails.length,
                    "points"
                );

                // --- geometry: rear_center_mm / scale_mm_per_px (your existing code) ---
                // if (data.geometry && typeof data.geometry.rear_center_mm === "number") {
                //     const rcVal = data.geometry.rear_center_mm;
                //     console.log("[BikeViewer] rear_center_mm from backend:", rcVal);
                //     const input = document.getElementById("rear-center-input");
                //     if (input) {
                //         const asStr = rcVal.toString();
                //         lastValidRearCenter = asStr;
                //         input.value = asStr + " mm";
                //     }
                //     if (typeof data.geometry.scale_mm_per_px === "number") {
                //         const s = data.geometry.scale_mm_per_px;
                //         container.bikeViewer.scale_mm_per_px = s;
                //         console.log("[BikeViewer] scale_mm_per_px from backend:", s);
                //     }
                // }
                recomputeMeasurementsFromScale();
                invalidate(`Loaded ${points.length} points, ${pointTrails.length} trails`);
            } catch (err) {
                console.error("[BikeViewer] loadInitialPoints error:", err);
            }
        }

        async function loadBodies() {
            if (!bikeId) {
                console.warn("[BikeViewer] loadBodies: missing bikeId");
                return;
            }
            // const API_BASE =
            //     container.dataset.backendOrigin ||
            //     window.BACKEND_ORIGIN ||
            //     "";
            // if (!API_BASE) {
            //     console.warn("[BikeViewer] loadBodies: BACKEND_ORIGIN missing");
            //     return;
            // }
            // const headers = {};
            // if (accessToken) {
            //     headers["Authorization"] = `Bearer ${accessToken}`;
            // }
            // try {
            //     const res = await fetch(`${API_BASE}/bikes/${bikeId}/bodies`, {
            //         method: "GET",
            //         headers,
            //         credentials: "include",
            //     });
            //     if (!res.ok) {
            //         console.warn("[BikeViewer] loadBodies: status", res.status);
            //         return;
            //     }
            //     const data = await res.json();
            //     const arr = Array.isArray(data.bodies) ? data.bodies : [];

            try {
                const res = await BV.fetchBodies({
                    container,
                    bikeId,
                    accessToken,
                });

                if (!res.ok) {
                    console.warn("[BikeViewer] loadBodies: status", res.status);
                    return;
                }

                const data = await res.json();
                const arr = Array.isArray(data.bodies) ? data.bodies : [];




                // 🔹 Keep length0 + stroke from backend
                bodies = arr.map((b, idx) => ({
                    id: b.id || `body_${idx + 1}`,
                    name: b.name ?? null,
                    point_ids: Array.isArray(b.point_ids) ? b.point_ids.slice() : [],
                    closed: !!b.closed,
                    type: b.type || null,
                    length0: typeof b.length0 === "number" ? b.length0 : null,
                    stroke: typeof b.stroke === "number" ? b.stroke : null,
                }));

                // Keep a canonical copy on the viewer for other code (blur handler, etc.)
                container.bikeViewer.bodies = bodies;

                rebuildBarsFromBodies();
                console.log("[BikeViewer] Loaded", bodies.length, "bodies from backend");

                // 🔹 Hydrate shock stroke pill if DB already has a value
                const shockBody = bodies.find(
                    (body) => body.type === "shock" && typeof body.stroke === "number" && body.stroke > 0
                );

                if (shockBody) {
                    const v = shockBody.stroke;
                    const norm = String(v);
                    lastValidShockStroke = norm;          // reuse the same var from the input handler
                    shockStrokeInput.value = norm + " mm";
                    container.bikeViewer.shock_stroke_mm = v;
                    setDebug(`Hydrated shock stroke from backend: ${norm} mm`);
                } else {
                    // No stroke in DB yet → start empty
                    lastValidShockStroke = "";
                    shockStrokeInput.value = "";
                }
                recomputeNextBodyIdFromBodies();
                // Finally redraw everything with the updated bodies + maybe prefilled pill
                invalidate(`Loaded ${bodies.length} bodies`);
            } catch (err) {
                console.error("[BikeViewer] loadBodies error:", err);
            }
        }

        function drawImageLayer(dpr) {
            // view transform already applied
            ctx.drawImage(img, 0, 0, imgW, imgH);
        }

        function drawRearAxlePathLayer() {
            if (!Array.isArray(rearAxlePath) || rearAxlePath.length <= 1) return;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(rearAxlePath[0].x, rearAxlePath[0].y);
            for (let i = 1; i < rearAxlePath.length; i++) {
                const p = rearAxlePath[i];
                ctx.lineTo(p.x, p.y);
            }
            ctx.lineWidth = 3 / view.scale;
            ctx.strokeStyle = cssVar("--accent");
            ctx.setLineDash([8 / view.scale, 6 / view.scale]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }

        function drawBarsLayer(pointById) {
            bars.forEach((bar) => {
                const p1 = pointById.get(bar.a);
                const p2 = pointById.get(bar.b);
                if (!p1 || !p2) return;

                const isSelectedBody = selectedBodyId && bar.bodyId === selectedBodyId;

                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);

                ctx.lineWidth = (isSelectedBody ? 10 : 8) / view.scale;
                ctx.strokeStyle = isSelectedBody
                    ? "rgba(255, 80, 80, 0.95)"
                    : "rgba(255, 80, 80, 0.7)";

                ctx.stroke();
            });
        }

        function drawPointTrailsLayer() {
            pointTrails.forEach((trail) => {
                const coords = trail.coords;
                if (!coords || coords.length < 2) return;

                ctx.beginPath();
                ctx.moveTo(coords[0].x, coords[0].y);
                for (let i = 1; i < coords.length; i++) {
                    ctx.lineTo(coords[i].x, coords[i].y);
                }
                ctx.lineWidth = 5 / view.scale;
                ctx.strokeStyle = "rgba(0, 110, 255, 1)";
                ctx.stroke();
            });
        }

        function drawMeasurementLinesLayer(bbPoint, rearAxlePoint) {
            if (bbPoint) {
                ctx.beginPath();
                ctx.moveTo(bbPoint.x, bbPoint.y + 30);
                ctx.lineTo(bbPoint.x, imgH);
                ctx.lineWidth = 4 / view.scale;
                ctx.strokeStyle = cssVar("--text-dark");
                ctx.stroke();
            }

            if (rearAxlePoint) {
                ctx.beginPath();
                ctx.moveTo(rearAxlePoint.x, rearAxlePoint.y + 30);
                ctx.lineTo(rearAxlePoint.x, imgH);
                ctx.lineWidth = 4 / view.scale;
                ctx.strokeStyle = cssVar("--text-dark");
                ctx.stroke();
            }
        }


        function updateRearCenterUI(bbPoint, rearAxlePoint) {
            if (!(bbPoint && rearAxlePoint)) {
                rearCenterArrow.style.display = "none";
                rearCenterInput.style.display = "none";
                return;
            }

            const rect = canvas.getBoundingClientRect();
            const hCss = rect.height;

            const leftImg = Math.min(bbPoint.x, rearAxlePoint.x);
            const rightImg = Math.max(bbPoint.x, rearAxlePoint.x);

            const leftCss = view.tx + view.scale * leftImg;
            const rightCss = view.tx + view.scale * rightImg;

            // --- Arrow geometry ---
            const arrowHeight = 18;
            const marginBottom = 12;
            const arrowTop = hCss - arrowHeight - marginBottom;

            rearCenterArrow.style.display = "block";
            rearCenterArrow.style.left = `${leftCss}px`;
            rearCenterArrow.style.top = `${arrowTop}px`;
            rearCenterArrow.style.width = `${Math.max(0, rightCss - leftCss)}px`;
            rearCenterArrow.style.height = `${arrowHeight}px`;

            // --- Input pill near midpoint, slightly above arrow ---
            const midCss = (leftCss + rightCss) / 2;

            const pillW = 120;
            const pillH = 28;
            const pillTop = arrowTop - pillH - 8; // 8px gap above arrow

            rearCenterInput.style.display = "block";
            rearCenterInput.style.width = `${pillW}px`;
            rearCenterInput.style.height = `${pillH}px`;
            rearCenterInput.style.left = `${midCss - pillW / 2}px`;
            rearCenterInput.style.top = `${pillTop}px`;
        }
        // function updateRearCenterPill(bbPoint, rearAxlePoint) {
        //     if (bbPoint && rearAxlePoint) {
        //         const rect = canvas.getBoundingClientRect();
        //         const hCss = rect.height;

        //         const bbX = bbPoint.x;
        //         const axleX = rearAxlePoint.x;
        //         const leftImg = Math.min(bbX, axleX);
        //         const rightImg = Math.max(bbX, axleX);

        //         const leftCss = view.tx + view.scale * leftImg;
        //         const rightCss = view.tx + view.scale * rightImg;

        //         const pillWidthCss = rightCss - leftCss;
        //         const pillHeightCss = 30;
        //         const marginBottomCss = 12;
        //         const topCss = hCss - pillHeightCss - marginBottomCss;

        //         rearCenterInput.style.display = "block";
        //         rearCenterInput.style.left = `${leftCss}px`;
        //         rearCenterInput.style.top = `${topCss}px`;
        //         rearCenterInput.style.width = `${pillWidthCss}px`;
        //         rearCenterInput.style.height = `${pillHeightCss}px`;
        //     } else {
        //         rearCenterInput.style.display = "none";
        //     }
        // }
        // function updateRearCenterPill(bbPoint, rearAxlePoint) {
        //     if (!(bbPoint && rearAxlePoint)) {
        //         rearCenterInput.style.display = "none";
        //         return;
        //     }

        //     // helper: image x -> CSS x
        //     const imgXToCss = (xImg) => view.tx + view.scale * xImg;

        //     // Width spans BB <-> axle in IMAGE space (so it tracks pan/zoom)
        //     const leftImg = Math.min(bbPoint.x, rearAxlePoint.x);
        //     const rightImg = Math.max(bbPoint.x, rearAxlePoint.x);

        //     const leftCss = imgXToCss(leftImg);
        //     const rightCss = imgXToCss(rightImg);

        //     const pillWidthCss = Math.max(0, rightCss - leftCss);
        //     const pillHeightCss = 30;
        //     const marginBottomCss = 12;

        //     // Vertical position is UI-anchored (fixed from bottom of the visible canvas)
        //     const hCss = canvas.getBoundingClientRect().height;
        //     const topCss = hCss - pillHeightCss - marginBottomCss;

        //     rearCenterInput.style.display = "block";
        //     rearCenterInput.style.left = `${leftCss}px`;
        //     rearCenterInput.style.top = `${topCss}px`;
        //     rearCenterInput.style.width = `${pillWidthCss}px`;
        //     rearCenterInput.style.height = `${pillHeightCss}px`;
        // }
        // function drawShockOverlayAndPill(pointById) {
        //     const shockBar = findShockBar();
        //     if (!shockBar) {
        //         shockStrokeInput.style.display = "none";
        //         return;
        //     }

        //     const p1 = pointById.get(shockBar.a);
        //     const p2 = pointById.get(shockBar.b);
        //     if (!p1 || !p2) {
        //         shockStrokeInput.style.display = "none";
        //         return;
        //     }

        //     const vx = p2.x - p1.x;
        //     const vy = p2.y - p1.y;
        //     const L = Math.hypot(vx, vy);
        //     if (!(L > 0)) {
        //         shockStrokeInput.style.display = "none";
        //         return;
        //     }

        //     // Unit vectors
        //     const nx = -vy / L;
        //     const ny = vx / L;

        //     const tickScreenLengthPx = 20;
        //     const tickImgLength = tickScreenLengthPx / view.scale;

        //     function drawTick(px, py, color = cssVar("--text-dark"), widthFactor = 1.0) {
        //         ctx.beginPath();
        //         ctx.moveTo(px - nx * tickImgLength, py - ny * tickImgLength);
        //         ctx.lineTo(px + nx * tickImgLength, py + ny * tickImgLength);
        //         ctx.lineWidth = (3 * widthFactor) / view.scale;
        //         ctx.strokeStyle = color;
        //         ctx.stroke();
        //     }

        //     // ticks at eyes
        //     drawTick(p1.x, p1.y);
        //     drawTick(p2.x, p2.y);

        //     // default pill position: right of midpoint (CSS space)
        //     const midX = (p1.x + p2.x) / 2;
        //     const midY = (p1.y + p2.y) / 2;
        //     const midCssX = view.tx + view.scale * midX;
        //     const midCssY = view.ty + view.scale * midY;

        //     let pillWidthCss = 90;
        //     let pillHeightCss = 24;
        //     const offsetRightCss = 12;

        //     let pillLeftCss = midCssX + offsetRightCss;
        //     let pillTopCss = midCssY - pillHeightCss / 2;

        //     // stroke marker (optional)
        //     const shockBody = (bodies || []).find((b) => b.type === "shock");
        //     const strokeMm =
        //         shockBody && typeof shockBody.stroke === "number" && shockBody.stroke > 0
        //             ? shockBody.stroke
        //             : null;

        //     if (strokeMm) {
        //         const scaleMmPerPx = container.bikeViewer?.scale_mm_per_px;
        //         if (!scaleMmPerPx || scaleMmPerPx <= 0) {
        //             setDebug("⚠ Set Rear Centre first — cannot display stroke without scale.");
        //         } else {
        //             const strokeImgDist = strokeMm / scaleMmPerPx;

        //             // Decide fixed vs free eye (same logic you had)
        //             let fixedPt = null;
        //             let freePt = null;

        //             if (p1.type === "fixed" && p2.type !== "fixed") {
        //                 fixedPt = p1; freePt = p2;
        //             } else if (p2.type === "fixed" && p1.type !== "fixed") {
        //                 fixedPt = p2; freePt = p1;
        //             } else if (p1.type === "free" && p2.type !== "free") {
        //                 freePt = p1; fixedPt = p2;
        //             } else if (p2.type === "free" && p1.type !== "free") {
        //                 freePt = p2; fixedPt = p1;
        //             } else {
        //                 fixedPt = p1; freePt = p2;
        //             }

        //             const fx = fixedPt.x - freePt.x;
        //             const fy = fixedPt.y - freePt.y;
        //             const Lff = Math.hypot(fx, fy) || 1.0;
        //             const ufx = fx / Lff;
        //             const ufy = fy / Lff;

        //             const strokeClamped = Math.min(strokeImgDist, Lff);

        //             const cx = freePt.x + ufx * strokeClamped;
        //             const cy = freePt.y + ufy * strokeClamped;

        //             // guide line
        //             ctx.beginPath();
        //             ctx.moveTo(freePt.x, freePt.y);
        //             ctx.lineTo(cx, cy);
        //             ctx.lineWidth = 4 / view.scale;
        //             ctx.strokeStyle = cssVar("--text-dark");
        //             ctx.stroke();

        //             // circle marker
        //             ctx.beginPath();
        //             ctx.arc(cx, cy, 5 / view.scale, 0, Math.PI * 2);
        //             ctx.fillStyle = cssVar("--text-dark");
        //             ctx.lineWidth = 1 / view.scale;
        //             ctx.strokeStyle = cssVar("--text-light");
        //             ctx.fill();
        //             ctx.stroke();

        //             // override pill pos: right of stroke marker
        //             const cxCss = view.tx + view.scale * cx;
        //             const cyCss = view.ty + view.scale * cy;
        //             pillLeftCss = cxCss + offsetRightCss;
        //             pillTopCss = cyCss - pillHeightCss / 2;
        //         }
        //     }

        //     shockStrokeInput.style.display = "block";
        //     shockStrokeInput.style.left = `${pillLeftCss}px`;
        //     shockStrokeInput.style.top = `${pillTopCss}px`;
        //     shockStrokeInput.style.width = `${pillWidthCss}px`;
        //     shockStrokeInput.style.height = `${pillHeightCss}px`;
        // }
        function drawShockOverlay(pointById) {
            const shockBar = findShockBar();
            if (!shockBar) return;

            const p1 = pointById.get(shockBar.a);
            const p2 = pointById.get(shockBar.b);
            if (!p1 || !p2) return;

            const vx = p2.x - p1.x;
            const vy = p2.y - p1.y;
            const L = Math.hypot(vx, vy);
            if (!(L > 0)) return;

            // Unit normal
            const nx = -vy / L;
            const ny = vx / L;

            const tickImgLength = (20 / view.scale);

            // function drawTick(px, py, color = cssVar("--text-dark"), widthFactor = 1.0) {
            //     ctx.beginPath();
            //     ctx.moveTo(px - nx * tickImgLength, py - ny * tickImgLength);
            //     ctx.lineTo(px + nx * tickImgLength, py + ny * tickImgLength);
            //     ctx.lineWidth = (3 * widthFactor) / view.scale;
            //     ctx.strokeStyle = color;
            //     ctx.stroke();
            // }

            // // ticks at eyes
            // drawTick(p1.x, p1.y);
            // drawTick(p2.x, p2.y);

            // Optional: stroke marker + guide line
            const shockBody = (bodies || []).find((b) => b.type === "shock");
            const strokeMm =
                shockBody && typeof shockBody.stroke === "number" && shockBody.stroke > 0
                    ? shockBody.stroke
                    : null;

            if (!strokeMm) return;

            const scaleMmPerPx = container.bikeViewer?.scale_mm_per_px;
            if (!scaleMmPerPx || scaleMmPerPx <= 0) return;

            const strokeImgDist = strokeMm / scaleMmPerPx;

            // Decide fixed vs free eye
            let fixedPt = p1, freePt = p2;
            if (p1.type === "fixed" && p2.type !== "fixed") { fixedPt = p1; freePt = p2; }
            else if (p2.type === "fixed" && p1.type !== "fixed") { fixedPt = p2; freePt = p1; }
            else if (p1.type === "free" && p2.type !== "free") { freePt = p1; fixedPt = p2; }
            else if (p2.type === "free" && p1.type !== "free") { freePt = p2; fixedPt = p1; }

            const fx = fixedPt.x - freePt.x;
            const fy = fixedPt.y - freePt.y;
            const Lff = Math.hypot(fx, fy) || 1.0;
            const ufx = fx / Lff;
            const ufy = fy / Lff;

            const strokeClamped = Math.min(strokeImgDist, Lff);
            const cx = freePt.x + ufx * strokeClamped;
            const cy = freePt.y + ufy * strokeClamped;

            // guide line
            ctx.beginPath();
            ctx.moveTo(freePt.x, freePt.y);
            ctx.lineTo(cx, cy);
            ctx.lineWidth = 4 / view.scale;
            ctx.strokeStyle = cssVar("--text-dark");
            ctx.stroke();

            // circle marker
            ctx.beginPath();
            ctx.arc(cx, cy, 5 / view.scale, 0, Math.PI * 2);
            ctx.fillStyle = cssVar("--text-dark");
            ctx.lineWidth = 1 / view.scale;
            ctx.strokeStyle = cssVar("--text-light");
            ctx.fill();
            ctx.stroke();
        }

        function updateShockStrokePill(pointById) {
            const shockBar = findShockBar();
            if (!shockBar) {
                shockStrokeInput.style.display = "none";
                return;
            }

            const p1 = pointById.get(shockBar.a);
            const p2 = pointById.get(shockBar.b);
            if (!p1 || !p2) {
                shockStrokeInput.style.display = "none";
                return;
            }

            // helper: image -> CSS
            const imageToCss = (xImg, yImg) => ({
                x: view.tx + view.scale * xImg,
                y: view.ty + view.scale * yImg,
            });

            // Default anchor = midpoint
            let ax = (p1.x + p2.x) / 2;
            let ay = (p1.y + p2.y) / 2;

            // If stroke known + scale known, anchor at stroke marker instead
            const shockBody = (bodies || []).find((b) => b.type === "shock");
            const strokeMm =
                shockBody && typeof shockBody.stroke === "number" && shockBody.stroke > 0
                    ? shockBody.stroke
                    : null;

            if (strokeMm) {
                const scaleMmPerPx = container.bikeViewer?.scale_mm_per_px;
                if (scaleMmPerPx && scaleMmPerPx > 0) {
                    const strokeImgDist = strokeMm / scaleMmPerPx;

                    // Decide fixed vs free eye
                    let fixedPt = p1, freePt = p2;
                    if (p1.type === "fixed" && p2.type !== "fixed") { fixedPt = p1; freePt = p2; }
                    else if (p2.type === "fixed" && p1.type !== "fixed") { fixedPt = p2; freePt = p1; }
                    else if (p1.type === "free" && p2.type !== "free") { freePt = p1; fixedPt = p2; }
                    else if (p2.type === "free" && p1.type !== "free") { freePt = p2; fixedPt = p1; }

                    const fx = fixedPt.x - freePt.x;
                    const fy = fixedPt.y - freePt.y;
                    const Lff = Math.hypot(fx, fy) || 1.0;
                    const ufx = fx / Lff;
                    const ufy = fy / Lff;

                    const strokeClamped = Math.min(strokeImgDist, Lff);
                    ax = freePt.x + ufx * strokeClamped;
                    ay = freePt.y + ufy * strokeClamped;
                } else {
                    setDebug("⚠ Set Rear Centre first — cannot display stroke without scale.");
                }
            }

            const { x: axCss, y: ayCss } = imageToCss(ax, ay);

            const pillWidthCss = 90;
            const pillHeightCss = 24;
            const offsetRightCss = 12;

            shockStrokeInput.style.display = "block";
            shockStrokeInput.style.left = `${axCss + offsetRightCss}px`;
            shockStrokeInput.style.top = `${ayCss - pillHeightCss / 2}px`;
            shockStrokeInput.style.width = `${pillWidthCss}px`;
            shockStrokeInput.style.height = `${pillHeightCss}px`;
        }

        function drawPointsLayer() {
            const baseRadiusPx = 6;

            points.forEach((p) => {
                const isSelected = p.id === selectedPointId;
                const inChain = connectMode && connectChain.includes(p.id);

                const screenRadiusPx = baseRadiusPx * (isSelected ? 1.4 : 1.0);
                const radiusImg = screenRadiusPx / view.scale;

                ctx.beginPath();
                ctx.arc(p.x, p.y, radiusImg, 0, Math.PI * 2);

                if (inChain) {
                    ctx.fillStyle = "#35ff99";
                    ctx.strokeStyle = "#003b22";
                    ctx.fill();
                    ctx.stroke();
                } else if (isSelected) {
                    ctx.fillStyle = "#ffffff";
                    ctx.strokeStyle = cssVar("--accent");
                    ctx.lineWidth = 2 / view.scale;
                    ctx.fill();
                    ctx.stroke();
                } else {
                    ctx.fillStyle = cssVar("--accent");
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = 1 / view.scale;
                    ctx.fill();
                    ctx.stroke();
                }
            });
        }

        function drawCrosshairOverlay(dpr) {
            if (!(crosshair.visible && activeType && crosshair.x != null && crosshair.y != null)) return;

            const xDev = crosshair.x * dpr;
            const yDev = crosshair.y * dpr;

            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.strokeStyle = cssVar("--text-dark");
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(xDev, 0);
            ctx.lineTo(xDev, canvas.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, yDev);
            ctx.lineTo(canvas.width, yDev);
            ctx.stroke();

            ctx.restore();
        }

        function drawAll() {
            const dpr = Math.max(1, window.devicePixelRatio || 1);

            // Clear
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (!imgW || !imgH) {
                ctx.fillStyle = "#00e5ff";
                ctx.font = `${12 * dpr}px system-ui`;
                ctx.fillText("BikeViewer: image not ready", 10 * dpr, 20 * dpr);
                return;
            }

            // Precompute point lookup (avoids repeated points.find)
            const pointById = new Map(points.map((p) => [p.id, p]));
            const pointByType = new Map();
            for (const p of points) pointByType.set(p.type, p);

            const bbPoint = pointByType.get("bb") || pointByType.get("bottom_bracket") || null;
            const rearAxlePoint = pointByType.get("rear_axle") || null;

            // Image-space transform
            ctx.setTransform(
                view.scale * dpr,
                0,
                0,
                view.scale * dpr,
                view.tx * dpr,
                view.ty * dpr
            );

            drawImageLayer(dpr);
            drawRearAxlePathLayer();
            drawBarsLayer(pointById);
            drawPointTrailsLayer();

            // const bbPoint = findBottomBracketPoint();
            // const rearAxlePoint = findRearAxlePoint();

            // drawMeasurementLinesLayer(bbPoint, rearAxlePoint);

            // drawShockOverlayAndPill(pointById);
            // image-space
            drawShockOverlay(pointById);
            drawPointsLayer();

            // Screen-space overlays
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            // updateRearCenterPill(bbPoint, rearAxlePoint);
            // updateRearCenterUI(bbPoint, rearAxlePoint);
            updateMeasurementsOverlay({
                container,
                canvas,
                view,
                points,
                cssVar,
                defs: MEASURE_DEFS,
                domMap: measurementDom,
                activeScaleId: activeScaleMeasurementId,
                valuesById: measurementValues,
            });
            updateShockStrokePill(pointById);
            drawNudgeControlsForSelectedPoint();
            drawSelectedBodyOverlay();
            drawCrosshairOverlay(dpr);
        }

        function saveNowIfPossible() {
            // autosave to backend (fire-and-forget)
            try {
                if (
                    container.bikeViewer &&
                    typeof container.bikeViewer.savePoints === "function"
                ) {
                    container.bikeViewer.savePoints();
                }
            } catch (err) {
                console.warn("[BikeViewer] autosave failed:", err);
            }
        }

        // === Zoom ===
        function zoomAtScreenPoint(clientX, clientY, requestedScale) {
            const rect = canvas.getBoundingClientRect();
            const sx = clientX - rect.left;
            const sy = clientY - rect.top;
            const oldScale = view.scale;

            const minScale = view.minScale || 1;
            const maxScale = 4.0;
            const targetScale = Math.min(maxScale, Math.max(minScale, requestedScale));
            if (Math.abs(targetScale - oldScale) < 1e-4) return;

            // Point in image space under the pivot before zoom
            const Qx = (sx - view.tx) / oldScale;
            const Qy = (sy - view.ty) / oldScale;

            view.scale = targetScale;
            view.tx = sx - Qx * view.scale;
            view.ty = sy - Qy * view.scale;

            // Prevent dragging beyond edges at this zoom
            clampPan();
            invalidate();
        }

        function zoomAtImageCenter(requestedScale) {
            const rect = canvas.getBoundingClientRect();
            // Image center in *canvas CSS* coordinates
            const cxCss = view.tx + view.scale * (imgW / 2);
            const cyCss = view.ty + view.scale * (imgH / 2);
            // Convert to client coordinates (what zoomAtScreenPoint expects)
            const pivotX = rect.left + cxCss;
            const pivotY = rect.top + cyCss;
            zoomAtScreenPoint(pivotX, pivotY, requestedScale);
        }

        // function zoomOutToCenter(requestedScale) {
        //     const rect = canvas.getBoundingClientRect();
        //     const oldScale = view.scale;
        //     const minScale = view.minScale || 1;
        //     const maxScale = 4.0;
        //     const newScale = Math.min(maxScale, Math.max(minScale, requestedScale));
        //     if (Math.abs(newScale - oldScale) < 1e-4 && newScale !== minScale) return;

        //     // Canvas center in *canvas CSS* coords
        //     const sx = rect.width / 2;
        //     const sy = rect.height / 2;
        //     // World point currently under canvas center
        //     const Qx = (sx - view.tx) / oldScale;
        //     const Qy = (sy - view.ty) / oldScale;
        //     // What tx,ty would be if we just zoomed about that center
        //     const rawTx = sx - Qx * newScale;
        //     const rawTy = sy - Qy * newScale;

        //     // Blend between "zoomed about current center" and the ideal centred fit
        //     const maxRange = maxScale - minScale || 1;
        //     const t = Math.max(0, Math.min(1, (newScale - minScale) / maxRange));
        //     view.scale = newScale;
        //     view.tx = t * rawTx + (1 - t) * view.baseTx;
        //     view.ty = t * rawTy + (1 - t) * view.baseTy;

        //     invalidate();
        // }

        function distancePointToSegment(px, py, x1, y1, x2, y2) {
            const vx = x2 - x1;
            const vy = y2 - y1;
            const wx = px - x1;
            const wy = py - y1;
            const len2 = vx * vx + vy * vy;
            if (len2 === 0) return Math.hypot(px - x1, py - y1);

            let t = (wx * vx + wy * vy) / len2;
            t = Math.max(0, Math.min(1, t));

            const cx = x1 + t * vx;
            const cy = y1 + t * vy;
            return Math.hypot(px - cx, py - cy);
        }

        function findBodyAtClient(clientX, clientY) {
            // Work in IMAGE space because bars/points are in image coords
            const imgPt = clientToImage(clientX, clientY);
            const tolImg = 8 / view.scale;  // ≈ 8px at current zoom
            let bestBody = null;
            let bestDist = Infinity;

            for (const bar of bars) {
                const p1 = points.find((p) => p.id === bar.a);
                const p2 = points.find((p) => p.id === bar.b);
                if (!p1 || !p2) continue;

                const d = distancePointToSegment(imgPt.x, imgPt.y, p1.x, p1.y, p2.x, p2.y);
                if (d < tolImg && d < bestDist) {
                    bestDist = d;
                    bestBody = bar.bodyId || null;
                }
            }
            return bestBody;
        }

        function recomputeNextBodyIdFromBodies() {
            let maxNum = 0;
            for (const b of bodies) {
                const m = String(b.id || "").match(/body_(\d+)/);
                if (m) {
                    const n = parseInt(m[1], 10);
                    if (!Number.isNaN(n) && n > maxNum) maxNum = n;
                }
            }
            nextBodyId = maxNum + 1;
        }

        function finalizeConnectChainAndSave() {
            if (!connectChain.length) {
                setDebug("Connect chain empty, nothing to save");
                return;
            }
            if (connectChain.length < 2) {
                connectChain = [];
                rebuildBarsFromBodies();
                invalidate("rebuilt bars after finalising connect chain and save");
                return;
            }

            // Use the same logic as everywhere else:
            createBodyFromChain(activeLinkType);
        }

        function createBodyFromChain(linkType) {
            if (!connectChain.length) return;

            if (connectChain.length < 2) {
                connectChain = [];
                rebuildBarsFromBodies();
                invalidate("Bars not rebuilt with no second point");
                return;
            }

            const body = {
                id: `body_${nextBodyId++}`,
                name: null,
                point_ids: connectChain.slice(),
                closed: false,           // open linkage by default
                type: (linkType === "shock" ? "shock" : "bar"),
            };
            if (bodies.some(b => b.id === body.id)) {
                // extremely rare now, but prevents bad writes
                body.id = `body_${nextBodyId++}`;
            }
            bodies.push(body);

            connectChain = [];
            rebuildBarsFromBodies();
            invalidate(
                `bars rebuilt Body ${body.id} [${body.type || "link"}] created with ${body.point_ids.length} points`
            );

            try {
                if (container.bikeViewer && typeof container.bikeViewer.saveBodies === "function") {
                    container.bikeViewer.saveBodies();
                }
            } catch (err) {
                console.warn("[BikeViewer] saveBodies from createBodyFromChain failed:", err);
            }
        }

        // === Pointer handlers ===
        canvas.addEventListener("pointerdown", (e) => {

            // If the pointer is over any point / link pill, ignore this canvas pointerdown
            if (isPointerOverPointToolButton(e.clientX, e.clientY)) {
                setDebug("pointerdown over point/link pill → no point placement / pan");
                return;
            }


            canvas.setPointerCapture(e.pointerId);

            const imgPt = clientToImage(e.clientX, e.clientY);
            setDebug(
                `pointerdown: type=${e.pointerType}, button=${e.button}, x=${e.clientX.toFixed(
                    1
                )}, y=${e.clientY.toFixed(1)}, activeType=${activeType || "none"} | img=(${imgPt.x.toFixed(
                    1
                )}, ${imgPt.y.toFixed(1)})`
            );

            // 1) Nudge controls have highest priority
            const nudgeDir = hitNudgeControlAtClient(e.clientX, e.clientY);
            if (nudgeDir) {
                nudgeSelectedPoint(nudgeDir);
                return;
            }

            // 2) Shared hit-tests (used by mouse + touch)
            const hitPointId = findNearestPointIdAtClient(e.clientX, e.clientY);
            const hitBodyId = hitBodyAtClient(e.clientX, e.clientY);

            // 3) Body delete pill – but ONLY if we did NOT hit a point
            if (!hitPointId && selectedBodyId && bodyDeleteHit) {
                const dx = e.clientX - bodyDeleteHit.cx;
                const dy = e.clientY - bodyDeleteHit.cy;
                if (dx * dx + dy * dy <= bodyDeleteHit.r * bodyDeleteHit.r) {
                    const before = bodies.length;
                    bodies = bodies.filter((b) => b.id !== selectedBodyId);
                    selectedBodyId = null;
                    bodyDeleteHit = null;
                    rebuildBarsFromBodies();
                    invalidate(`bars rebuilt after Deleted body; ${before} → ${bodies.length}`);
                    try {
                        if (
                            container.bikeViewer &&
                            typeof container.bikeViewer.saveBodies === "function"
                        ) {
                            container.bikeViewer.saveBodies();
                        }
                    } catch (err) {
                        console.warn("[BikeViewer] saveBodies from trash failed:", err);
                    }
                    return;
                }
            }

            if (activeType && e.button === 0) {
                const newPoint = drawDotAtClient(e.clientX, e.clientY);
                if (newPoint) {
                    selectedPointId = newPoint.id;
                    draggingPointId = null;
                    selectedBodyId = null;
                    invalidate(`Point placed and selected (mouse) ${newPoint.id}`);
                }
                activeType = null;
                updateTypeButtonHighlight();
                // ✨ hide crosshair now that we’re done placing
                crosshair.visible = false;
                crosshair.x = null;
                crosshair.y = null;
                return;
            }

            // === TOUCH BRANCH ===
            if (e.pointerType === "touch") {
                touchPoints.set(e.pointerId, { x: e.clientX, y: e.clientY });

                // Two-finger pinch
                if (touchPoints.size === 2) {
                    const pts = [...touchPoints.values()];
                    const dx = pts[1].x - pts[0].x;
                    const dy = pts[1].y - pts[0].y;
                    const dist = Math.hypot(dx, dy);
                    const cx = (pts[0].x + pts[1].x) / 2;
                    const cy = (pts[0].y + pts[1].y) / 2;
                    pinchStart = { dist, cx, cy, scale: view.scale, tx: view.tx, ty: view.ty };
                    isPanning = false;
                    panStart = null;
                    draggingPointId = null;
                    return;
                }

                // Single-finger
                if (touchPoints.size === 1) {
                    // 4) Link mode (touch) – only if we tapped a point
                    if (connectMode && hitPointId) {
                        const last = connectChain[connectChain.length - 1] || null;
                        if (!last) {
                            connectChain.push(hitPointId);
                            setDebug(`Body (touch): start at ${hitPointId}`);
                        } else if (last !== hitPointId) {
                            connectChain.push(hitPointId);
                            setDebug(`Body (touch): extended to ${hitPointId}`);
                        }
                        // Rebuild bars from existing bodies + temporary chain bars
                        rebuildBarsFromBodies();
                        for (let i = 0; i < connectChain.length - 1; i++) {
                            bars.push({
                                id: `bar_temp_touch_${i}`,
                                a: connectChain[i],
                                b: connectChain[i + 1],
                            });
                        }
                        // invalidate();
                        invalidate("Bars rebuilt by touch");
                        return;
                    }

                    if (connectMode && !hitPointId && !hitBodyId) {
                        finalizeConnectChainAndSave();  // commits if ≥2, discards if <2
                        connectMode = false;
                        connectChain = [];
                        if (typeof window !== "undefined") {
                            window.__link_mode = false;
                        }
                        updateLinkButtonHighlight();
                        setDebug("Connect mode: OFF (touch tap away)");
                        return;
                    }

                    // 5) Place new point (touch) – takes priority if a type is armed
                    //    (and we're NOT in connectMode)
                    if (!connectMode && activeType) {
                        const newPoint = drawDotAtClient(e.clientX, e.clientY);
                        if (newPoint) {
                            selectedPointId = newPoint.id;
                            selectedBodyId = null;   // clear any body selection
                            draggingPointId = null;
                            invalidate(`Point placed and selected (touch) ${newPoint.id}`);
                            // optional autosave:
                            // saveNowIfPossible();
                        }
                        activeType = null;
                        updateTypeButtonHighlight();
                        return;
                    }

                    // 6) Point hit (touch) – points above bodies
                    if (hitPointId) {
                        selectedPointId = hitPointId;
                        draggingPointId = hitPointId;
                        selectedBodyId = null;      // touching a point clears body selection
                        bodyDeleteHit = null;
                        isPanning = false;
                        panStart = null;
                        invalidate(`Selected point ${hitPointId} (touch)`);
                        return;
                    }

                    // 7) If no point but we hit a body, select body
                    if (hitBodyId) {
                        selectedBodyId = hitBodyId;
                        selectedPointId = null;
                        draggingPointId = null;
                        invalidate(`Selected body ${hitBodyId} (touch)`);
                        return;
                    }

                    // 8) Tap away: clear selections and save
                    if (selectedPointId || selectedBodyId) {
                        selectedPointId = null;
                        selectedBodyId = null;
                        draggingPointId = null;
                        bodyDeleteHit = null;
                        invalidate("Deselected point/body (touch)");
                        saveNowIfPossible();
                        try {
                            if (
                                container.bikeViewer &&
                                typeof container.bikeViewer.saveBodies === "function"
                            ) {
                                container.bikeViewer.saveBodies();
                            }
                        } catch (err) {
                            console.warn("[BikeViewer] saveBodies from touch deselect failed:", err);
                        }
                        return;
                    }

                    // 9) If we get here: pan start
                    isPanning = true;
                    panStart = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty };
                    return;
                }

                return;
            }

            // === MOUSE BRANCH ===
            if (e.pointerType === "mouse") {
                // 4) Link mode (mouse) – only if we clicked a point
                if (connectMode && hitPointId) {
                    const last = connectChain[connectChain.length - 1] || null;
                    if (!last) {
                        connectChain.push(hitPointId);
                        setDebug(`Body: start at ${hitPointId}`);
                    } else if (last !== hitPointId) {
                        connectChain.push(hitPointId);
                        setDebug(`Body: extended to ${hitPointId}`);
                    }
                    rebuildBarsFromBodies();
                    for (let i = 0; i < connectChain.length - 1; i++) {
                        bars.push({
                            id: `bar_temp_${i}`,
                            a: connectChain[i],
                            b: connectChain[i + 1],
                        });
                    }
                    invalidate("Bars rebuilt from mouse pointer");
                    return;
                }
                if (connectMode && !hitPointId && !hitBodyId && e.button === 0) {
                    finalizeConnectChainAndSave();  // commits if ≥2, discards if <2
                    connectMode = false;
                    connectChain = [];
                    if (typeof window !== "undefined") {
                        window.__link_mode = false;
                    }
                    updateLinkButtonHighlight();
                    setDebug("Connect mode: OFF (mouse click away)");
                    return;
                }

                // 5) Point hit (mouse) – points above bodies
                if (hitPointId) {
                    selectedPointId = hitPointId;
                    draggingPointId = hitPointId;
                    selectedBodyId = null;
                    bodyDeleteHit = null;
                    isPanning = false;
                    panStart = null;
                    invalidate(`Selected point ${hitPointId} (mouse)`);
                    return;
                }

                // 6) If no point but we hit a body, select body
                if (hitBodyId) {
                    selectedBodyId = hitBodyId;
                    selectedPointId = null;
                    draggingPointId = null;
                    invalidate(`Selected body ${hitBodyId} (mouse)`);
                    return;
                }

                // 7) Click away: clear selections and save
                if (selectedPointId || selectedBodyId) {
                    selectedPointId = null;
                    selectedBodyId = null;
                    draggingPointId = null;
                    bodyDeleteHit = null;
                    invalidate("Deselected point/body (mouse)");
                    saveNowIfPossible();
                    try {
                        if (
                            container.bikeViewer &&
                            typeof container.bikeViewer.saveBodies === "function"
                        ) {
                            container.bikeViewer.saveBodies();
                        }
                    } catch (err) {
                        console.warn("[BikeViewer] saveBodies from mouse deselect failed:", err);
                    }
                    return;
                }

                // 8) If an activeType is set and we left-clicked empty space, place new point
                if (activeType && e.button === 0) {
                    const newPoint = drawDotAtClient(e.clientX, e.clientY);
                    if (newPoint) {
                        selectedPointId = newPoint.id;
                        draggingPointId = null;
                        selectedBodyId = null;
                        invalidate(`Point placed and selected (mouse) ${newPoint.id}`);
                    }
                    activeType = null;
                    updateTypeButtonHighlight();
                    return;
                }

                // 9) Otherwise: pan
                if (!activeType && e.button === 0) {
                    isPanning = true;
                    panStart = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty };
                }
            }
        });

        canvas.addEventListener("pointermove", (e) => {
            // Mouse move
            if (e.pointerType === "mouse") {
                // Update crosshair position whenever we move over the canvas.
                const rect = canvas.getBoundingClientRect();
                crosshair.x = e.clientX - rect.left;  // canvas CSS coords
                crosshair.y = e.clientY - rect.top;
                crosshair.visible = !!activeType;     // only show when a point type is armed

                // we'll redraw below in all cases where we already call invalidate()
            }

            if (e.pointerType === "touch") {
                if (!touchPoints.has(e.pointerId)) return;
                touchPoints.set(e.pointerId, { x: e.clientX, y: e.clientY });

                if (touchPoints.size === 2 && pinchStart) {
                    const pts = [...touchPoints.values()];
                    const dx = pts[1].x - pts[0].x;
                    const dy = pts[1].y - pts[0].y;
                    const dist = Math.hypot(dx, dy);

                    if (dist > 0 && pinchStart.dist > 0) {
                        const rawFactor = dist / pinchStart.dist;
                        const requestedScale = pinchStart.scale * rawFactor;

                        const minScale = view.minScale || 1;
                        const maxScale = 4.0;
                        const oldScale = view.scale;
                        const zoomingIn = requestedScale > pinchStart.scale + 1e-4;

                        // Pinch center in screen coords
                        const cx = (pts[0].x + pts[1].x) / 2;
                        const cy = (pts[0].y + pts[1].y) / 2;

                        // 🔹 If already at min zoom and user keeps pinching out, pan to center
                        if (!zoomingIn && oldScale <= minScale + 1e-4) {
                            animatePanToCenter();
                            setDebug(
                                `pinch: at min zoom, panning image to center (dist=${dist.toFixed(1)})`
                            );
                            return;
                        }

                        // 🔹 If trying to go past min, clamp at min
                        if (!zoomingIn && requestedScale < minScale) {
                            zoomAtScreenPoint(cx, cy, minScale);
                            if (typeof clampPan === "function") {
                                clampPan();
                            }
                            invalidate(
                                `pinch: clamped to min scale=${view.scale.toFixed(3)}`
                            );
                            return;
                        }

                        // 🔹 Normal clamped pinch zoom
                        const targetScale = Math.min(maxScale, Math.max(minScale, requestedScale));
                        zoomAtScreenPoint(cx, cy, targetScale);
                        if (typeof clampPan === "function") {
                            clampPan();
                        }
                        invalidate(
                            `pinch: dist=${dist.toFixed(1)}, scale=${view.scale.toFixed(
                                3
                            )} @ (${cx.toFixed(1)}, ${cy.toFixed(1)})`
                        );
                    }
                    return;
                }

                if (touchPoints.size === 1 && draggingPointId) {
                    const imgPt = clientToImage(e.clientX, e.clientY);
                    const p = points.find((pt) => pt.id === draggingPointId);
                    if (p) {
                        p.x = imgPt.x;
                        p.y = imgPt.y;
                        invalidate();
                    }
                    return;
                }

                if (touchPoints.size === 1 && isPanning && panStart) {
                    const dx = e.clientX - panStart.x;
                    const dy = e.clientY - panStart.y;
                    view.tx = panStart.tx + dx;
                    view.ty = panStart.ty + dy;
                    clampPan();
                    invalidate();
                }
                return;
            }



            // Mouse move
            if (draggingPointId) {
                const imgPt = clientToImage(e.clientX, e.clientY);
                const p = points.find((pt) => pt.id === draggingPointId);
                if (p) {
                    p.x = imgPt.x;
                    p.y = imgPt.y;
                    invalidate();
                }
                return;
            }

            if (isPanning && panStart) {
                const dx = e.clientX - panStart.x;
                const dy = e.clientY - panStart.y;
                view.tx = panStart.tx + dx;
                view.ty = panStart.ty + dy;
                clampPan();
                invalidate();
            }

            // ✨ NEW: free-move crosshair when in placement mode
            if (e.pointerType === "mouse") {
                if (activeType) {
                    const rect = canvas.getBoundingClientRect();
                    crosshair.x = e.clientX - rect.left;
                    crosshair.y = e.clientY - rect.top;
                    crosshair.visible = true;
                } else {
                    crosshair.visible = false;
                    crosshair.x = null;
                    crosshair.y = null;
                }
                invalidate();
            }


        });

        canvas.addEventListener("pointerleave", () => {
            crosshair.visible = false;
            crosshair.x = null;
            crosshair.y = null;
            invalidate();
        });

        // rearCenterInput.addEventListener("change", () => {
        //     const mm = parseFloat(rearCenterInput.value);
        //     if (!isNaN(mm)) {
        //         console.log("Rear center length entered:", mm);
        //         // TODO: store mm, compute scale factor, update scaling etc.
        //     }
        // });

        function endPointer(e) {
            const msg = `pointerend: type=${e.pointerType}, button=${e.button}`;
            setDebug(msg);

            try {
                canvas.releasePointerCapture(e.pointerId);
            } catch (_) {
                // ignore if not captured
            }

            const wasDragging = !!draggingPointId;

            if (e.pointerType === "touch") {
                touchPoints.delete(e.pointerId);
                // No relaxToBaseView – user keeps the zoom/pan they left
                pinchStart = null;
            }

            if (e.pointerType === "mouse") {
                // No relaxToBaseView here either
            }

            isPanning = false;
            panStart = null;
            draggingPointId = null;

            if (wasDragging) {
                saveNowIfPossible();
            }
        }

        canvas.addEventListener("pointerup", endPointer);
        canvas.addEventListener("pointercancel", endPointer);

        canvas.addEventListener(
            "wheel",
            (e) => {
                e.preventDefault();

                const factor = Math.pow(1.0015, -e.deltaY);
                const oldScale = view.scale;
                const requestedScale = oldScale * factor;
                const minScale = view.minScale || 1;
                const maxScale = 4.0;
                const zoomingIn = factor > 1;

                // 🔹 If we are already at min zoom and user tries to zoom out more,
                //     don't change scale – instead pan to image center.
                if (!zoomingIn && oldScale <= minScale + 1e-4) {
                    animatePanToCenter();
                    setDebug("At min zoom: panning image back to center");
                    return;
                }

                // 🔹 If zooming out past the min scale, clamp to min and stop there
                if (!zoomingIn && requestedScale < minScale) {
                    zoomAtScreenPoint(e.clientX, e.clientY, minScale);
                    if (typeof clampPan === "function") {
                        clampPan();
                    }
                    invalidate(
                        `wheel: clamped to min scale=${view.scale.toFixed(3)}`
                    );
                    return;
                }

                // 🔹 Normal zoom (within [minScale, maxScale])
                const targetScale = Math.min(maxScale, Math.max(minScale, requestedScale));
                zoomAtScreenPoint(e.clientX, e.clientY, targetScale);

                if (typeof clampPan === "function") {
                    clampPan();
                }
                invalidate(
                    `wheel: deltaY=${e.deltaY.toFixed(2)}, scale=${view.scale.toFixed(3)}`
                );

            },
            { passive: false }
        );

        const KEY_NUDGE = 0.5;
        window.addEventListener("keydown", (e) => {
            const ae = document.activeElement;
            if (
                ae &&
                (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA" || ae.isContentEditable)
            ) {
                return; // ignore typing in inputs
            }

            // === ESCAPE CANCELS POINT-PLACEMENT MODE ===
            if (e.key === "Escape") {
                if (activeType) {
                    activeType = null;

                    // turn off crosshair
                    crosshair.visible = false;
                    crosshair.x = crosshair.y = null;

                    updateTypeButtonHighlight();
                    invalidate("Point placement cancelled (ESC)");
                    return;
                }

                // Optional: also deselect point/body when ESC pressed
                if (selectedPointId || selectedBodyId) {
                    selectedPointId = null;
                    selectedBodyId = null;
                    bodyDeleteHit = null;
                    draggingPointId = null;
                    invalidate("Selection cleared (ESC)");
                    return;
                }

                return;
            }

            // ==== Arrow key nudging (unchanged) ====
            if (!selectedPointId) return;

            let dx = 0;
            let dy = 0;
            switch (e.key) {
                case "ArrowLeft":
                    dx = -KEY_NUDGE;
                    break;
                case "ArrowRight":
                    dx = KEY_NUDGE;
                    break;
                case "ArrowUp":
                    dy = -KEY_NUDGE;
                    break;
                case "ArrowDown":
                    dy = KEY_NUDGE;
                    break;
                default:
                    return;
            }

            e.preventDefault();
            const p = points.find((pt) => pt.id === selectedPointId);
            if (!p) return;
            p.x += dx;
            p.y += dy;
            invalidate();
        });

        // === Image load & bootstrapping ===
        function onImageReady() {
            imgW = img.naturalWidth;
            imgH = img.naturalHeight;

            // We only need the image as a source for drawImage; hide the DOM copy
            img.style.display = "none";

            // setDebug(`Image ready. natural=${imgW}×${imgH}`);

            resizeCanvas();
            invalidate(`Image ready. natural=${imgW}×${imgH}`);

            // Load points from backend once image/view are ready{
            loadInitialPoints();
            loadBodies();
        }

        if (img.complete && img.naturalWidth > 0) {
            onImageReady();
        } else {
            img.addEventListener("load", onImageReady, { once: true });
        }

        window.addEventListener("resize", resizeCanvas);

        async function saveBodiesHelper() {
            if (!bikeId) {
                setDebug("Cannot save bodies: missing bike id");
                console.warn("[BikeViewer] saveBodies: missing bikeId");
                return;
            }

            // const API_BASE =
            //     container.dataset.backendOrigin ||
            //     window.BACKEND_ORIGIN ||
            //     "";
            // if (!API_BASE) {
            //     setDebug("Cannot save bodies: BACKEND_ORIGIN missing");
            //     console.warn("[BikeViewer] saveBodies: BACKEND_ORIGIN missing");
            //     return;
            // }

            const payload = {
                bodies: bodies.map((b) => ({
                    id: b.id,
                    name: b.name ?? null,
                    point_ids: Array.isArray(b.point_ids) ? b.point_ids.slice() : [],
                    closed: !!b.closed,
                    type: b.type || null,  // <-- NEW
                })),
            };

            console.log("[BikeViewer] saveBodies payload:", payload);

            // const h = { "Content-Type": "application/json" };
            // if (accessToken) {
            //     h["Authorization"] = `Bearer ${accessToken}`;
            // } else {
            //     console.warn("[BikeViewer] No access token – bodies request may 401");
            // }

            // try {
            //     setDebug("Saving bodies…");
            //     const res = await fetch(`${API_BASE}/bikes/${bikeId}/bodies`, {
            //         method: "PUT",
            //         headers: h,
            //         credentials: "include",
            //         body: JSON.stringify(payload),
            //     });
            //     const text = await res.text();
            //     console.log(
            //         "[BikeViewer] saveBodies response:",
            //         res.status,
            //         res.statusText,
            //         text
            //     );
            try {
                setDebug("Saving bodies…");

                const res = await BV.putBodies({
                    container,
                    bikeId,
                    accessToken,
                    payload,
                });
                console.log("putBodies returned:", res, "type:", typeof res, "has ok?", res?.ok);
                const text = await res.text();
                console.log("[BikeViewer] saveBodies response:", res.status, res.statusText, text);

                if (!res.ok) {
                    setDebug(`Save bodies failed (${res.status})`);
                    return;
                }
                setDebug("Bodies saved ✔");
            } catch (err) {
                console.error("[BikeViewer] saveBodies error:", err);
                setDebug("Bodies save error (see console)");
            }
        }

        // === Public API for Reflex hooks ===
        container.bikeViewer = {
            ping() {
                setDebug("bikeViewer.ping() called from console");
            },
            setType(type, options) {
                const newType = type ? String(type) : null;
                const opts = options || {};

                // --- If we were in link mode, finalise/discard chain and turn it off ---
                if (connectMode) {
                    if (connectChain.length >= 2) {
                        // OLD inline body creation here
                        createBodyFromChain(activeLinkType);
                    } else if (connectChain.length > 0) {
                        connectChain = [];
                        rebuildBarsFromBodies();
                        invalidate(
                            "Discarding partial link chain (link mode cancelled via type change)"
                        );
                    }
                    connectMode = false;
                    activeLinkType = null;
                    if (typeof window !== "undefined") {
                        window.__link_mode = false;
                    }
                    updateLinkButtonHighlight();
                }

                // --- Toggle behaviour: click same type again => cancel placement ---
                if (activeType === newType) {
                    activeType = null;
                    if (typeof crosshair !== "undefined") {
                        crosshair.visible = false;
                        crosshair.x = null;
                        crosshair.y = null;
                    }
                    updateTypeButtonHighlight();
                    invalidate("Point placement cancelled (button toggle)");
                    return;
                }

                // --- Switch to a new point type ---
                activeType = newType;
                if (typeof crosshair !== "undefined") {
                    crosshair.visible = !!activeType;
                    if (!activeType) {
                        crosshair.x = null;
                        crosshair.y = null;
                    }
                }
                updateTypeButtonHighlight();
                log("Point type set to:", activeType);
                invalidate("Active type: " + (activeType || "none"));
            },

            resetView() {
                resetView();
            },

            // --- NEW: link-type tool (rigid / shock) ---
            setLinkType(type, options) {
                const newType = type ? String(type) : null;
                const opts = options || {};

                // If we were in point-placement mode, turn that off
                if (activeType) {
                    activeType = null;
                    if (typeof crosshair !== "undefined") {
                        crosshair.visible = false;
                        crosshair.x = null;
                        crosshair.y = null;
                    }
                    updateTypeButtonHighlight();
                }

                // If we’re already in link mode…
                if (connectMode) {
                    // Clicking the same link type again => toggle OFF (commit/discard chain)
                    if (activeLinkType === newType) {
                        if (connectChain.length >= 2) {
                            createBodyFromChain(activeLinkType);
                        } else if (connectChain.length > 0) {
                            connectChain = [];
                            rebuildBarsFromBodies();
                            invalidate("Discarding partial link chain (link tool toggled off)");
                        }
                        connectMode = false;
                        activeLinkType = null;
                        connectChain = [];
                        if (typeof window !== "undefined") {
                            window.__link_mode = false;
                        }
                        updateLinkButtonHighlight();
                        setDebug("Link mode: OFF");
                        return;
                    }

                    // Switching from one link type to another while link mode is ON
                    if (connectChain.length >= 2) {
                        createBodyFromChain(activeLinkType);
                    } else if (connectChain.length > 0) {
                        connectChain = [];
                        rebuildBarsFromBodies();
                        invalidate("Discarding partial link chain (link type changed)");
                    }

                    activeLinkType = newType;
                    if (typeof window !== "undefined") {
                        window.__link_mode = true;
                    }
                    updateLinkButtonHighlight();
                    setDebug("Link mode: ON (" + activeLinkType + ")");
                    return;
                }

                // Not in link mode yet, and user clicked a link tool
                if (newType) {
                    connectMode = true;
                    activeLinkType = newType;
                    connectChain = [];
                    if (typeof window !== "undefined") {
                        window.__link_mode = true;
                    }
                    updateLinkButtonHighlight();
                    setDebug("Link mode: ON (" + activeLinkType + ")");
                    return;
                }

                // newType is null => explicit OFF
                if (connectChain.length >= 2) {
                    createBodyFromChain(activeLinkType);
                } else if (connectChain.length > 0) {
                    connectChain = [];
                    rebuildBarsFromBodies();
                    invalidate("Discarding partial link chain (link tool cleared)");
                }
                connectMode = false;
                activeLinkType = null;
                connectChain = [];
                if (typeof window !== "undefined") {
                    window.__link_mode = false;
                }
                updateLinkButtonHighlight();
                setDebug("Link mode: OFF");
            },

            // Optionally keep a simple toggle for legacy use:
            setConnectMode(on) {
                const newMode = !!on;

                if (!newMode) {
                    // turning OFF
                    if (connectChain.length >= 2) {
                        createBodyFromChain(activeLinkType);
                    } else if (connectChain.length > 0) {
                        connectChain = [];
                        rebuildBarsFromBodies();
                        invalidate("Discarding partial link chain (setConnectMode OFF)");
                    }
                    connectMode = false;
                    connectChain = [];
                    if (typeof window !== "undefined") window.__link_mode = false;
                    updateLinkButtonHighlight();
                    setDebug("Link mode: OFF");
                    return;
                }

                // turning ON (if no activeLinkType, default to "bar")
                if (!activeLinkType) {
                    activeLinkType = "bar";
                }
                connectMode = true;
                connectChain = [];
                if (typeof window !== "undefined") window.__link_mode = true;
                updateLinkButtonHighlight();
                setDebug("Link mode: ON (" + activeLinkType + ")");
            },

            // ---- backend sync helpers ----
            getPoints() {
                return points.map((p) => ({
                    id: p.id,
                    type: p.type,
                    name: p.name ?? null,
                    x: p.x,
                    y: p.y,
                }));
            },

            setPoints(newPoints) {
                points.length = 0;
                let maxId = 0;
                (newPoints || []).forEach((p) => {
                    const idStr = String(p.id ?? "");
                    points.push({
                        id: idStr,
                        type: p.type,
                        name: p.name ?? null,
                        x: Number(p.x),
                        y: Number(p.y),
                    });
                    const m = idStr.match(/pt_(\d+)/);
                    if (m) {
                        const n = parseInt(m[1], 10);
                        if (!Number.isNaN(n)) maxId = Math.max(maxId, n);
                    }
                });
                nextId = Math.max(nextId, maxId + 1);
                invalidate(`Loaded ${points.length} point(s) from backend`);
            },

            // NEW: bars
            getBars() {
                return bars.map((b) => ({ id: b.id, a: b.a, b: b.b }));
            },
            setBars(newBars) {
                bars = (newBars || []).map((b, idx) => ({
                    id: b.id || `bar_${idx + 1}`,
                    a: b.a,
                    b: b.b,
                }));
                invalidate(`Loaded ${bars.length} bar(s) from backend`);
            },

            getBodies() {
                return bodies.map((b) => ({
                    id: b.id,
                    name: b.name ?? null,
                    point_ids: Array.isArray(b.point_ids) ? b.point_ids.slice() : [],
                    closed: !!b.closed,
                    type: b.type || null,   // <-- NEW
                }));
            },

            setBodies(newBodies) {
                bodies = (newBodies || []).map((b, idx) => ({
                    id: b.id || `body_${idx + 1}`,
                    name: b.name ?? null,
                    point_ids: Array.isArray(b.point_ids) ? b.point_ids.slice() : [],
                    closed: !!b.closed,
                    type: b.type || null,   // <-- NEW
                }));
                rebuildBarsFromBodies();
                invalidate(`Loaded ${bodies.length} body(s)`);
            },

            async saveBodies() {
                return saveBodiesHelper();
            },

            async savePoints() {
                if (!bikeId) {
                    setDebug("Cannot save: missing bike id");
                    console.warn("[BikeViewer] savePoints: missing bikeId");
                    return;
                }

                // // Lazily resolve backend origin
                // const API_BASE =
                //     container.dataset.backendOrigin ||
                //     window.BACKEND_ORIGIN ||
                //     "";
                // if (!API_BASE) {
                //     setDebug("Cannot save: BACKEND_ORIGIN missing");
                //     console.warn("[BikeViewer] savePoints: BACKEND_ORIGIN missing");
                //     return;
                // }

                // Only send points – backend ignores connectivity here
                const payload = {
                    points: points.map((p) => ({
                        id: p.id,
                        type: p.type,
                        name: p.name ?? null,
                        x: p.x,
                        y: p.y,
                    })),
                };

                console.log("[BikeViewer] savePoints payload:", payload);

                // const h = { "Content-Type": "application/json" };
                // if (accessToken) {
                //     h["Authorization"] = `Bearer ${accessToken}`;
                // } else {
                //     console.warn("[BikeViewer] No access token found – request will 401");
                // }

                try {
                    setDebug("Saving points…");
                    // const res = await fetch(`${API_BASE}/bikes/${bikeId}/points`, {
                    //     method: "PUT",
                    //     headers: h,
                    //     credentials: "include",
                    //     body: JSON.stringify(payload),
                    // });
                    const res = await BV.putPoints({
                        container,
                        bikeId,
                        accessToken,
                        pointsPayload: payload,
                    });
                    const text = await res.text();
                    console.log(
                        "[BikeViewer] savePoints response:",
                        res.status,
                        res.statusText,
                        text
                    );
                    if (!res.ok) {
                        setDebug(`Save failed (${res.status})`);
                        return;
                    }
                    setDebug("Points saved ✔");
                } catch (err) {
                    console.error("[BikeViewer] savePoints error:", err);
                    setDebug("Save error (see console)");
                }
            },
        };

        setDebug("BikeViewer initialised. Tap/click to place points.");
    };

    // function autoBoot() {
    //     // If index.js is handling boot, skip legacy autoboot
    //     if (window.BIKEVIEWER_USE_INDEX_BOOT === true) {
    //         console.log("[BikeViewer] legacy autoBoot skipped (index.js boot enabled)");
    //         return;
    //     }

    //     const containerId = "bike-viewer-container";
    //     const container = document.getElementById(containerId);
    //     if (!container) {
    //         console.warn("[BikeViewer] autoBoot: container not found yet, will retry...");
    //         setTimeout(autoBoot, 200);
    //         return;
    //     }

    //     if (typeof window.initBikePointsViewer !== "function") {
    //         console.warn("[BikeViewer] autoBoot: initBikePointsViewer not ready yet, will retry...");
    //         setTimeout(autoBoot, 200);
    //         return;
    //     }

    //     window.initBikePointsViewer(containerId, {});
    // }

    // if (document.readyState === "loading") {
    //     document.addEventListener("DOMContentLoaded", autoBoot);
    // } else {
    //     autoBoot();
    // }

    // // Auto-boot
    // function autoBoot() {
    //     const containerId = "bike-viewer-container";
    //     const container = document.getElementById(containerId);
    //     if (!container) {
    //         console.warn("[BikeViewer] autoBoot: container not found yet, will retry...");
    //         setTimeout(autoBoot, 200);
    //         return;
    //     }
    //     window.initBikePointsViewer(containerId, {});
    // }

    // if (document.readyState === "loading") {
    //     document.addEventListener("DOMContentLoaded", autoBoot);
    // } else {
    //     autoBoot();
    // }
    // --- LEGACY AUTO-BOOT (disabled when loaded via index.js) ---

    // Auto-boot (legacy)
    // If window.BIKEVIEWER_MANUAL_BOOT === true, we do NOT auto-boot here.
    // That lets index.js control boot order safely.
    // function autoBoot() {
    //     // Default: skip legacy auto boot. Only auto-boot if explicitly enabled.
    //     if (window.BIKEVIEWER_MANUAL_BOOT !== false) {
    //         console.log("[BikeViewer] legacy autoBoot skipped (index.js will boot)");
    //         return;
    //     }

    //     const containerId = "bike-viewer-container";
    //     const container = document.getElementById(containerId);
    //     if (!container) {
    //         console.warn("[BikeViewer] autoBoot: container not found yet, will retry...");
    //         setTimeout(autoBoot, 200);
    //         return;
    //     }
    //     if (typeof window.initBikePointsViewer !== "function") {
    //         console.error("[BikeViewer] initBikePointsViewer not found (legacy)");
    //         return;
    //     }
    //     window.initBikePointsViewer(containerId, {});
    // }

    // if (document.readyState === "loading") {
    //     document.addEventListener("DOMContentLoaded", autoBoot);
    // } else {
    //     autoBoot();
    // }

})();