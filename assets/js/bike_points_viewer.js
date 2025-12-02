// bike_points_viewer.js
// Canvas-centric viewer: the canvas draws the image and the points.
// Points live in IMAGE coordinates, so geometry is resolution- and device-independent.

(function () {
    function log(...args) {
        console.log("[BikeViewer]", ...args);
    }

    window.initBikePointsViewer = function initBikePointsViewer(containerId, initialData) {
        log("initBikePointsViewer called with:", containerId, initialData);

        const container = document.getElementById("bike-viewer-container");
        if (!container) {
            console.error("[BikeViewer] container not found:", containerId);
            return;
        }

        const inner = container.querySelector("#bike-viewer-inner") || container;
        const img = inner.querySelector("img");
        if (!img) {
            console.error("[BikeViewer] no <img> found inside container");
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

        // --- State ---
        const points = []; // { id, type, name, x, y } in IMAGE coordinates (pixels)
        let nextId = 1;

        let activeType = null;
        let selectedPointId = null;
        let draggingPointId = null;

        // Image intrinsic size
        let imgW = 0;
        let imgH = 0;

        // View transform: maps image coords -> canvas screen coords (CSS px)
        const view = {
            scale: 1, // CSS px per image px
            tx: 0,    // translation in CSS px
            ty: 0,
        };

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
        container.appendChild(debug);

        function setDebug(text) {
            debug.textContent = text;
            log(text);
        }

        // === Type button highlight (React/Reflex buttons) ===
        function updateTypeButtonHighlight() {
            const buttons = document.querySelectorAll(".point-type-btn");
            buttons.forEach((btn) => {
                const btnType = btn.dataset.pointType;
                const isActive = btnType === activeType;
                if (isActive) {
                    btn.style.background = "rgba(0, 229, 255, 0.16)";
                    btn.style.borderColor = "#00e5ff";
                    btn.style.boxShadow = "0 0 6px rgba(0, 229, 255, 0.6)";
                } else {
                    btn.style.background = "";
                    btn.style.borderColor = "";
                    btn.style.boxShadow = "";
                }
            });
        }

        // === Geometry helpers ===

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
                drawAll();
            }
        }

        function resetView() {
            if (!imgW || !imgH) return;

            const dpr = Math.max(1, window.devicePixelRatio || 1);
            const wCss = canvas.width / dpr;
            const hCss = canvas.height / dpr;

            const sx = wCss / imgW;
            const sy = hCss / imgH;
            const scale = Math.min(sx, sy);

            const drawW = imgW * scale;
            const drawH = imgH * scale;

            view.scale = scale;
            view.tx = (wCss - drawW) / 2;
            view.ty = (hCss - drawH) / 2;

            drawAll();
            setDebug("View reset");
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

        // Hit-test: nearest point in image space, with ~10px radius on screen
        function findNearestPointIdAtClient(clientX, clientY) {
            const imgPt = clientToImage(clientX, clientY);
            let bestId = null;

            const screenRadiusPx = 10;
            const hitRadiusImg = screenRadiusPx / view.scale;
            const hitRadiusImg2 = hitRadiusImg * hitRadiusImg;

            for (const p of points) {
                const dx = p.x - imgPt.x;
                const dy = p.y - imgPt.y;
                const d2 = dx * dx + dy * dy;
                if (d2 <= hitRadiusImg2) {
                    bestId = p.id;
                }
            }
            return bestId;
        }

        // Place a point in image space at a client position
        function drawDotAtClient(clientX, clientY) {
            if (!activeType) {
                setDebug("Click ignored: no active point type.");
                return null;
            }
            const imgPt = clientToImage(clientX, clientY);
            const point = {
                id: `pt_${nextId++}`,
                type: activeType,
                name: null,
                x: imgPt.x,
                y: imgPt.y,
            };
            points.push(point);

            setDebug(
                `Placed point id=${point.id}, type=${point.type}, img=(${imgPt.x.toFixed(
                    1
                )}, ${imgPt.y.toFixed(1)})`
            );

            drawAll();
            return point;
        }

        // === Nudge controls around selected point (donut with arrows) ===

        const NUDGE_INNER_RADIUS = 32; // px on screen
        const NUDGE_OUTER_RADIUS = 70; // px on screen
        const NUDGE_STEP_IMAGE = 0.5;  // image-space units

        function drawNudgeControlsForSelectedPoint() {
            if (!selectedPointId) return;
            const p = points.find((pt) => pt.id === selectedPointId);
            if (!p) return;

            const dpr = Math.max(1, window.devicePixelRatio || 1);

            // Image -> screen (CSS px relative to canvas)
            const cxCss = p.x * view.scale + view.tx;
            const cyCss = p.y * view.scale + view.ty;

            // Convert to device pixels for drawing
            const cx = cxCss * dpr;
            const cy = cyCss * dpr;

            const innerR = NUDGE_INNER_RADIUS * dpr;
            const outerR = NUDGE_OUTER_RADIUS * dpr;

            ctx.save();
            ctx.globalAlpha = 0.6;

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
            drawSector(-135, -45, "rgba(0, 229, 255, 0.22)");
            drawSector(-45, 45, "rgba(0, 229, 255, 0.22)");
            drawSector(45, 135, "rgba(0, 229, 255, 0.22)");
            drawSector(135, 225, "rgba(0, 229, 255, 0.22)");

            ctx.globalAlpha = 0.9;
            ctx.fillStyle = "#00e5ff";

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

            ctx.restore();
        }

        function hitNudgeControlAtClient(clientX, clientY) {
            if (!selectedPointId) return null;
            const p = points.find((pt) => pt.id === selectedPointId);
            if (!p) return null;

            const canvasRect = canvas.getBoundingClientRect();

            const cxCss = p.x * view.scale + view.tx;
            const cyCss = p.y * view.scale + view.ty;

            const cxScreen = canvasRect.left + cxCss;
            const cyScreen = canvasRect.top + cyCss;

            const dx = clientX - cxScreen;
            const dy = clientY - cyScreen;
            const r = Math.hypot(dx, dy);

            if (r < NUDGE_INNER_RADIUS || r > NUDGE_OUTER_RADIUS) return null;

            let angle = (Math.atan2(dy, dx) * 180) / Math.PI;

            if (angle >= -135 && angle < -45) return "up";
            if (angle >= -45 && angle < 45) return "right";
            if (angle >= 45 && angle < 135) return "down";
            if (angle >= 135 || angle < -135) return "left";
            return null;
        }

        function nudgeSelectedPoint(direction) {
            if (!selectedPointId) return;
            const p = points.find((pt) => pt.id === selectedPointId);
            if (!p) return;

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
            drawAll();
            setDebug(`Nudged ${direction}`);
        }

        // === Drawing ===

        function drawAll() {
            const dpr = Math.max(1, window.devicePixelRatio || 1);

            // Clear
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (!imgW || !imgH) {
                // simple placeholder
                ctx.fillStyle = "#00e5ff";
                ctx.font = `${12 * dpr}px system-ui`;
                ctx.fillText("BikeViewer: image not ready", 10 * dpr, 20 * dpr);
                return;
            }

            // Apply view transform: image coords -> device pixels
            ctx.setTransform(
                view.scale * dpr,
                0,
                0,
                view.scale * dpr,
                view.tx * dpr,
                view.ty * dpr
            );

            // Draw the image at (0,0) in image coords
            ctx.drawImage(img, 0, 0, imgW, imgH);

            // Draw points in image space, with roughly constant screen radius
            const baseRadiusPx = 6;

            points.forEach((p) => {
                const isSelected = p.id === selectedPointId;
                const screenRadiusPx = baseRadiusPx * (isSelected ? 1.4 : 1.0);
                const radiusImg = screenRadiusPx / view.scale;

                ctx.beginPath();
                ctx.arc(p.x, p.y, radiusImg, 0, Math.PI * 2);

                if (isSelected) {
                    ctx.fillStyle = "#ffffff";
                    ctx.strokeStyle = "#00e5ff";
                    ctx.lineWidth = (2 / view.scale);
                    ctx.fill();
                    ctx.stroke();
                } else {
                    ctx.fillStyle = "#00e5ff";
                    ctx.fill();
                }
            });

            // Reset to screen space for HUD / nudge
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            drawNudgeControlsForSelectedPoint();
        }

        // === Zoom ===

        function zoomAtScreenPoint(clientX, clientY, newScale) {
            const rect = canvas.getBoundingClientRect();
            const sx = clientX - rect.left;
            const sy = clientY - rect.top;

            const oldScale = view.scale;
            const minScale = 0.25;
            const maxScale = 4.0;
            const clamped = Math.min(maxScale, Math.max(minScale, newScale));
            if (clamped === oldScale) return;

            // Point in image space currently under the cursor
            const Qx = (sx - view.tx) / oldScale;
            const Qy = (sy - view.ty) / oldScale;

            // New translation so that Q stays under the same screen point
            view.scale = clamped;
            view.tx = sx - Qx * view.scale;
            view.ty = sy - Qy * view.scale;

            drawAll();
        }

        // === Pointer handlers ===

        canvas.addEventListener("pointerdown", (e) => {
            canvas.setPointerCapture(e.pointerId);

            const imgPt = clientToImage(e.clientX, e.clientY);
            setDebug(
                `pointerdown: type=${e.pointerType}, button=${e.button}, x=${e.clientX.toFixed(
                    1
                )}, y=${e.clientY.toFixed(1)}, activeType=${activeType || "none"} | img=(${imgPt.x.toFixed(
                    1
                )}, ${imgPt.y.toFixed(1)})`
            );

            // Nudge controls have priority if a point is selected
            const nudgeDir = hitNudgeControlAtClient(e.clientX, e.clientY);
            if (nudgeDir) {
                nudgeSelectedPoint(nudgeDir);
                return;
            }

            if (e.pointerType === "touch") {
                touchPoints.set(e.pointerId, { x: e.clientX, y: e.clientY });

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
                    draggingPointId = null;
                    return;
                }

                if (touchPoints.size === 1) {
                    const hitId = findNearestPointIdAtClient(e.clientX, e.clientY);
                    if (hitId) {
                        selectedPointId = hitId;
                        draggingPointId = hitId;
                        isPanning = false;
                        panStart = null;
                        drawAll();
                        setDebug(`Selected point ${hitId} (touch)`);
                        return;
                    }

                    if (selectedPointId && !hitId) {
                        selectedPointId = null;
                        draggingPointId = null;
                        drawAll();
                        setDebug("Deselected point (touch)");
                    }

                    if (activeType) {
                        const newPoint = drawDotAtClient(e.clientX, e.clientY);
                        if (newPoint) {
                            selectedPointId = newPoint.id;
                            draggingPointId = null;
                        }
                        activeType = null;
                        updateTypeButtonHighlight();
                        setDebug("Point placed, type disarmed (touch)");
                        return;
                    }

                    isPanning = true;
                    panStart = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty };
                    return;
                }
                return;
            }

            // --- Mouse ---
            if (e.pointerType === "mouse") {
                const hitId = findNearestPointIdAtClient(e.clientX, e.clientY);
                if (hitId) {
                    selectedPointId = hitId;
                    draggingPointId = hitId;
                    isPanning = false;
                    panStart = null;
                    drawAll();
                    setDebug(`Selected point ${hitId} (mouse)`);
                    return;
                }

                if (selectedPointId) {
                    selectedPointId = null;
                    draggingPointId = null;
                    drawAll();
                    setDebug("Deselected point (mouse)");
                }

                if (activeType && e.button === 0) {
                    const newPoint = drawDotAtClient(e.clientX, e.clientY);
                    if (newPoint) {
                        selectedPointId = newPoint.id;
                        draggingPointId = null;
                    }
                    activeType = null;
                    updateTypeButtonHighlight();
                    setDebug("Point placed, type disarmed (mouse)");
                    return;
                }

                if (!activeType && e.button === 0) {
                    isPanning = true;
                    panStart = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty };
                }
            }
        });

        canvas.addEventListener("pointermove", (e) => {
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
                        const targetScale = pinchStart.scale * rawFactor;
                        const cx = (pts[0].x + pts[1].x) / 2;
                        const cy = (pts[0].y + pts[1].y) / 2;
                        zoomAtScreenPoint(cx, cy, targetScale);
                        setDebug(
                            `pinch: dist=${dist.toFixed(1)}, scale=${view.scale.toFixed(
                                3
                            )} @ (${cx.toFixed(1)}, ${cy.toFixed(1)})`
                        );
                    }
                    return;
                }

                if (touchPoints.size === 1 && draggingPointId) {
                    const imgPt = clientToImage(e.clientX, e.clientY);
                    const p = points.find((pt) => pt.id === draggingPointId);
                    if (p) {
                        p.x = imgPt.x;
                        p.y = imgPt.y;
                        drawAll();
                    }
                    return;
                }

                if (touchPoints.size === 1 && isPanning && panStart) {
                    const dx = e.clientX - panStart.x;
                    const dy = e.clientY - panStart.y;
                    view.tx = panStart.tx + dx;
                    view.ty = panStart.ty + dy;
                    drawAll();
                }
                return;
            }

            // Mouse move
            if (draggingPointId) {
                const imgPt = clientToImage(e.clientX, e.clientY);
                const p = points.find((pt) => pt.id === draggingPointId);
                if (p) {
                    p.x = imgPt.x;
                    p.y = imgPt.y;
                    drawAll();
                }
                return;
            }

            if (isPanning && panStart) {
                const dx = e.clientX - panStart.x;
                const dy = e.clientY - panStart.y;
                view.tx = panStart.tx + dx;
                view.ty = panStart.ty + dy;
                drawAll();
            }
        });

        function endPointer(e) {
            const msg = `pointerend: type=${e.pointerType}, button=${e.button}`;
            setDebug(msg);
            canvas.releasePointerCapture(e.pointerId);

            if (e.pointerType === "touch") {
                touchPoints.delete(e.pointerId);
                if (touchPoints.size < 2) {
                    pinchStart = null;
                }
            }
            isPanning = false;
            panStart = null;
            draggingPointId = null;
        }

        canvas.addEventListener("pointerup", endPointer);
        canvas.addEventListener("pointercancel", endPointer);

        canvas.addEventListener(
            "wheel",
            (e) => {
                e.preventDefault();
                const factor = Math.pow(1.0015, -e.deltaY);
                const newScale = view.scale * factor;
                zoomAtScreenPoint(e.clientX, e.clientY, newScale);
                setDebug(
                    `wheel: deltaY=${e.deltaY.toFixed(2)}, scale=${view.scale.toFixed(
                        3
                    )} @ (${e.clientX.toFixed(1)}, ${e.clientY.toFixed(1)})`
                );
            },
            { passive: false }
        );

        const KEY_NUDGE = 0.5; // image-space units
        window.addEventListener("keydown", (e) => {
            if (!selectedPointId) return;

            const ae = document.activeElement;
            if (
                ae &&
                (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA" || ae.isContentEditable)
            ) {
                return;
            }

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

            const p = points.find((pt) => pt.id === selectedPointId);
            if (!p) return;
            p.x += dx;
            p.y += dy;
            drawAll();
        });

        // === Image load & bootstrapping ===

        function onImageReady() {
            imgW = img.naturalWidth;
            imgH = img.naturalHeight;

            // We only need the image as a source for drawImage; hide the DOM copy
            img.style.display = "none";

            setDebug(`Image ready. natural=${imgW}×${imgH}`);
            resizeCanvas();
        }

        if (img.complete && img.naturalWidth > 0) {
            onImageReady();
        } else {
            img.addEventListener("load", onImageReady, { once: true });
        }

        window.addEventListener("resize", resizeCanvas);

        // === Public API for Reflex hooks ===
        container.bikeViewer = {
            ping() {
                setDebug("bikeViewer.ping() called from console");
            },
            setType(type) {
                activeType = type ? String(type) : null;
                updateTypeButtonHighlight();
                setDebug("Active type: " + (activeType || "none"));
                log("Point type set to:", activeType);
            },
            resetView() {
                resetView();
            },
            // TODO: getPoints(), setPoints() etc for backend sync.
        };

        setDebug("BikeViewer initialised. Tap/click to place points.");
    };

    // Auto-boot
    function autoBoot() {
        const containerId = "bike-viewer-container";
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn("[BikeViewer] autoBoot: container not found yet, will retry...");
            setTimeout(autoBoot, 200);
            return;
        }
        window.initBikePointsViewer(containerId, {});
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", autoBoot);
    } else {
        autoBoot();
    }
})();