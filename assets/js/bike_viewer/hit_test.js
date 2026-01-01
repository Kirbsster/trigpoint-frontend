// hit_test.js
export function findNearestPointIdAtClient(clientX, clientY, deps) {
    const { state, view, clientToImage } = deps;
    const imgPt = clientToImage(clientX, clientY);
    let bestId = null;

    const screenRadiusPx = 10;
    const hitRadiusImg = screenRadiusPx / view.scale;
    const hitRadiusImg2 = hitRadiusImg * hitRadiusImg;

    for (const p of state.points || []) {
        const dx = p.x - imgPt.x;
        const dy = p.y - imgPt.y;
        const d2 = dx * dx + dy * dy;
        if (d2 <= hitRadiusImg2) {
            bestId = p.id;
        }
    }
    return bestId;
}

export function isPointerOverPointToolButton(clientX, clientY) {
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

export function hitBodyAtClient(clientX, clientY, deps) {
    const { state, view, clientToImage } = deps;
    if (!state.bodies.length) return null;

    // Convert the tap/click to image coordinates
    const imgPt = clientToImage(clientX, clientY);
    const pxThreshold = 18; // screen px
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

            // Distance from imgPt to segment p1-p2 in image space
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

export function hitNudgeControlAtClient(clientX, clientY, deps) {
    const { state, view, canvas, nudgeInnerRadius, nudgeOuterRadius } = deps;
    if (!state.selectedPointId) return null;
    const p = state.points.find((pt) => pt.id === state.selectedPointId);
    if (!p) return null;

    const rect = canvas.getBoundingClientRect();

    // Image -> screen coords:
    const cxScreen = rect.left + view.scale * p.x + view.tx;
    const cyScreen = rect.top + view.scale * p.y + view.ty;

    const dx = clientX - cxScreen;
    const dy = clientY - cyScreen;
    const r = Math.hypot(dx, dy);

    // --- directional nudges: donut ring in screen px ---
    if (r >= nudgeInnerRadius && r <= nudgeOuterRadius) {
        let angle = (Math.atan2(dy, dx) * 180) / Math.PI; // -180..180
        if (angle >= -135 && angle < -45) return "up";
        if (angle >= -45 && angle < 45) return "right";
        if (angle >= 45 && angle < 135) return "down";
        if (angle >= 135 || angle < -135) return "left";
    }

    // --- delete icon hit: small circle just outside the donut ---
    const deleteRadial = nudgeOuterRadius + 18;
    const deleteAngle = (45 * Math.PI) / 180;
    const delCxScreen = cxScreen + deleteRadial * Math.cos(deleteAngle);
    const delCyScreen = cyScreen + deleteRadial * Math.sin(deleteAngle);
    const delRScreen = 11; // hit radius in px

    const ddx = clientX - delCxScreen;
    const ddy = clientY - delCyScreen;
    const dr = Math.hypot(ddx, ddy);

    if (dr <= delRScreen) {
        return "delete";
    }
    return null;
}

export function distancePointToSegment(px, py, x1, y1, x2, y2) {
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

export function findBodyAtClient(clientX, clientY, deps) {
    const { state, view, clientToImage } = deps;
    // Work in IMAGE space because bars/points are in image coords
    const imgPt = clientToImage(clientX, clientY);
    const tolImg = 8 / view.scale; // ~8px at current zoom
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

const BV = (window.BikeViewer ||= {});
BV.findNearestPointIdAtClient = findNearestPointIdAtClient;
BV.isPointerOverPointToolButton = isPointerOverPointToolButton;
BV.hitBodyAtClient = hitBodyAtClient;
BV.hitNudgeControlAtClient = hitNudgeControlAtClient;
BV.distancePointToSegment = distancePointToSegment;
BV.findBodyAtClient = findBodyAtClient;
