// geometry.js
export function rebuildBarsFromBodies(state) {
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

export function getPtsByType(points) {
    const out = {};
    if (!Array.isArray(points)) return out;

    for (const p of points) {
        out[p.type] = p;

        // Optional aliases (VERY helpful long-term)
        if (p.type === "bottom_bracket") out.bb = p;
        if (p.type === "rear_axle") out.rear_axle = p;
        if (p.type === "front_axle") out.front_axle = p;
    }
    return out;
}

export function findShockBody(bodies) {
    if (!Array.isArray(bodies)) return null;
    return bodies.find((body) => body.type === "shock") || null;
}

export function findShockBar(bodies, bars) {
    const shockBody = findShockBody(bodies);
    if (!shockBody || !Array.isArray(bars)) return null;
    return bars.find((bar) => bar.bodyId === shockBody.id) || null;
}

export function createBodyFromChain(state, linkType) {
    if (!state.connectChain.length) return null;

    if (state.connectChain.length < 2) {
        state.connectChain = [];
        return null;
    }

    const body = {
        id: `body_${state.nextBodyId++}`,
        name: null,
        point_ids: state.connectChain.slice(),
        closed: false,
        type: linkType === "shock" ? "shock" : "bar",
    };

    if (state.bodies.some((b) => b.id === body.id)) {
        body.id = `body_${state.nextBodyId++}`;
    }

    state.bodies.push(body);
    state.connectChain = [];

    return body;
}

export function finalizeConnectChain(state) {
    if (!state.connectChain.length) return "empty";
    if (state.connectChain.length < 2) {
        state.connectChain = [];
        return "discard";
    }
    return "create";
}

const BV = (window.BikeViewer ||= {});
BV.rebuildBarsFromBodies = rebuildBarsFromBodies;
BV.getPtsByType = getPtsByType;
BV.findShockBody = findShockBody;
BV.findShockBar = findShockBar;
BV.createBodyFromChain = createBodyFromChain;
BV.finalizeConnectChain = finalizeConnectChain;
