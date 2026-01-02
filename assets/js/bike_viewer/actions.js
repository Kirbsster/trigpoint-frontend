// actions.js
export function createActions(deps) {
    const { state, clientToImage, invalidate, setDebug, saveNowIfPossible } = deps;

    const NUDGE_STEP_IMAGE = 0.5; // image-space units

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
        return point;
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

    return {
        drawDotAtClient,
        nudgeSelectedPoint,
    };
}

const BV = (window.BikeViewer ||= {});
BV.createActions = createActions;
