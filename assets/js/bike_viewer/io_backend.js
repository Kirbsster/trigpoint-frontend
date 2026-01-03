// io_backend.js
export function createBackendIO(deps) {
    const {
        BV,
        viewer,
        containerEl,
        bikeId,
        accessToken,
        state,
        loadGeometryFromBikeDoc,
        recomputeNextIdFromPoints,
        recomputeMeasurementsFromScale,
        recomputeNextBodyIdFromBodies,
        rebuildBarsFromBodies,
        invalidate,
        setDebug,
        shockStrokeInput,
        setLastValidShockStroke,
    } = deps;

    function loadPerspectiveFromBikeDoc(bikeDoc) {
        const pts = Array.isArray(bikeDoc?.hero_perspective_points)
            ? bikeDoc.hero_perspective_points
            : [];
        state.perspective.points = pts.map((p, idx) => ({
            id: p.id ? String(p.id) : `persp_${idx + 1}`,
            type: p.type || "rear",
            x: Number(p.x),
            y: Number(p.y),
        }));

        let maxIdNum = 0;
        for (const p of state.perspective.points) {
            const m = String(p.id).match(/persp_(\d+)/);
            if (!m) continue;
            const n = parseInt(m[1], 10);
            if (!Number.isNaN(n)) maxIdNum = Math.max(maxIdNum, n);
        }
        state.perspective.nextId = maxIdNum + 1;

        const rearCount = state.perspective.points.filter((p) => p.type === "rear").length;
        const frontCount = state.perspective.points.filter((p) => p.type === "front").length;
        if (rearCount < 4) {
            state.perspective.stage = "rear";
        } else if (frontCount < 4) {
            state.perspective.stage = "front";
        } else {
            state.perspective.stage = "done";
        }

        state.perspective.active = false;
        state.perspective.preview = false;
        state.perspective.selectedPointId = null;
        state.perspective.draggingPointId = null;
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

            // hydrate measurements + scale from backend
            loadGeometryFromBikeDoc(data);
            loadPerspectiveFromBikeDoc(data);

            // points
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

            // build trails from coords for all points
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

            // Keep length0 + stroke from backend
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

            // Hydrate shock stroke pill if DB already has a value
            const shockBody = state.bodies.find(
                (body) => body.type === "shock" && typeof body.stroke === "number" && body.stroke > 0
            );

            if (shockBody) {
                const v = shockBody.stroke;
                const norm = String(v);
                setLastValidShockStroke(norm);
                shockStrokeInput.value = norm + " mm";
                viewer.shock_stroke_mm = v;
                setDebug(`Hydrated shock stroke from backend: ${norm} mm`);
            } else {
                // No stroke in DB yet -> start empty
                setLastValidShockStroke("");
                shockStrokeInput.value = "";
            }
            recomputeNextBodyIdFromBodies();
            // Finally redraw everything with the updated bodies + maybe prefilled pill
            invalidate(`Loaded ${state.bodies.length} bodies`);
        } catch (err) {
            console.error("[BikeViewer] loadBodies error:", err);
        }
    }

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
                type: b.type || null,
                length0: typeof b.length0 === "number" ? b.length0 : null,
                stroke: typeof b.stroke === "number" ? b.stroke : null,
            })),
        };

        console.log("[BikeViewer] saveBodies payload:", payload);

        try {
            setDebug("Saving bodies...");

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
            setDebug("Bodies saved OK");
        } catch (err) {
            console.error("[BikeViewer] saveBodies error:", err);
            setDebug("Bodies save error (see console)");
        }
    }

    async function savePoints() {
        if (!bikeId) {
            setDebug("Cannot save: missing bike id");
            console.warn("[BikeViewer] savePoints: missing bikeId");
            return;
        }

        // Only send points - backend ignores connectivity here
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
            setDebug("Saving points...");
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
            setDebug("Points saved OK");
        } catch (err) {
            console.error("[BikeViewer] savePoints error:", err);
            setDebug("Save error (see console)");
        }
    }

    async function savePerspectivePoints() {
        if (!bikeId) {
            setDebug("Cannot save perspective: missing bike id");
            console.warn("[BikeViewer] savePerspective: missing bikeId");
            return;
        }

        const payload = {
            points: (state.perspective.points || []).map((p) => ({
                id: p.id,
                type: p.type,
                x: p.x,
                y: p.y,
            })),
        };

        try {
            const res = await BV.putHeroPerspective({
                container: containerEl,
                bikeId,
                accessToken,
                payload,
            });
            if (!res.ok) {
                setDebug(`Perspective save failed (${res.status})`);
            }
        } catch (err) {
            console.error("[BikeViewer] savePerspective error:", err);
            setDebug("Perspective save error (see console)");
        }
    }

    return {
        loadInitialPoints,
        loadBodies,
        saveBodiesHelper,
        savePoints,
        savePerspectivePoints,
    };
}

const BV = (window.BikeViewer ||= {});
BV.createBackendIO = createBackendIO;
