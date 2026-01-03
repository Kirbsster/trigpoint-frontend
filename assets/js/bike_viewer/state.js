// state.js
export function makeDefaultState() {
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

        // perspective correction UI state
        perspective: {
            active: false,
            stage: "rear", // rear | front | done
            points: [],
            nextId: 1,
            preview: false,
            selectedPointId: null,
            draggingPointId: null,
        },
    };
}

export function getState(viewer, bikeId) {
    // Create once if missing
    if (!viewer.state) viewer.state = makeDefaultState();

    // Reset when navigating to a different bike in SPA
    if (bikeId && viewer.state._bikeId !== bikeId) {
        viewer.state = makeDefaultState();
        viewer.state._bikeId = bikeId;
    }
    return viewer.state;
}

export function recomputeNextIdFromPoints(state) {
    let maxNum = 0;
    for (const p of state.points) {
        const m = String(p.id || "").match(/^pt_(\d+)$/);
        if (!m) continue;
        const n = Number(m[1]);
        if (Number.isFinite(n)) maxNum = Math.max(maxNum, n);
    }
    state.nextId = maxNum + 1;
}

export function recomputeNextBodyIdFromBodies(state) {
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

const BV = (window.BikeViewer ||= {});
BV.makeDefaultState = makeDefaultState;
BV.getState = getState;
BV.recomputeNextIdFromPoints = recomputeNextIdFromPoints;
BV.recomputeNextBodyIdFromBodies = recomputeNextBodyIdFromBodies;
