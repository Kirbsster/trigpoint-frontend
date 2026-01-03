// draw.js
export function render(state, deps) {
    const {
        ctx,
        canvas,
        img,
        imgW,
        imgH,
        view,
        cssVar,
        scaleMmPerPx,
        crosshair,
        perspective,
        updateMeasurementsOverlay,
        measurement,
        updateShockStrokePill,
        findShockBar,
        nudgeInnerRadius,
        nudgeOuterRadius,
    } = deps;

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
    const pointById = new Map((state.points || []).map((p) => [p.id, p]));
    const pointByType = new Map();
    for (const p of state.points || []) pointByType.set(p.type, p);

    // Image-space transform
    ctx.setTransform(
        view.scale * dpr,
        0,
        0,
        view.scale * dpr,
        view.tx * dpr,
        view.ty * dpr
    );

    drawImageLayer(ctx, img, imgW, imgH);
    drawRearAxlePathLayer(ctx, view, cssVar, state.rearAxlePath);
    drawBarsLayer(ctx, view, state.bars, state.selectedBodyId, pointById);
    drawPointTrailsLayer(ctx, view, state.pointTrails);
    drawShockOverlay(ctx, view, cssVar, scaleMmPerPx, state.bodies, pointById, findShockBar);
    drawPointsLayer(ctx, view, cssVar, state.points, state.selectedPointId, state.connectMode, state.connectChain);
    drawWheelScaleCirclesLayer(ctx, view, scaleMmPerPx, state.points);
    drawPerspectiveOverlay(ctx, view, perspective);

    // Screen-space overlays
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (typeof updateMeasurementsOverlay === "function" && measurement) {
        updateMeasurementsOverlay({
            containerEl: measurement.containerEl,
            canvas,
            view,
            points: state.points,
            cssVar,
            defs: measurement.measureDefs,
            domMap: measurement.measurementDom,
            activeScaleId: measurement.activeScaleMeasurementId,
            valuesById: measurement.measurementValues,
        });
    }
    if (typeof updateShockStrokePill === "function") {
        updateShockStrokePill(pointById);
    }
    drawNudgeControlsForSelectedPoint(ctx, canvas, view, cssVar, state.selectedPointId, state.points, nudgeInnerRadius, nudgeOuterRadius);
    drawPerspectiveNudgeControls(ctx, canvas, view, cssVar, perspective, nudgeInnerRadius, nudgeOuterRadius);
    drawSelectedBodyOverlay(ctx, canvas, view, state);
    drawCrosshairOverlay(ctx, canvas, cssVar, crosshair, state.activeType, dpr);
    drawPerspectiveTextOverlay(ctx, canvas, perspective);
}

const BV = (window.BikeViewer ||= {});
BV.renderBikeViewer = render;

function drawImageLayer(ctx, img, imgW, imgH) {
    // view transform already applied
    ctx.drawImage(img, 0, 0, imgW, imgH);
}

