// measurements.js
export function createMeasurements(deps) {
    const {
        BV,
        viewer,
        containerEl,
        bikeId,
        accessToken,
        state,
        getPtsByType,
        setDebug,
        invalidate,
        drawAll,
    } = deps;

    const { MEASURE_DEFS } = deps;

    const measurementDom = {};
    let activeScaleMeasurementId = "rear_center";
    const measurementValues = {};

    function getActiveScaleMeasurementId() {
        return activeScaleMeasurementId;
    }

    function setActiveScaleMeasurementId(id) {
        activeScaleMeasurementId = id;
    }

    function pxDistanceForMeasurement(def, a, b) {
        const orient = def.place?.orientation || "point_to_point";
        if (orient === "horizontal") return Math.abs(b.x - a.x);
        if (orient === "vertical") return Math.abs(b.y - a.y);
        return Math.hypot(b.x - a.x, b.y - a.y);
    }

    function setScaleFromMeasurement(measId, mmValue) {
        const def = MEASURE_DEFS?.[measId];
        if (!def || !def.anchors) return null;

        const pts = getPtsByType();
        const aType = def.anchors.aType;
        const bType = def.anchors.bType;

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

        activeScaleMeasurementId = measId;

        setDebug(
            `${def.label || measId} set: ${mmValue} mm, d_px=${dPx.toFixed(
                2
            )}, scale=${scaleMmPerPx.toFixed(6)} mm/px`
        );

        drawAll();

        return scaleMmPerPx;
    }

    function recomputeMeasurementsFromScale() {
        const scale = viewer?.scale_mm_per_px;
        if (!scale || scale <= 0) return;

        const pts = getPtsByType();

        for (const id in MEASURE_DEFS) {
            if (id === activeScaleMeasurementId) continue;

            const def = MEASURE_DEFS[id];
            if (!def?.anchors) continue;

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
        const scale = viewer?.scale_mm_per_px;
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

        for (const id in MEASURE_DEFS) {
            const def = MEASURE_DEFS[id];
            const a = pts?.[def.anchors?.aType];
            const b = pts?.[def.anchors?.bType];
            const dPx = distPx(a, b, def.place?.orientation || "point_to_point");
            if (!dPx || dPx <= 0) continue;

            const mm = +(dPx * scale).toFixed(1);
            measurementValues[id] = mm;

            if (id === "rear_center") out.rear_center_mm = mm;
            if (id === "wheelbase") out.wheelbase_mm = mm;
            if (id === "front_center") out.front_center_mm = mm;
        }

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

        const scale = setScaleFromMeasurement(measureId, mmValue);
        if (!scale) return;

        const geom = recomputeGeometryFromScale();
        if (!geom) return;
        console.log("commit", {
            measureId,
            activeScaleMeasurementId,
            scale: viewer?.scale_mm_per_px,
            pts: Object.keys(getPtsByType?.() || {}),
            geom: geom,
        });
        const res = await BV.putGeometry({ containerEl, bikeId, accessToken, payload: geom });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`geometry PUT failed (${res.status}): ${text}`);
        }

        setDebug(`${measureId} saved OK`);
        invalidate();
    }

    function setActiveMeasurementHighlight(inputEl, isActive) {
        inputEl.style.outline = isActive ? "2px solid var(--accent)" : "none";
        inputEl.style.outlineOffset = "2px";
    }

    function makeArrowDom(containerElLocal, cssVar) {
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
        containerElLocal.appendChild(root);

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
        getMeasureId,
        setActive,
        onCommit,
        setDebug: setDebugLocal,
    }) {
        const NUMERIC = /^\d*\.?\d*$/;
        let lastValid = "";

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

        pill.addEventListener("focus", () => {
            const measureId = getMeasureId();
            const def = MEASURE_DEFS?.[measureId];
            if (!def) return;
            if (!def.scaleCandidate) return;
            setActive(true);
        });

        pill.addEventListener("blur", async (e) => {
            const measureId = getMeasureId();
            if (!measureId) return;
            const def = MEASURE_DEFS?.[measureId];
            if (!def) return;
            if (!def.scaleCandidate) return;

            setActive(false);

            let raw = String(e.target.value || "").replace(/mm/i, "").trim();

            if (raw === "") {
                lastValid = "";
                return;
            }

            const val = Number.parseFloat(raw);

            if (!Number.isFinite(val) || val <= 0) {
                lastValid = "";
                e.target.value = "";
                setDebugLocal("Measurement invalid; cleared");
                setActive(false);
                return;
            }

            const norm = String(val);
            lastValid = norm;
            e.target.value = norm + " mm";

            try {
                await onCommit(measureId, val);
            } catch (err) {
                console.error("[BikeViewer] measurement commit failed:", err);
                setDebugLocal("Error saving measurement (see console)");
            }
        });
    }

    function resolveAnchors(points, def) {
        const a = points.find((p) => p.type === def.anchors.aType);
        const b = points.find((p) => p.type === def.anchors.bType);
        if (!a || !b) return null;
        return { a, b };
    }

    function layoutMeasurement(def, view, aImg, bImg) {
        const A = { x: view.tx + view.scale * aImg.x, y: view.ty + view.scale * aImg.y };
        const B = { x: view.tx + view.scale * bImg.x, y: view.ty + view.scale * bImg.y };

        const orient = def.place?.orientation || "point_to_point";

        let P = A, Q = B;
        if (orient === "horizontal") {
            const y = (A.y + B.y) / 2;
            P = { x: A.x, y };
            Q = { x: B.x, y };
        } else if (orient === "vertical") {
            const x = (A.x + B.x) / 2;
            P = { x, y: A.y };
            Q = { x, y: B.y };
        }

        const dx = Q.x - P.x;
        const dy = Q.y - P.y;
        const L = Math.hypot(dx, dy);
        if (!(L > 1e-6)) return null;

        const angle = Math.atan2(dy, dx);

        const headW = def.style?.headW ?? 10;
        const headH = def.style?.headH ?? 14;
        const shaftThickness = def.style?.shaftThickness ?? 3;

        const normalOffsetPx = def.place?.normalOffsetPx ?? 26;
        const pillOffsetPx = def.place?.pillOffsetPx ?? 18;

        const yArrow = normalOffsetPx;
        const shaftX = headW;
        const shaftW = Math.max(0, L - 2 * headW);

        return {
            origin: { x: P.x, y: P.y },
            angle,
            L,
            leftHead: { x: 0, y: yArrow - headH / 2, w: headW, h: headH },
            rightHead: { x: L - headW, y: yArrow - headH / 2, w: headW, h: headH },
            shaft: { x: shaftX, y: yArrow - shaftThickness / 2, w: shaftW, h: shaftThickness },
            pill: { cx: L * 0.5, cy: yArrow - pillOffsetPx },
        };
    }

    function updateMeasurementsOverlay({
        containerEl: containerElLocal,
        canvas,
        view,
        points,
        cssVar,
        defs,
        domMap,
        activeScaleId,
        valuesById,
    }) {
        const cs = getComputedStyle(containerElLocal);
        if (cs.position === "static") containerElLocal.style.position = "relative";

        const color = cssVar("--text-dark");

        const hide = (dom) => {
            dom.root.style.display = "none";
        };

        for (const id in defs) {
            const def = defs[id];
            const dom = domMap[id] || (domMap[id] = makeArrowDom(containerElLocal, cssVar));

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
            ].forEach((t) => t.style.display = "none");

            if (ticks?.enabled) {
                const thick = ticks.thicknessPx ?? 3;
                const lenPos = ticks.lengthPosPx ?? 8;
                const lenNeg = ticks.lengthNegPx ?? 8;
                const side = ticks.side ?? "both";
                const ends = ticks.ends ?? "both";

                const y0 = layout.shaft.y + layout.shaft.h / 2;

                const placeTick = (el, x, dir) => {
                    if (!el) return;
                    el.style.display = "block";
                    el.style.width = `${thick}px`;
                    el.style.height = `${dir > 0 ? lenPos : lenNeg}px`;
                    el.style.left = `${x - thick / 2}px`;
                    el.style.top = `${y0 + (dir > 0 ? 0 : -lenNeg)}px`;
                };

                if (ends === "both" || ends === "a") {
                    if (side === "both" || side === "pos")
                        placeTick(dom.tickA_pos, 0, +1);
                    if (side === "both" || side === "neg")
                        placeTick(dom.tickA_neg, 0, -1);
                }

                if (ends === "both" || ends === "b") {
                    if (side === "both" || side === "pos")
                        placeTick(dom.tickB_pos, layout.L, +1);
                    if (side === "both" || side === "neg")
                        placeTick(dom.tickB_neg, layout.L, -1);
                }
            }

            dom.root.style.display = "block";
            dom.root.style.transformOrigin = "0 0";
            dom.root.style.transform =
                `translate(${layout.origin.x}px, ${layout.origin.y}px) rotate(${layout.angle}rad)`;

            dom.shaft.style.left = `${layout.shaft.x}px`;
            dom.shaft.style.top = `${layout.shaft.y}px`;
            dom.shaft.style.width = `${layout.shaft.w}px`;
            dom.shaft.style.height = `${layout.shaft.h}px`;
            dom.shaft.style.background = color;

            dom.leftHead.style.left = `${layout.leftHead.x}px`;
            dom.leftHead.style.top = `${layout.leftHead.y}px`;

            dom.rightHead.style.left = `${layout.rightHead.x}px`;
            dom.rightHead.style.top = `${layout.rightHead.y}px`;

            dom.pill.style.left = `${layout.pill.cx}px`;
            dom.pill.style.top = `${layout.pill.cy}px`;
            dom.pill.style.transformOrigin = "50% 50%";
            dom.pill.style.transform = `translate(-50%, -50%) rotate(${-layout.angle}rad)`;

            const isActive = activeScaleId === id;
            dom.pill.style.boxShadow = isActive ? "0 0 0 1px var(--accent)" : "none";

            const v = valuesById?.[id];
            dom.pill.placeholder = def.label ? `${def.label} (${def.units || ""})`.trim() : "";

            const isFocused = document.activeElement === dom.pill;
            if (!isFocused) {
                dom.pill.value = (v != null && v !== "") ? `${v}` : "";
            }
            dom.pill.dataset.measureId = id;

            if (dom.pill.dataset.bound !== "1") {
                dom.pill.dataset.bound = "1";

                bindMmInputPill(dom.pill, {
                    getMeasureId: () => dom.pill.dataset.measureId,
                    setActive: (on) => {
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

    return {
        MEASURE_DEFS,
        measurementDom,
        measurementValues,
        getActiveScaleMeasurementId,
        setActiveScaleMeasurementId,
        recomputeMeasurementsFromScale,
        recomputeGeometryFromScale,
        commitMeasurement,
        setScaleFromMeasurement,
        setActiveMeasurementHighlight,
        bindMmInputPill,
        updateMeasurementsOverlay,
    };
}

const BV = (window.BikeViewer ||= {});
BV.createMeasurements = createMeasurements;
