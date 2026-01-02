// view.js
export function createViewHelpers(deps) {
    const { view, canvas, getImageSize, invalidate } = deps;
    let panCenterAnimId = null;

    function getImgSize() {
        const size = getImageSize();
        return { w: size.w || 0, h: size.h || 0 };
    }

    function resetView() {
        const { w: imgW, h: imgH } = getImgSize();
        if (!imgW || !imgH) return;

        const rect = canvas.getBoundingClientRect();
        const wCss = rect.width;
        const hCss = rect.height;

        // Fit to width only
        const scale = wCss / imgW;

        const scaledW = imgW * scale;
        const scaledH = imgH * scale;

        // horizontally centered always
        const tx = 0; // or (wCss - scaledW) / 2; but scaledW === wCss

        // vertically center the image (may crop top/bottom)
        const ty = (hCss - scaledH) / 2;

        // Store view state
        view.scale = scale;
        view.minScale = scale; // minimum zoom is this width-fit state
        view.tx = tx;
        view.ty = ty;

        // Because the image may be shorter/taller than viewport
        clampPan();

        invalidate("View reset (fit-to-width)");
    }

    function animatePanToCenter() {
        const { w: imgW, h: imgH } = getImgSize();
        if (!imgW || !imgH) return;

        // Cancel any existing animation
        if (panCenterAnimId !== null) {
            cancelAnimationFrame(panCenterAnimId);
            panCenterAnimId = null;
        }

        const rect = canvas.getBoundingClientRect();
        const wCss = rect.width;
        const hCss = rect.height;

        // Current scaled image size at the current zoom
        const scaledW = imgW * view.scale;
        const scaledH = imgH * view.scale;

        // Target: image centered in the viewport
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

            clampPan();
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
        const { w: imgW, h: imgH } = getImgSize();
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

        // Horizontal: fit width -> no side scrolling at min scale
        const minTx = Math.min(0, wCss - drawW); // usually <= 0
        const maxTx = Math.max(0, wCss - drawW); // usually 0
        if (view.tx < minTx) view.tx = minTx;
        if (view.tx > maxTx) view.tx = maxTx;

        // Vertical: allow sliding between show top and show bottom
        const minTy = hCss - drawH; // bottom aligned
        const maxTy = 0; // top aligned
        if (view.ty < minTy) view.ty = minTy;
        if (view.ty > maxTy) view.ty = maxTy;
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
        const { w: imgW, h: imgH } = getImgSize();
        if (!imgW || !imgH) return;

        const rect = canvas.getBoundingClientRect();
        const wCss = rect.width;
        const hCss = rect.height;

        const scaledW = imgW * view.scale;
        const scaledH = imgH * view.scale;

        // X axis
        if (scaledW <= wCss + 0.1) {
            // When width fits exactly -> lock tx = 0 so we never drift
            view.tx = 0;
        } else {
            const minTx = wCss - scaledW;
            const maxTx = 0;
            if (view.tx < minTx) view.tx = minTx;
            if (view.tx > maxTx) view.tx = maxTx;
        }

        // Y axis
        if (scaledH <= hCss) {
            // Image shorter than viewport: keep it centered vertically
            view.ty = (hCss - scaledH) / 2;
        } else {
            // Image taller than viewport: clamp so no empty gaps
            const minTy = hCss - scaledH;
            const maxTy = 0;
            if (view.ty < minTy) view.ty = minTy;
            if (view.ty > maxTy) view.ty = maxTy;
        }
    }

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
        const { w: imgW, h: imgH } = getImgSize();
        if (!imgW || !imgH) return;

        const rect = canvas.getBoundingClientRect();
        // Image center in canvas CSS coordinates
        const cxCss = view.tx + view.scale * (imgW / 2);
        const cyCss = view.ty + view.scale * (imgH / 2);
        // Convert to client coordinates (what zoomAtScreenPoint expects)
        const pivotX = rect.left + cxCss;
        const pivotY = rect.top + cyCss;
        zoomAtScreenPoint(pivotX, pivotY, requestedScale);
    }

    return {
        resetView,
        animatePanToCenter,
        clampPanAtMinScale,
        clientToImage,
        clampPan,
        zoomAtScreenPoint,
        zoomAtImageCenter,
    };
}

const BV = (window.BikeViewer ||= {});
BV.createViewHelpers = createViewHelpers;