function drawRearAxlePathLayer(ctx, view, cssVar, rearAxlePath) {
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

function drawBarsLayer(ctx, view, bars, selectedBodyId, pointById) {
    (bars || []).forEach((bar) => {
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

function drawPointTrailsLayer(ctx, view, pointTrails) {
    (pointTrails || []).forEach((trail) => {
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

function drawShockOverlay(ctx, view, cssVar, scaleMmPerPx, bodies, pointById, findShockBar) {
    if (typeof findShockBar !== "function") return;

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
    const shockBody = (bodies || []).find((b) => b.type === "shock");
    const strokeMm =
        shockBody && typeof shockBody.stroke === "number" && shockBody.stroke > 0
            ? shockBody.stroke
            : null;

    if (!strokeMm) return;

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

function drawPointsLayer(ctx, view, cssVar, points, selectedPointId, connectMode, connectChain) {
    const baseRadiusPx = 6;

    (points || []).forEach((p) => {
        const isSelected = p.id === selectedPointId;
        const inChain = connectMode && (connectChain || []).includes(p.id);

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

const WHEEL_SIZES = [
    { id: "27_5", label: '27.5"', beadSeatMm: 584 },
    { id: "29", label: '29"', beadSeatMm: 622 },
];

function drawWheelScaleCirclesLayer(ctx, view, scaleMmPerPx, points) {
    if (!scaleMmPerPx || scaleMmPerPx <= 0) return;

    const ptsArr = Array.isArray(points) ? points : [];

    const byType = {};
    for (const p of ptsArr) byType[p.type] = p;

    const rear = byType.rear_axle || null;
    const front = byType.front_axle || null;
    if (!rear && !front) return;

    const tyreMm = 0; // outer diameter allowance
    const mmToPx = (mm) => mm / scaleMmPerPx;

    ctx.save();

    // visibility-first settings (like your working version)
    ctx.setLineDash([]);
    ctx.globalAlpha = 1.0;
    ctx.lineWidth = 6 / view.scale;

    const drawAt = (pt) => {
        if (!pt) return;

        for (const w of WHEEL_SIZES) {
            const diameterMm = w.beadSeatMm + tyreMm;
            const rPx = mmToPx(diameterMm * 0.5);

            ctx.beginPath();
            ctx.arc(pt.x, pt.y, rPx, 0, Math.PI * 2);
            ctx.strokeStyle = "#ff00ff";
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

function drawPerspectiveOverlay(ctx, view, perspective) {
    if (!perspective) return;

    ctx.save();
    ctx.lineWidth = 3 / view.scale;
    ctx.strokeStyle = "#ff00ff";
    ctx.fillStyle = "#00d5ff";

    const rearPts = (perspective.points || []).filter((pt) => pt.type === "rear");
    const frontPts = (perspective.points || []).filter((pt) => pt.type === "front");
    drawRimOverlay(ctx, view, rearPts);
    drawRimOverlay(ctx, view, frontPts);
    drawSelectedPerspectivePoint(ctx, view, perspective.points, perspective.selectedPointId);

    ctx.restore();
}

function drawRimOverlay(ctx, view, pts) {
    if (!Array.isArray(pts) || pts.length === 0) return;

    for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6 / view.scale, 0, Math.PI * 2);
        ctx.fill();
    }

    const ellipse = ellipseFromRimPoints(pts);
    if (!ellipse) return;

    ctx.beginPath();
    ctx.ellipse(ellipse.cx, ellipse.cy, ellipse.rx, ellipse.ry, 0, 0, Math.PI * 2);
    ctx.stroke();
}

function drawSelectedPerspectivePoint(ctx, view, points, selectedPointId) {
    if (!selectedPointId) return;
    const pt = (points || []).find((p) => p.id === selectedPointId);
    if (!pt) return;

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 10 / view.scale, 0, Math.PI * 2);
    ctx.strokeStyle = "#00d5ff";
    ctx.lineWidth = 2 / view.scale;
    ctx.stroke();
}

function ellipseFromRimPoints(pts) {
    if (pts.length < 4) return null;

    let minY = pts[0];
    let maxY = pts[0];
    let minX = pts[0];
    let maxX = pts[0];

    for (const p of pts) {
        if (p.y < minY.y) minY = p;
        if (p.y > maxY.y) maxY = p;
        if (p.x < minX.x) minX = p;
        if (p.x > maxX.x) maxX = p;
    }

    const cx = (minX.x + maxX.x) / 2;
    const cy = (minY.y + maxY.y) / 2;
    const rx = Math.abs(maxX.x - minX.x) / 2;
    const ry = Math.abs(maxY.y - minY.y) / 2;

    if (!(rx > 1e-6 && ry > 1e-6)) return null;

    return { cx, cy, rx, ry };
}

function drawPerspectiveNudgeControls(ctx, canvas, view, cssVar, perspective, nudgeInnerRadius, nudgeOuterRadius) {
    if (!perspective || !perspective.selectedPointId) return;
    const p = (perspective.points || []).find((pt) => pt.id === perspective.selectedPointId);
    if (!p) return;
    drawNudgeControlsForPoint(ctx, canvas, view, cssVar, p, nudgeInnerRadius, nudgeOuterRadius);
}

function drawNudgeControlsForPoint(ctx, canvas, view, cssVar, p, nudgeInnerRadius, nudgeOuterRadius) {
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    const cx = (view.scale * p.x + view.tx) * dpr;
    const cy = (view.scale * p.y + view.ty) * dpr;
    const innerR = nudgeInnerRadius * dpr;
    const outerR = nudgeOuterRadius * dpr;

    ctx.save();

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

    drawSector(-135, -45, cssVar("--accent"));
    drawSector(-45, 45, cssVar("--accent"));
    drawSector(45, 135, cssVar("--accent"));
    drawSector(135, 225, cssVar("--accent"));

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

    drawArrow((-90 * Math.PI) / 180);
    drawArrow(0);
    drawArrow((90 * Math.PI) / 180);
    drawArrow((180 * Math.PI) / 180);

    const deleteRadial = (nudgeOuterRadius + 18) * dpr;
    const deleteAngle = (45 * Math.PI) / 180;
    const delCx = cx + deleteRadial * Math.cos(deleteAngle);
    const delCy = cy + deleteRadial * Math.sin(deleteAngle);
    const delR = 15 * dpr;

    ctx.beginPath();
    ctx.arc(delCx, delCy + 5, delR, 0, Math.PI * 2);
    ctx.fillStyle = cssVar("--accent-60");
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.save();
    ctx.translate(delCx, delCy);
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = cssVar("--accent");
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(-9, -2);
    ctx.lineTo(9, -2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(8, -2);
    ctx.lineTo(6.7, 10.4);
    ctx.quadraticCurveTo(6.6, 12, 5, 12);
    ctx.lineTo(-5, 12);
    ctx.quadraticCurveTo(-6.6, 12, -6.7, 10.4);
    ctx.lineTo(-8, -2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-3, 3);
    ctx.lineTo(-3, 9);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(3, 3);
    ctx.lineTo(3, 9);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-2.5, -4);
    ctx.lineTo(2.5, -4);
    ctx.stroke();

    ctx.restore();
}

function drawCrosshairOverlay(ctx, canvas, cssVar, crosshair, activeType, dpr) {
    if (!(crosshair && crosshair.visible && activeType && crosshair.x != null && crosshair.y != null)) return;

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

function drawPerspectiveTextOverlay(ctx, canvas, perspective) {
    if (!perspective) return;
    const active = perspective.active;
    const stage = perspective.stage;

    if (!active && stage === "done") return;

    const points = perspective.points || [];
    const rearCount = points.filter((pt) => pt.type === "rear").length;
    const frontCount = points.filter((pt) => pt.type === "front").length;

    let msg = "Perspective: click rear rim N/E/S/W";
    if (stage === "rear") {
        msg = `Perspective: rear rim ${rearCount}/4`;
    } else if (stage === "front") {
        msg = `Perspective: front rim ${frontCount}/4`;
    } else if (stage === "done") {
        msg = "Perspective: points set";
    }

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;
    ctx.font = "12px system-ui";

    const pad = 6;
    const metrics = ctx.measureText(msg);
    const w = metrics.width + pad * 2;
    const h = 20;
    const x = 12;
    const y = 12;

    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.fillText(msg, x + pad, y + 14);
    ctx.restore();
}

function drawNudgeControlsForSelectedPoint(ctx, canvas, view, cssVar, selectedPointId, points, nudgeInnerRadius, nudgeOuterRadius) {
    if (!selectedPointId) return;
    const p = (points || []).find((pt) => pt.id === selectedPointId);
    if (!p) return;
    drawNudgeControlsForPoint(ctx, canvas, view, cssVar, p, nudgeInnerRadius, nudgeOuterRadius);
}

function drawSelectedBodyOverlay(ctx, canvas, view, state) {
    state.bodyDeleteHit = null;
    if (!state.selectedBodyId) return;

    const body = (state.bodies || []).find((b) => b.id === state.selectedBodyId);
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
        const p = (state.points || []).find((pt) => pt.id === pid);
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

    // --- trash glyph ---
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
