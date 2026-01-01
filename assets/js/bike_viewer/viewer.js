export function initBikePointsViewer(container, config = {}) {
    const containerEl =
        typeof container === "string"
            ? document.getElementById(container)
            : container;

    if (!containerEl) {
        console.error("[BikeViewer] initBikePointsViewer: container not found");
        return;
    }

    // 🔒 Single source of truth
    const viewer = (containerEl.bikeViewer ??= {});
    viewer.config = config;

    function makeDefaultState() {
        return {
            _needsDraw: false,

            // ids
            nextId: 1,
            nextBodyId: 1,

            // core data
            points: [],
            bodies: [],
            bars: [],
            rearAxlePath: [],
            pointTrails: [],

            // track which bike this state belongs to
            _bikeId: null,

            // body/link editing state
            connectMode: false,
            connectChain: [],
            selectedBodyId: null,
            bodyDeleteHit: null,
            currentLinkType: null,

            // point editing state
            activeType: null,
            activeLinkType: null,
            selectedPointId: null,
            draggingPointId: null,
        };
    }

    function getState(viewer, bikeId) {
        // Create once if missing
        if (!viewer.state) viewer.state = makeDefaultState();

        // Reset when navigating to a different bike in SPA
        if (bikeId && viewer.state._bikeId !== bikeId) {
            const prev = viewer.state;
            viewer.state = makeDefaultState();
            viewer.state._bikeId = bikeId;
        }
        return viewer.state;
    }

    // IMPORTANT: call this after you’ve resolved bikeId (from dataset/url)
    const bikeId = containerEl.dataset.bikeId || null;
    const state = getState(viewer, bikeId);

    // Initialise expected state ON THE CONTAINER
    viewer.scale_mm_per_px ??= null;
    viewer.activeScaleMeasurementId ??= null;
    viewer.measurementValues ??= {};
    viewer.points ??= [];
    viewer.bodies ??= [];

    // Keep a local alias for readability
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

    // Local aliases so the rest of the file stays unchanged
    const log = (...args) => BV.log(...args);
    const setDebug = (text) => BV.setDebug(containerEl, text);
    const cssVar = (name) => BV.cssVar(name);
    // const qs = (sel, root) => BV.qs(sel, root);
    // const qsa = (sel, root) => BV.qsa(sel, root);
    const inner = containerEl.querySelector("#bike-viewer-inner") || containerEl;
    const img = inner.querySelector("img");

    if (!img) {
        console.error("[BikeViewer] no <img> found inside containerEl");
        return;
    }

    // === Canvas overlay (draws the image + points) ===
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.pointerEvents = "auto";
    canvas.style.touchAction = "none";
    inner.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    // Fallback: parse from URL /bike_analyser/<id>
    if (!bikeId && window.location && window.location.pathname) {
        const m = window.location.pathname.match(/bike_analyser\/([^/]+)/);
        if (m && m[1]) {
            bikeId = m[1];
            console.log("[BikeViewer] Fallback bikeId from URL:", bikeId);
        }
    }

    const accessToken = containerEl.dataset.accessToken || null;

    // Log once so we can see what we actually have
    console.log("[BikeViewer] bikeId from dataset/URL:", bikeId);

    // --- Geometry state ---

    function recomputeNextIdFromPoints() {
        let maxNum = 0;
        for (const p of state.points) {
            const m = String(p.id || "").match(/^pt_(\d+)$/);
            if (!m) continue;
            const n = Number(m[1]);
            if (Number.isFinite(n)) maxNum = Math.max(maxNum, n);
        }
        state.nextId = maxNum + 1;
    }

    // NEW: bodies as per backend schema
    // each body: { id, name, point_ids: [ "pt_1", "pt_2", ... ], closed: bool }
    // state.bars: [{ id, a, b }]

    function rebuildBarsFromBodies() {
        state.bars = [];
        let counter = 1;

        state.bodies.forEach((body) => {
            const ids = Array.isArray(body.point_ids) ? body.point_ids : [];
            if (ids.length < 2) return;

            for (let i = 0; i < ids.length - 1; i++) {
                state.bars.push({
                    id: `bar_${counter++}`,
                    a: ids[i],
                    b: ids[i + 1],
                    bodyId: body.id,
                    bodyType: body.type || null,
                });
            }

            if (body.closed && ids.length > 2) {
                state.bars.push({
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
        for (const p of state.points) {
            out[p.type] = p;

            // Optional aliases (VERY helpful long-term)
            if (p.type === "bottom_bracket") out.bb = p;
            if (p.type === "rear_axle") out.rear_axle = p;
            if (p.type === "front_axle") out.front_axle = p;
        }
        return out;
    }


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

    // crude “effective diameter” including tyre (you can tweak)
    const DEFAULT_TYRE_MM = 60; // ~2.35" tyre ~60mm total added to diameter
    function wheelOuterDiameterMm(beadSeatMm, tyreMm = DEFAULT_TYRE_MM) {
        return beadSeatMm + tyreMm; // diameter
    }

    function mmToPx(mm, scaleMmPerPx) {
        return mm / scaleMmPerPx;
    }

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
        const a = pts?.[aType] || state.points.find((p) => p.type === aType);
        const b = pts?.[bType] || state.points.find((p) => p.type === bType);

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
        viewer.scale_mm_per_px = scaleMmPerPx;

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
        const scale = viewer?.scale_mm_per_px;
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

            const a = pts?.[def.anchors.aType] || state.points.find((p) => p.type === def.anchors.aType);
            const b = pts?.[def.anchors.bType] || state.points.find((p) => p.type === def.anchors.bType);
            if (!a || !b) continue;

            const dPx = pxDistanceForMeasurement(def, a, b);
            if (!(dPx > 0)) continue;

            measurementValues[id] = +(dPx * scale).toFixed(1);
        }
    }
    function recomputeGeometryFromScale() {
        const scale = viewer?.scale_mm_per_px;   // use containerEl consistently
        if (!scale || scale <= 0) return null;

        const pts = getPtsByType();
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

        // 1) derive everything from scale
        for (const id in MEASURE_DEFS) {
            const def = MEASURE_DEFS[id];
            const a = pts?.[def.anchors?.aType];
            const b = pts?.[def.anchors?.bType];
            const dPx = distPx(a, b, def.place?.orientation || "point_to_point");
            if (!dPx || dPx <= 0) continue;

            const mm = +(dPx * scale).toFixed(1);
            measurementValues[id] = mm; // keeps UI in sync for non-active too

            if (id === "rear_center") out.rear_center_mm = mm;
            if (id === "wheelbase") out.wheelbase_mm = mm;
            if (id === "front_center") out.front_center_mm = mm;
        }

        // 2) FORCE the active (user-entered) one into the payload
        const active = activeScaleMeasurementId;
        if (active) {
            const v = measurementValues[active];
            if (typeof v === "number" && v > 0) {
                if (active === "rear_center") out.rear_center_mm = v;
                if (active === "wheelbase") out.wheelbase_mm = v;
                if (active === "front_center") out.front_center_mm = v;
            }
        }

        return out;
    }

    async function commitMeasurement(measureId, mmValue) {
        measurementValues[measureId] = mmValue;
        activeScaleMeasurementId = measureId;

        // 1) compute scale from the edited measurement
        const scale = setScaleFromMeasurement(measureId, mmValue);
        if (!scale) return;

        // 2) recompute ALL derived geometry from the scale (and refresh UI values)
        const geom = recomputeGeometryFromScale();
        if (!geom) return;
        console.log("commit", {
            measureId,
            activeScaleMeasurementId,
            scale: viewer?.scale_mm_per_px,
            pts: Object.keys(getPtsByType?.() || {}),
            geom: geom,
        });
        // 3) push the whole geometry blob
        const res = await BV.putGeometry({ containerEl, bikeId, accessToken, payload: geom });
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

    function makeArrowDom(containerEl, cssVar) {
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
        containerEl.appendChild(root);

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
        containerEl,
        canvas,
        view,
        points,
        cssVar,
        defs,
        domMap,
        activeScaleId,
        valuesById,
    }) {
        // Ensure containerEl is a positioning context
        const cs = getComputedStyle(containerEl);
        if (cs.position === "static") containerEl.style.position = "relative";

        const color = cssVar("--text-dark");

        const hide = (dom) => {
            dom.root.style.display = "none";
        };
        const show = (dom) => {
            dom.root.style.display = "block";
        };

        for (const id in defs) {
            const def = defs[id];
            const dom = domMap[id] || (domMap[id] = makeArrowDom(containerEl, cssVar));

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
    containerEl.appendChild(shockStrokeInput);
    shockStrokeInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            shockStrokeInput.blur();   // 🔥 triggers the save
        }
    });

    // -------------------------------
    // Numeric-only + " mm" suffix UX
    // -------------------------------
    let lastValidShockStroke = "";                 // keep ONE variable name
    const STROKE_NUMERIC_REGEX = /^\d*\.?\d*$/;

    // Typing (numbers only)
    shockStrokeInput.addEventListener("input", (e) => {
        let raw = String(e.target.value || "").replace(/mm/i, "").trim();

        if (raw === "") {
            lastValidShockStroke = "";
            return;
        }
        if (STROKE_NUMERIC_REGEX.test(raw)) {
            lastValidShockStroke = raw;
            return;
        }
        // revert
        e.target.value = lastValidShockStroke;
    });

    // Strip units on focus
    shockStrokeInput.addEventListener("focus", (e) => {
        const raw = String(e.target.value || "").replace(/mm/i, "").trim();
        e.target.value = raw;
    });

    // Commit on blur
    shockStrokeInput.addEventListener("blur", async (e) => {
        let raw = String(e.target.value || "").replace(/mm/i, "").trim();

        // empty clears
        if (raw === "") {
            lastValidShockStroke = "";
            e.target.value = "";

            const shockBody = (state.bodies || []).find((b) => b.type === "shock");
            if (shockBody) shockBody.stroke = null;

            invalidate();
            return;
        }

        const val = Number.parseFloat(raw);
        if (!Number.isFinite(val) || val <= 0) {
            lastValidShockStroke = "";
            e.target.value = "";
            setDebug("Shock stroke invalid; cleared");

            const shockBody = (state.bodies || []).find((b) => b.type === "shock");
            if (shockBody) shockBody.stroke = null;

            invalidate();
            return;
        }

        // normalize + suffix
        const norm = String(val);
        lastValidShockStroke = norm;
        e.target.value = norm + " mm";

        // 1) update local model immediately
        const shockBody = (state.bodies || []).find((b) => b.type === "shock");
        if (shockBody) shockBody.stroke = val;

        invalidate(); // instant visual update

        // 2) save to backend (via BV wrapper)
        try {
            if (!bikeId) {
                console.warn("[BikeViewer] No bikeId; skipping stroke save");
                return;
            }

            const payload = {
                bodies: (state.bodies || []).map((b) => ({
                    id: b.id,
                    name: b.name ?? null,
                    point_ids: Array.isArray(b.point_ids) ? b.point_ids : [],
                    closed: !!b.closed,
                    type: b.type || null,
                    length0: typeof b.length0 === "number" ? b.length0 : null,
                    stroke: b.type === "shock" ? (b.stroke ?? null) : (typeof b.stroke === "number" ? b.stroke : null),
                })),
            };

            const res = await BV.putBodies({
                containerEl,     // IMPORTANT: use containerEl consistently everywhere
                bikeId,
                accessToken,
                payload,
            });

            const text = await res.text();
            if (!res.ok) {
                console.warn("[BikeViewer] stroke PUT failed:", res.status, text);
                setDebug(`Failed to save stroke (${res.status})`);
                return;
            }

            setDebug("Shock stroke saved ✔");
        } catch (err) {
            console.error("[BikeViewer] stroke PUT error:", err);
            setDebug("Error saving stroke (see console)");
        }
    });

    function imageDxDyToMm(dxImg, dyImg) {
        const s = viewer?.scale_mm_per_px;
        if (!s) return null;
        const dPx = Math.hypot(dxImg, dyImg);
        return dPx * s;  // mm
    }

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
    containerEl.appendChild(debug);

    function updateTypeButtonHighlight() {
        BV.updateTypeButtonHighlight(state.activeType);
    }

    function updateLinkButtonHighlight() {
        BV.updateLinkButtonHighlight(state.connectMode, state.activeLinkType);
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

        for (const p of state.points) {
            const dx = p.x - imgPt.x;
            const dy = p.y - imgPt.y;
            const d2 = dx * dx + dy * dy;
            if (d2 <= hitRadiusImg2) {
                bestId = p.id;
            }
        }
        return bestId;
    }

    // After you’ve defined `bars` and `points` somewhere above invalidate
    function findShockBody() {
        if (!Array.isArray(state.bodies)) return null;
        return state.bodies.find((body) => body.type === "shock") || null;
    }

    function findShockBar() {
        const shockBody = findShockBody();
        if (!shockBody || !Array.isArray(state.bars)) return null;
        return state.bars.find((bar) => bar.bodyId === shockBody.id) || null;
    }

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
        if (!state.bodies.length) return null;

        // Convert the tap/click to image coordinates
        const imgPt = clientToImage(clientX, clientY);
        const pxThreshold = 18;                // screen px
        const maxDistImg = pxThreshold / view.scale;
        const maxDist2 = maxDistImg * maxDistImg;

        let bestBodyId = null;
        let bestDist2 = Infinity;

        for (const body of state.bodies) {
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
                const p1 = state.points.find((pt) => pt.id === ids[i1]);
                const p2 = state.points.find((pt) => pt.id === ids[i2]);
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
        if (!state.activeType) {
            setDebug("Click ignored: no active point type.");
            return;
        }

        const imgPt = clientToImage(x, y);
        const point = {
            id: `pt_${state.nextId++}`,
            type: state.activeType,
            name: null,
            x: imgPt.x,
            y: imgPt.y,
        };
        state.points.push(point);
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
        if (!state.selectedPointId) return;
        const p = state.points.find((pt) => pt.id === state.selectedPointId);
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
        state.bodyDeleteHit = null;
        if (!state.selectedBodyId) return;

        const body = state.bodies.find((b) => b.id === state.selectedBodyId);
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
            const p = state.points.find((pt) => pt.id === pid);
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
        state.bodyDeleteHit = {
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
        if (!state.selectedPointId) return null;
        const p = state.points.find((pt) => pt.id === state.selectedPointId);
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
        if (!state.selectedPointId) return;
        const p = state.points.find((pt) => pt.id === state.selectedPointId);
        if (!p) return;

        if (direction === "delete") {
            const idx = state.points.findIndex((pt) => pt.id === state.selectedPointId);
            if (idx !== -1) {
                state.points.splice(idx, 1);
                state.selectedPointId = null;
                state.draggingPointId = null;
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

    function loadGeometryFromBikeDoc(bikeDoc) {
        const g = bikeDoc?.geometry || {};

        if (typeof g.scale_mm_per_px === "number" && g.scale_mm_per_px > 0) {
            viewer.scale_mm_per_px = g.scale_mm_per_px;
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
        try {
            const res = await BV.fetchBike({
                containerEl,
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

            // --- points ---
            const arr = Array.isArray(data.points) ? data.points : [];
            state.points = arr.map((p, idx) => ({
                id: p.id || `pt_${idx + 1}`,
                type: p.type || "free",
                name: p.name ?? null,
                x: p.x,
                y: p.y,
            }));

            recomputeNextIdFromPoints();

            console.log(
                "[BikeViewer] Loaded",
                state.points.length,
                "points from backend; nextId =",
                state.nextId
            );

            // --- build trails from coords for *all* points ---
            state.pointTrails = [];
            arr.forEach((p, idx) => {
                if (!Array.isArray(p.coords) || p.coords.length === 0) return;
                state.pointTrails.push({
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
                state.pointTrails.length,
                "points"
            );

            recomputeMeasurementsFromScale();
            invalidate(`Loaded ${state.points.length} points, ${state.pointTrails.length} trails`);
        } catch (err) {
            console.error("[BikeViewer] loadInitialPoints error:", err);
        }
    }

    async function loadBodies() {
        if (!bikeId) {
            console.warn("[BikeViewer] loadBodies: missing bikeId");
            return;
        }

        try {
            const res = await BV.fetchBodies({
                containerEl: containerEl,
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
            state.bodies = arr.map((b, idx) => ({
                id: b.id || `body_${idx + 1}`,
                name: b.name ?? null,
                point_ids: Array.isArray(b.point_ids) ? b.point_ids.slice() : [],
                closed: !!b.closed,
                type: b.type || null,
                length0: typeof b.length0 === "number" ? b.length0 : null,
                stroke: typeof b.stroke === "number" ? b.stroke : null,
            }));

            // Keep a canonical copy on the viewer for other code (blur handler, etc.)
            viewer.bodies = state.bodies;

            rebuildBarsFromBodies();
            console.log("[BikeViewer] Loaded", state.bodies.length, "bodies from backend");

            // 🔹 Hydrate shock stroke pill if DB already has a value
            const shockBody = state.bodies.find(
                (body) => body.type === "shock" && typeof body.stroke === "number" && body.stroke > 0
            );

            if (shockBody) {
                const v = shockBody.stroke;
                const norm = String(v);
                lastValidShockStroke = norm;          // reuse the same var from the input handler
                shockStrokeInput.value = norm + " mm";
                viewer.shock_stroke_mm = v;
                setDebug(`Hydrated shock stroke from backend: ${norm} mm`);
            } else {
                // No stroke in DB yet → start empty
                lastValidShockStroke = "";
                shockStrokeInput.value = "";
            }
            recomputeNextBodyIdFromBodies();
            // Finally redraw everything with the updated bodies + maybe prefilled pill
            invalidate(`Loaded ${state.bodies.length} bodies`);
        } catch (err) {
            console.error("[BikeViewer] loadBodies error:", err);
        }
    }

    function drawImageLayer(dpr) {
        // view transform already applied
        ctx.drawImage(img, 0, 0, imgW, imgH);
    }

    function drawRearAxlePathLayer() {
        if (!Array.isArray(state.rearAxlePath) || state.rearAxlePath.length <= 1) return;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(state.rearAxlePath[0].x, state.rearAxlePath[0].y);
        for (let i = 1; i < state.rearAxlePath.length; i++) {
            const p = state.rearAxlePath[i];
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
        state.bars.forEach((bar) => {
            const p1 = pointById.get(bar.a);
            const p2 = pointById.get(bar.b);
            if (!p1 || !p2) return;

            const isSelectedBody =
                state.selectedBodyId && bar.bodyId === state.selectedBodyId;

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
        state.pointTrails.forEach((trail) => {
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

        // Optional: stroke marker + guide line
        const shockBody = (state.bodies || []).find((b) => b.type === "shock");
        const strokeMm =
            shockBody && typeof shockBody.stroke === "number" && shockBody.stroke > 0
                ? shockBody.stroke
                : null;

        if (!strokeMm) return;

        const scaleMmPerPx = viewer?.scale_mm_per_px;
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
        const shockBody = (state.bodies || []).find((b) => b.type === "shock");
        const strokeMm =
            shockBody && typeof shockBody.stroke === "number" && shockBody.stroke > 0
                ? shockBody.stroke
                : null;

        if (strokeMm) {
            const scaleMmPerPx = viewer?.scale_mm_per_px;
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

        state.points.forEach((p) => {
            const isSelected = p.id === state.selectedPointId;
            const inChain =
                state.connectMode && state.connectChain.includes(p.id);

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
        if (!(crosshair.visible && state.activeType && crosshair.x != null && crosshair.y != null)) return;

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

    // function drawWheelScaleCirclesLayer() {
    //     const scale = viewer.scale_mm_per_px;
    //     if (!scale || scale <= 0) return;

    //     const pts = getPtsByType(); // { rear_axle, front_axle, ... }
    //     const rear = pts.rear_axle;
    //     const front = pts.front_axle;

    //     // If you want to require “scale is set AND that axle point exists”
    //     if (!rear && !front) return;

    //     // styles
    //     ctx.save();
    //     ctx.lineWidth = 3 / view.scale; // keep constant-ish thickness
    //     ctx.setLineDash([8 / view.scale, 6 / view.scale]); // optional dashed

    //     const drawAt = (pt) => {
    //         if (!pt) return;

    //         for (const w of WHEEL_SIZES) {
    //             const Dmm = wheelOuterDiameterMm(w.beadSeatMm, DEFAULT_TYRE_MM);
    //             const rPx = mmToPx(Dmm * 0.5, scale);

    //             ctx.beginPath();
    //             ctx.arc(pt.x, pt.y, rPx, 0, Math.PI * 2);

    //             // differentiate the two sizes (no hard-coded colors if you don't want)
    //             // simplest: use alpha differences
    //             ctx.strokeStyle = cssVar("--text-dark");
    //             ctx.globalAlpha = w.id === "29" ? 0.55 : 0.30;

    //             ctx.stroke();

    //             // tiny label
    //             ctx.globalAlpha = 0.85;
    //             ctx.font = `${12 / view.scale}px sans-serif`;
    //             ctx.fillStyle = cssVar("--text-dark");
    //             ctx.fillText(w.label, pt.x + (rPx + 6 / view.scale), pt.y);
    //         }
    //     };

    //     drawAt(rear);
    //     drawAt(front);

    //     ctx.restore();
    // }

    const WHEEL_SIZES = [
        { id: "27_5", label: '27.5"', beadSeatMm: 584 },
        { id: "29", label: '29"', beadSeatMm: 622 },
    ];

    function drawWheelScaleCirclesLayer() {
        // mm per px (same source you used in the working one)
        const scale = viewer?.scale_mm_per_px;
        if (!scale || scale <= 0) return;

        // Use the same points array drawAll uses (during refactor)
        const ptsArr = Array.isArray(state.points) ? state.points : [];

        const byType = {};
        for (const p of ptsArr) byType[p.type] = p;

        const rear = byType.rear_axle || null;
        const front = byType.front_axle || null;
        if (!rear && !front) return;

        const tyreMm = 0; // outer diameter allowance
        const mmToPx = (mm) => mm / scale;

        ctx.save();

        // 🔥 visibility-first settings (like your working version)
        ctx.setLineDash([]);            // no dash
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = 6 / view.scale; // fat

        const drawAt = (pt) => {
            if (!pt) return;

            for (const w of WHEEL_SIZES) {
                const diameterMm = w.beadSeatMm + tyreMm;
                const rPx = mmToPx(diameterMm * 0.5);

                ctx.beginPath();
                ctx.arc(pt.x, pt.y, rPx, 0, Math.PI * 2);
                ctx.strokeStyle = "#ff00ff";   // loud magenta
                ctx.stroke();

                ctx.font = `${18 / view.scale}px system-ui`;
                ctx.fillStyle = "#ff00ff";
                ctx.fillText(w.label, pt.x + rPx + (10 / view.scale), pt.y);
            }
        };

        drawAt(rear);
        drawAt(front);

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
        const pointById = new Map(state.points.map((p) => [p.id, p]));
        const pointByType = new Map();
        for (const p of state.points) pointByType.set(p.type, p);

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
        drawShockOverlay(pointById);
        drawPointsLayer();
        drawWheelScaleCirclesLayer();

        // Screen-space overlays
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        updateMeasurementsOverlay({
            containerEl,
            canvas,
            view,
            points: state.points,
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
                viewer &&
                typeof viewer.savePoints === "function"
            ) {
                viewer.savePoints();
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

        for (const bar of state.bars) {
            const p1 = state.points.find((p) => p.id === bar.a);
            const p2 = state.points.find((p) => p.id === bar.b);
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
        for (const b of state.bodies) {
            const m = String(b.id || "").match(/body_(\d+)/);
            if (m) {
                const n = parseInt(m[1], 10);
                if (!Number.isNaN(n) && n > maxNum) maxNum = n;
            }
        }
        state.nextBodyId = maxNum + 1;
    }

    function finalizeConnectChainAndSave() {
        if (!state.connectChain.length) {
            setDebug("Connect chain empty, nothing to save");
            return;
        }
        if (state.connectChain.length < 2) {
            state.connectChain = [];
            rebuildBarsFromBodies();
            invalidate("rebuilt bars after finalising connect chain and save");
            return;
        }

        // Use the same logic as everywhere else:
        createBodyFromChain(state.activeLinkType);
    }

    function createBodyFromChain(linkType) {
        if (!state.connectChain.length) return;

        if (state.connectChain.length < 2) {
            state.connectChain = [];
            rebuildBarsFromBodies();
            invalidate("Bars not rebuilt with no second point");
            return;
        }

        const body = {
            id: `body_${state.nextBodyId++}`,
            name: null,
            point_ids: state.connectChain.slice(),
            closed: false,           // open linkage by default
            type: (linkType === "shock" ? "shock" : "bar"),
        };
        if (state.bodies.some(b => b.id === body.id)) {
            // extremely rare now, but prevents bad writes
            body.id = `body_${state.nextBodyId++}`;
        }
        state.bodies.push(body);

        state.connectChain = [];
        rebuildBarsFromBodies();
        invalidate(
            `bars rebuilt Body ${body.id} [${body.type || "link"}] created with ${body.point_ids.length} points`
        );

        try {
            if (viewer && typeof viewer.saveBodies === "function") {
                viewer.saveBodies();
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
            )}, y=${e.clientY.toFixed(1)}, activeType=${state.activeType || "none"} | img=(${imgPt.x.toFixed(
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
        if (!hitPointId && state.selectedBodyId && state.bodyDeleteHit) {
            const dx = e.clientX - state.bodyDeleteHit.cx;
            const dy = e.clientY - state.bodyDeleteHit.cy;
            if (dx * dx + dy * dy <= state.bodyDeleteHit.r * state.bodyDeleteHit.r) {
                const before = state.bodies.length;
                state.bodies = state.bodies.filter((b) => b.id !== state.selectedBodyId);
                state.selectedBodyId = null;
                state.bodyDeleteHit = null;
                rebuildBarsFromBodies();
                invalidate(
                    `bars rebuilt after Deleted body; ${before} → ${state.bodies.length}`
                );
                try {
                    if (
                        viewer &&
                        typeof viewer.saveBodies === "function"
                    ) {
                        viewer.saveBodies();
                    }
                } catch (err) {
                    console.warn("[BikeViewer] saveBodies from trash failed:", err);
                }
                return;
            }
        }

        if (state.activeType && e.button === 0) {
            const newPoint = drawDotAtClient(e.clientX, e.clientY);
            if (newPoint) {
                state.selectedPointId = newPoint.id;
                state.draggingPointId = null;
                state.selectedBodyId = null;
                invalidate(`Point placed and selected (mouse) ${newPoint.id}`);
            }
            state.activeType = null;
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
                state.draggingPointId = null;
                return;
            }

            // Single-finger
            if (touchPoints.size === 1) {
                // 4) Link mode (touch) – only if we tapped a point
                if (state.connectMode && hitPointId) {
                    const last =
                        state.connectChain[state.connectChain.length - 1] || null;
                    if (!last) {
                        state.connectChain.push(hitPointId);
                        setDebug(`Body (touch): start at ${hitPointId}`);
                    } else if (last !== hitPointId) {
                        state.connectChain.push(hitPointId);
                        setDebug(`Body (touch): extended to ${hitPointId}`);
                    }
                    // Rebuild bars from existing bodies + temporary chain bars
                    rebuildBarsFromBodies();
                    for (let i = 0; i < state.connectChain.length - 1; i++) {
                        state.bars.push({
                            id: `bar_temp_touch_${i}`,
                            a: state.connectChain[i],
                            b: state.connectChain[i + 1],
                        });
                    }
                    // invalidate();
                    invalidate("Bars rebuilt by touch");
                    return;
                }

                if (state.connectMode && !hitPointId && !hitBodyId) {
                    finalizeConnectChainAndSave();  // commits if ≥2, discards if <2
                    state.connectMode = false;
                    state.connectChain = [];
                    if (typeof window !== "undefined") {
                        window.__link_mode = false;
                    }
                    updateLinkButtonHighlight();
                    setDebug("Connect mode: OFF (touch tap away)");
                    return;
                }

                // 5) Place new point (touch) – takes priority if a type is armed
                //    (and we're NOT in connectMode)
                if (!state.connectMode && state.activeType) {
                    const newPoint = drawDotAtClient(e.clientX, e.clientY);
                    if (newPoint) {
                        state.selectedPointId = newPoint.id;
                        state.selectedBodyId = null;   // clear any body selection
                        state.draggingPointId = null;
                        invalidate(`Point placed and selected (touch) ${newPoint.id}`);
                        // optional autosave:
                        // saveNowIfPossible();
                    }
                    state.activeType = null;
                    updateTypeButtonHighlight();
                    return;
                }

                // 6) Point hit (touch) – points above bodies
                if (hitPointId) {
                    state.selectedPointId = hitPointId;
                    state.draggingPointId = hitPointId;
                    state.selectedBodyId = null;      // touching a point clears body selection
                    state.bodyDeleteHit = null;
                    isPanning = false;
                    panStart = null;
                    invalidate(`Selected point ${hitPointId} (touch)`);
                    return;
                }

                // 7) If no point but we hit a body, select body
                if (hitBodyId) {
                    state.selectedBodyId = hitBodyId;
                    state.selectedPointId = null;
                    state.draggingPointId = null;
                    invalidate(`Selected body ${hitBodyId} (touch)`);
                    return;
                }

                // 8) Tap away: clear selections and save
                if (state.selectedPointId || state.selectedBodyId) {
                    state.selectedPointId = null;
                    state.selectedBodyId = null;
                    state.draggingPointId = null;
                    state.bodyDeleteHit = null;
                    invalidate("Deselected point/body (touch)");
                    saveNowIfPossible();
                    try {
                        if (
                            viewer &&
                            typeof viewer.saveBodies === "function"
                        ) {
                            viewer.saveBodies();
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
            if (state.connectMode && hitPointId) {
                const last =
                    state.connectChain[state.connectChain.length - 1] || null;
                if (!last) {
                    state.connectChain.push(hitPointId);
                    setDebug(`Body: start at ${hitPointId}`);
                } else if (last !== hitPointId) {
                    state.connectChain.push(hitPointId);
                    setDebug(`Body: extended to ${hitPointId}`);
                }
                rebuildBarsFromBodies();
                for (let i = 0; i < state.connectChain.length - 1; i++) {
                    state.bars.push({
                        id: `bar_temp_${i}`,
                        a: state.connectChain[i],
                        b: state.connectChain[i + 1],
                    });
                }
                invalidate("Bars rebuilt from mouse pointer");
                return;
            }
            if (state.connectMode && !hitPointId && !hitBodyId && e.button === 0) {
                finalizeConnectChainAndSave();  // commits if ≥2, discards if <2
                state.connectMode = false;
                state.connectChain = [];
                if (typeof window !== "undefined") {
                    window.__link_mode = false;
                }
                updateLinkButtonHighlight();
                setDebug("Connect mode: OFF (mouse click away)");
                return;
            }

            // 5) Point hit (mouse) – points above bodies
            if (hitPointId) {
                state.selectedPointId = hitPointId;
                state.draggingPointId = hitPointId;
                state.selectedBodyId = null;
                state.bodyDeleteHit = null;
                isPanning = false;
                panStart = null;
                invalidate(`Selected point ${hitPointId} (mouse)`);
                return;
            }

            // 6) If no point but we hit a body, select body
            if (hitBodyId) {
                state.selectedBodyId = hitBodyId;
                state.selectedPointId = null;
                state.draggingPointId = null;
                invalidate(`Selected body ${hitBodyId} (mouse)`);
                return;
            }

            // 7) Click away: clear selections and save
            if (state.selectedPointId || state.selectedBodyId) {
                state.selectedPointId = null;
                state.selectedBodyId = null;
                state.draggingPointId = null;
                state.bodyDeleteHit = null;
                invalidate("Deselected point/body (mouse)");
                saveNowIfPossible();
                try {
                    if (
                        viewer &&
                        typeof viewer.saveBodies === "function"
                    ) {
                        viewer.saveBodies();
                    }
                } catch (err) {
                    console.warn("[BikeViewer] saveBodies from mouse deselect failed:", err);
                }
                return;
            }

            // 8) If an activeType is set and we left-clicked empty space, place new point
            if (state.activeType && e.button === 0) {
                const newPoint = drawDotAtClient(e.clientX, e.clientY);
                if (newPoint) {
                    state.selectedPointId = newPoint.id;
                    state.draggingPointId = null;
                    state.selectedBodyId = null;
                    invalidate(`Point placed and selected (mouse) ${newPoint.id}`);
                }
                state.activeType = null;
                updateTypeButtonHighlight();
                return;
            }

            // 9) Otherwise: pan
            if (!state.activeType && e.button === 0) {
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
        crosshair.visible = !!state.activeType;     // only show when a point type is armed

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

            if (touchPoints.size === 1 && state.draggingPointId) {
                const imgPt = clientToImage(e.clientX, e.clientY);
                const p = state.points.find((pt) => pt.id === state.draggingPointId);
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
        if (state.draggingPointId) {
            const imgPt = clientToImage(e.clientX, e.clientY);
            const p = state.points.find((pt) => pt.id === state.draggingPointId);
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
            if (state.activeType) {
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

    function endPointer(e) {
        const msg = `pointerend: type=${e.pointerType}, button=${e.button}`;
        setDebug(msg);

        try {
            canvas.releasePointerCapture(e.pointerId);
        } catch (_) {
            // ignore if not captured
        }

        const wasDragging = !!state.draggingPointId;

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
        state.draggingPointId = null;

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
            if (state.activeType) {
                state.activeType = null;

                // turn off crosshair
                crosshair.visible = false;
                crosshair.x = crosshair.y = null;

                updateTypeButtonHighlight();
                invalidate("Point placement cancelled (ESC)");
                return;
            }

            // Optional: also deselect point/body when ESC pressed
            if (state.selectedPointId || state.selectedBodyId) {
                state.selectedPointId = null;
                state.selectedBodyId = null;
                state.bodyDeleteHit = null;
                state.draggingPointId = null;
                invalidate("Selection cleared (ESC)");
                return;
            }

            return;
        }

        // ==== Arrow key nudging (unchanged) ====
        if (!state.selectedPointId) return;

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
        const p = state.points.find((pt) => pt.id === state.selectedPointId);
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

        const payload = {
            bodies: state.bodies.map((b) => ({
                id: b.id,
                name: b.name ?? null,
                point_ids: Array.isArray(b.point_ids) ? b.point_ids.slice() : [],
                closed: !!b.closed,
                type: b.type || null,  // <-- NEW
            })),
        };

        console.log("[BikeViewer] saveBodies payload:", payload);

        try {
            setDebug("Saving bodies…");

            const res = await BV.putBodies({
                containerEl,
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
    // viewer = {
    Object.assign(viewer, {
        ping() {
            setDebug("bikeViewer.ping() called from console");
        },
        setType(type, options) {
            const newType = type ? String(type) : null;
            const opts = options || {};

            // --- If we were in link mode, finalise/discard chain and turn it off ---
            if (state.connectMode) {
                if (state.connectChain.length >= 2) {
                    // OLD inline body creation here
                    createBodyFromChain(state.activeLinkType);
                } else if (state.connectChain.length > 0) {
                    state.connectChain = [];
                    rebuildBarsFromBodies();
                    invalidate(
                        "Discarding partial link chain (link mode cancelled via type change)"
                    );
                }
                state.connectMode = false;
                state.activeLinkType = null;
                if (typeof window !== "undefined") {
                    window.__link_mode = false;
                }
                updateLinkButtonHighlight();
            }

            // --- Toggle behaviour: click same type again => cancel placement ---
            if (state.activeType === newType) {
                state.activeType = null;
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
            state.activeType = newType;
            if (typeof crosshair !== "undefined") {
                crosshair.visible = !!state.activeType;
                if (!state.activeType) {
                    crosshair.x = null;
                    crosshair.y = null;
                }
            }
            updateTypeButtonHighlight();
            log("Point type set to:", state.activeType);
            invalidate("Active type: " + (state.activeType || "none"));
        },

        resetView() {
            resetView();
        },

        // --- NEW: link-type tool (rigid / shock) ---
        setLinkType(type, options) {
            const newType = type ? String(type) : null;
            const opts = options || {};

            // If we were in point-placement mode, turn that off
            if (state.activeType) {
                state.activeType = null;
                if (typeof crosshair !== "undefined") {
                    crosshair.visible = false;
                    crosshair.x = null;
                    crosshair.y = null;
                }
                updateTypeButtonHighlight();
            }

            // If we’re already in link mode…
            if (state.connectMode) {
                // Clicking the same link type again => toggle OFF (commit/discard chain)
                if (state.activeLinkType === newType) {
                    if (state.connectChain.length >= 2) {
                        createBodyFromChain(state.activeLinkType);
                    } else if (state.connectChain.length > 0) {
                        state.connectChain = [];
                        rebuildBarsFromBodies();
                        invalidate("Discarding partial link chain (link tool toggled off)");
                    }
                    state.connectMode = false;
                    state.activeLinkType = null;
                    state.connectChain = [];
                    if (typeof window !== "undefined") {
                        window.__link_mode = false;
                    }
                    updateLinkButtonHighlight();
                    setDebug("Link mode: OFF");
                    return;
                }

                // Switching from one link type to another while link mode is ON
                if (state.connectChain.length >= 2) {
                    createBodyFromChain(state.activeLinkType);
                } else if (state.connectChain.length > 0) {
                    state.connectChain = [];
                    rebuildBarsFromBodies();
                    invalidate("Discarding partial link chain (link type changed)");
                }

                state.activeLinkType = newType;
                if (typeof window !== "undefined") {
                    window.__link_mode = true;
                }
                updateLinkButtonHighlight();
                setDebug("Link mode: ON (" + state.activeLinkType + ")");
                return;
            }

            // Not in link mode yet, and user clicked a link tool
            if (newType) {
                state.connectMode = true;
                state.activeLinkType = newType;
                state.connectChain = [];
                if (typeof window !== "undefined") {
                    window.__link_mode = true;
                }
                updateLinkButtonHighlight();
                setDebug("Link mode: ON (" + state.activeLinkType + ")");
                return;
            }

            // newType is null => explicit OFF
            if (state.connectChain.length >= 2) {
                createBodyFromChain(state.activeLinkType);
            } else if (state.connectChain.length > 0) {
                state.connectChain = [];
                rebuildBarsFromBodies();
                invalidate("Discarding partial link chain (link tool cleared)");
            }
            state.connectMode = false;
            state.activeLinkType = null;
            state.connectChain = [];
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
                if (state.connectChain.length >= 2) {
                    createBodyFromChain(state.activeLinkType);
                } else if (state.connectChain.length > 0) {
                    state.connectChain = [];
                    rebuildBarsFromBodies();
                    invalidate("Discarding partial link chain (setConnectMode OFF)");
                }
                state.connectMode = false;
                state.connectChain = [];
                if (typeof window !== "undefined") window.__link_mode = false;
                updateLinkButtonHighlight();
                setDebug("Link mode: OFF");
                return;
            }

            // turning ON (if no activeLinkType, default to "bar")
            if (!state.activeLinkType) {
                state.activeLinkType = "bar";
            }
            state.connectMode = true;
            state.connectChain = [];
            if (typeof window !== "undefined") window.__link_mode = true;
            updateLinkButtonHighlight();
            setDebug("Link mode: ON (" + state.activeLinkType + ")");
        },

        // ---- backend sync helpers ----
        getPoints() {
            return state.points.map((p) => ({
                id: p.id,
                type: p.type,
                name: p.name ?? null,
                x: p.x,
                y: p.y,
            }));
        },

        setPoints(newPoints) {
            const pts = state.points;     // or viewer.state.points
            pts.length = 0;

            let maxIdNum = 0;

            (newPoints || []).forEach((p) => {
                const idStr = String(p.id ?? "");

                pts.push({
                    id: idStr,
                    type: p.type,
                    name: p.name ?? null,
                    x: Number(p.x),
                    y: Number(p.y),
                });

                const m = idStr.match(/pt_(\d+)/);
                if (m) {
                    const n = parseInt(m[1], 10);
                    if (!Number.isNaN(n)) maxIdNum = Math.max(maxIdNum, n);
                }
            });

            invalidate(`Loaded ${pts.length} point(s) from backend`);
        },

        // NEW: bars
        getBars() {
            return state.bars.map((b) => ({ id: b.id, a: b.a, b: b.b }));
        },
        setBars(newBars) {
            state.bars = (newBars || []).map((b, idx) => ({
                id: b.id || `bar_${idx + 1}`,
                a: b.a,
                b: b.b,
            }));
            invalidate(`Loaded ${state.bars.length} bar(s) from backend`);
        },

        getBodies() {
            return state.bodies.map((b) => ({
                id: b.id,
                name: b.name ?? null,
                point_ids: Array.isArray(b.point_ids) ? b.point_ids.slice() : [],
                closed: !!b.closed,
                type: b.type || null,   // <-- NEW
            }));
        },

        setBodies(newBodies) {
            state.bodies = (newBodies || []).map((b, idx) => ({
                id: b.id || `body_${idx + 1}`,
                name: b.name ?? null,
                point_ids: Array.isArray(b.point_ids) ? b.point_ids.slice() : [],
                closed: !!b.closed,
                type: b.type || null,   // <-- NEW
            }));
            rebuildBarsFromBodies();
            invalidate(`Loaded ${state.bodies.length} body(s)`);
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

            // Only send points – backend ignores connectivity here
            const payload = {
                points: state.points.map((p) => ({
                    id: p.id,
                    type: p.type,
                    name: p.name ?? null,
                    x: p.x,
                    y: p.y,
                })),
            };

            console.log("[BikeViewer] savePoints payload:", payload);

            try {
                setDebug("Saving points…");
                const res = await BV.putPoints({
                    container: containerEl,
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
    });

    setDebug("BikeViewer initialised. Tap/click to place points.");
};
