// actions.js
const NUDGE_STEP_IMAGE = 0.5; // image-space units

export function placePointAtClient(options) {
    const {
        x,
        y,
        points,
        type,
        getNextId,
        setNextId,
        idPrefix,
        clientToImage,
        invalidate,
        setDebug,
    } = options;

    if (!type) {
        if (typeof setDebug === "function") {
            setDebug("Click ignored: no active point type.");
        }
        return null;
    }

    const imgPt = clientToImage(x, y);
    const nextId = getNextId();
    const point = {
        id: `${idPrefix}${nextId}`,
        type,
        name: null,
        x: imgPt.x,
        y: imgPt.y,
    };
    points.push(point);
    setNextId(nextId + 1);
    if (typeof invalidate === "function") {
        invalidate(
            `Placed point id=${point.id}, type=${point.type}, img=(${imgPt.x.toFixed(
                1
            )}, ${imgPt.y.toFixed(1)})`
        );
    }
    return point;
}

export function nudgePointById(options) {
    const {
        points,
        selectedPointId,
        direction,
        step,
        onDelete,
        invalidate,
    } = options;
    if (!selectedPointId) return;
    const p = points.find((pt) => pt.id === selectedPointId);
    if (!p) return;

    if (direction === "delete") {
        const idx = points.findIndex((pt) => pt.id === selectedPointId);
        if (idx !== -1) {
            points.splice(idx, 1);
            if (typeof onDelete === "function") onDelete();
            if (typeof invalidate === "function") {
                invalidate("Point deleted via nudge controls");
            }
        }
        return;
    }

    const delta = typeof step === "number" ? step : NUDGE_STEP_IMAGE;

    switch (direction) {
        case "up":
            p.y -= delta;
            break;
        case "down":
            p.y += delta;
            break;
        case "left":
            p.x -= delta;
            break;
        case "right":
            p.x += delta;
            break;
    }
    if (typeof invalidate === "function") {
        invalidate(`Nudged ${direction}`);
    }
}

export function createActions(deps) {
    const { state, clientToImage, invalidate, setDebug, saveNowIfPossible } = deps;

    function drawDotAtClient(x, y) {
        return placePointAtClient({
            x,
            y,
            points: state.points,
            type: state.activeType,
            getNextId: () => state.nextId,
            setNextId: (v) => {
                state.nextId = v;
            },
            idPrefix: "pt_",
            clientToImage,
            invalidate,
            setDebug,
        });
    }

    function nudgeSelectedPoint(direction) {
        nudgePointById({
            points: state.points,
            selectedPointId: state.selectedPointId,
            direction,
            step: NUDGE_STEP_IMAGE,
            onDelete: () => {
                state.selectedPointId = null;
                state.draggingPointId = null;
                saveNowIfPossible();
            },
            invalidate,
        });
    }

    return {
        drawDotAtClient,
        nudgeSelectedPoint,
    };
}

const BV = (window.BikeViewer ||= {});
BV.createActions = createActions;
BV.placePointAtClient = placePointAtClient;
BV.nudgePointById = nudgePointById;
