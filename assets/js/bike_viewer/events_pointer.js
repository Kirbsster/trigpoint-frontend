// events_pointer.js
export function addPointerEvents(deps) {
    const {
        canvas,
        state,
        view,
        crosshair,
        setDebug,
        invalidate,
        clientToImage,
        drawDotAtClient,
        nudgeSelectedPoint,
        rebuildBarsFromBodies,
        finalizeConnectChainAndSave,
        updateLinkButtonHighlight,
        updateTypeButtonHighlight,
        saveNowIfPossible,
        zoomAtScreenPoint,
        clampPan,
        animatePanToCenter,
        NUDGE_INNER_RADIUS,
        NUDGE_OUTER_RADIUS,
        viewer,
    } = deps;

    const BV = (window.BikeViewer ||= {});

    // Touch interaction
    const touchPoints = new Map();
    let pinchStart = null;

    // Pan/zoom interaction
    let isPanning = false;
    let panStart = null;

    function endPointer(e) {
        const msg = `pointerend: type=${e.pointerType}, button=${e.button}`;
        setDebug(msg);

        try {
            canvas.releasePointerCapture(e.pointerId);
        } catch (_) {
            // ignore if not captured
        }

        const wasDragging = !!state.draggingPointId;

        if (e.pointerType === "touch") {
            touchPoints.delete(e.pointerId);
            // No relaxToBaseView - user keeps the zoom/pan they left
            pinchStart = null;
        }

        if (e.pointerType === "mouse") {
            // No relaxToBaseView here either
        }

        isPanning = false;
        panStart = null;
        state.draggingPointId = null;

        if (wasDragging) {
            saveNowIfPossible();
        }
    }

    canvas.addEventListener("pointerdown", (e) => {
        // If the pointer is over any point / link pill, ignore this canvas pointerdown
        if (BV.isPointerOverPointToolButton(e.clientX, e.clientY)) {
            setDebug("pointerdown over point/link pill -> no point placement / pan");
            return;
        }

        canvas.setPointerCapture(e.pointerId);

        const imgPt = clientToImage(e.clientX, e.clientY);
        setDebug(
            `pointerdown: type=${e.pointerType}, button=${e.button}, x=${e.clientX.toFixed(
                1
            )}, y=${e.clientY.toFixed(1)}, activeType=${state.activeType || "none"} | img=(${imgPt.x.toFixed(
                1
            )}, ${imgPt.y.toFixed(1)})`
        );

        // 1) Nudge controls have highest priority
        const nudgeDir = BV.hitNudgeControlAtClient(e.clientX, e.clientY, {
            state,
            view,
            canvas,
            nudgeInnerRadius: NUDGE_INNER_RADIUS,
            nudgeOuterRadius: NUDGE_OUTER_RADIUS,
        });
        if (nudgeDir) {
            nudgeSelectedPoint(nudgeDir);
            return;
        }

        // 2) Shared hit-tests (used by mouse + touch)
        const hitPointId = BV.findNearestPointIdAtClient(e.clientX, e.clientY, {
            state,
            view,
            clientToImage,
        });
        const hitBodyId = BV.hitBodyAtClient(e.clientX, e.clientY, {
            state,
            view,
            clientToImage,
        });

        // 3) Body delete pill - but ONLY if we did NOT hit a point
        if (!hitPointId && state.selectedBodyId && state.bodyDeleteHit) {
            const dx = e.clientX - state.bodyDeleteHit.cx;
            const dy = e.clientY - state.bodyDeleteHit.cy;
            if (dx * dx + dy * dy <= state.bodyDeleteHit.r * state.bodyDeleteHit.r) {
                const before = state.bodies.length;
                state.bodies = state.bodies.filter((b) => b.id !== state.selectedBodyId);
                state.selectedBodyId = null;
                state.bodyDeleteHit = null;
                rebuildBarsFromBodies();
                invalidate(
                    `bars rebuilt after Deleted body; ${before} -> ${state.bodies.length}`
                );
                try {
                    if (
                        viewer &&
                        typeof viewer.saveBodies === "function"
                    ) {
                        viewer.saveBodies();
                    }
                } catch (err) {
                    console.warn("[BikeViewer] saveBodies from trash failed:", err);
                }
                return;
            }
        }

        if (state.activeType && e.button === 0) {
            const newPoint = drawDotAtClient(e.clientX, e.clientY);
            if (newPoint) {
                state.selectedPointId = newPoint.id;
                state.draggingPointId = null;
                state.selectedBodyId = null;
                invalidate(`Point placed and selected (mouse) ${newPoint.id}`);
            }
            state.activeType = null;
            updateTypeButtonHighlight();
            // hide crosshair now that we're done placing
            crosshair.visible = false;
            crosshair.x = null;
            crosshair.y = null;
            return;
        }

        // === TOUCH BRANCH ===
        if (e.pointerType === "touch") {
            touchPoints.set(e.pointerId, { x: e.clientX, y: e.clientY });

            // Two-finger pinch
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
                state.draggingPointId = null;
                return;
            }

            // Single-finger
            if (touchPoints.size === 1) {
                // 4) Link mode (touch) - only if we tapped a point
                if (state.connectMode && hitPointId) {
                    const last =
                        state.connectChain[state.connectChain.length - 1] || null;
                    if (!last) {
                        state.connectChain.push(hitPointId);
                        setDebug(`Body (touch): start at ${hitPointId}`);
                    } else if (last !== hitPointId) {
                        state.connectChain.push(hitPointId);
                        setDebug(`Body (touch): extended to ${hitPointId}`);
                    }
                    // Rebuild bars from existing bodies + temporary chain bars
                    rebuildBarsFromBodies();
                    for (let i = 0; i < state.connectChain.length - 1; i++) {
                        state.bars.push({
                            id: `bar_temp_touch_${i}`,
                            a: state.connectChain[i],
                            b: state.connectChain[i + 1],
                        });
                    }
                    invalidate("Bars rebuilt by touch");
                    return;
                }

                if (state.connectMode && !hitPointId && !hitBodyId) {
                    finalizeConnectChainAndSave(); // commits if >=2, discards if <2
                    state.connectMode = false;
                    state.connectChain = [];
                    if (typeof window !== "undefined") {
                        window.__link_mode = false;
                    }
                    updateLinkButtonHighlight();
                    setDebug("Connect mode: OFF (touch tap away)");
                    return;
                }

                // 5) Place new point (touch) - takes priority if a type is armed
                //    (and we're NOT in connectMode)
                if (!state.connectMode && state.activeType) {
                    const newPoint = drawDotAtClient(e.clientX, e.clientY);
                    if (newPoint) {
                        state.selectedPointId = newPoint.id;
                        state.selectedBodyId = null; // clear any body selection
                        state.draggingPointId = null;
                        invalidate(`Point placed and selected (touch) ${newPoint.id}`);
                    }
                    state.activeType = null;
                    updateTypeButtonHighlight();
                    return;
                }

                // 6) Point hit (touch) - points above bodies
                if (hitPointId) {
                    state.selectedPointId = hitPointId;
                    state.draggingPointId = hitPointId;
                    state.selectedBodyId = null; // touching a point clears body selection
                    state.bodyDeleteHit = null;
                    isPanning = false;
                    panStart = null;
                    invalidate(`Selected point ${hitPointId} (touch)`);
                    return;
                }

                // 7) If no point but we hit a body, select body
                if (hitBodyId) {
                    state.selectedBodyId = hitBodyId;
                    state.selectedPointId = null;
                    state.draggingPointId = null;
                    invalidate(`Selected body ${hitBodyId} (touch)`);
                    return;
                }

                // 8) Tap away: clear selections and save
                if (state.selectedPointId || state.selectedBodyId) {
                    state.selectedPointId = null;
                    state.selectedBodyId = null;
                    state.draggingPointId = null;
                    state.bodyDeleteHit = null;
                    invalidate("Deselected point/body (touch)");
                    saveNowIfPossible();
                    try {
                        if (
                            viewer &&
                            typeof viewer.saveBodies === "function"
                        ) {
                            viewer.saveBodies();
                        }
                    } catch (err) {
                        console.warn("[BikeViewer] saveBodies from touch deselect failed:", err);
                    }
                    return;
                }

                // 9) If we get here: pan start
                isPanning = true;
                panStart = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty };
                return;
            }

            return;
        }

        // === MOUSE BRANCH ===
        if (e.pointerType === "mouse") {
            // 4) Link mode (mouse) - only if we clicked a point
            if (state.connectMode && hitPointId) {
                const last =
                    state.connectChain[state.connectChain.length - 1] || null;
                if (!last) {
                    state.connectChain.push(hitPointId);
                    setDebug(`Body: start at ${hitPointId}`);
                } else if (last !== hitPointId) {
                    state.connectChain.push(hitPointId);
                    setDebug(`Body: extended to ${hitPointId}`);
                }
                rebuildBarsFromBodies();
                for (let i = 0; i < state.connectChain.length - 1; i++) {
                    state.bars.push({
                        id: `bar_temp_${i}`,
                        a: state.connectChain[i],
                        b: state.connectChain[i + 1],
                    });
                }
                invalidate("Bars rebuilt from mouse pointer");
                return;
            }
            if (state.connectMode && !hitPointId && !hitBodyId && e.button === 0) {
                finalizeConnectChainAndSave(); // commits if >=2, discards if <2
                state.connectMode = false;
                state.connectChain = [];
                if (typeof window !== "undefined") {
                    window.__link_mode = false;
                }
                updateLinkButtonHighlight();
                setDebug("Connect mode: OFF (mouse click away)");
                return;
            }

            // 5) Point hit (mouse) - points above bodies
            if (hitPointId) {
                state.selectedPointId = hitPointId;
                state.draggingPointId = hitPointId;
                state.selectedBodyId = null;
                state.bodyDeleteHit = null;
                isPanning = false;
                panStart = null;
                invalidate(`Selected point ${hitPointId} (mouse)`);
                return;
            }

            // 6) If no point but we hit a body, select body
            if (hitBodyId) {
                state.selectedBodyId = hitBodyId;
                state.selectedPointId = null;
                state.draggingPointId = null;
                invalidate(`Selected body ${hitBodyId} (mouse)`);
                return;
            }

            // 7) Click away: clear selections and save
            if (state.selectedPointId || state.selectedBodyId) {
                state.selectedPointId = null;
                state.selectedBodyId = null;
                state.draggingPointId = null;
                state.bodyDeleteHit = null;
                invalidate("Deselected point/body (mouse)");
                saveNowIfPossible();
                try {
                    if (
                        viewer &&
                        typeof viewer.saveBodies === "function"
                    ) {
                        viewer.saveBodies();
                    }
                } catch (err) {
                    console.warn("[BikeViewer] saveBodies from mouse deselect failed:", err);
                }
                return;
            }

            // 8) If an activeType is set and we left-clicked empty space, place new point
            if (state.activeType && e.button === 0) {
                const newPoint = drawDotAtClient(e.clientX, e.clientY);
                if (newPoint) {
                    state.selectedPointId = newPoint.id;
                    state.draggingPointId = null;
                    state.selectedBodyId = null;
                    invalidate(`Point placed and selected (mouse) ${newPoint.id}`);
                }
                state.activeType = null;
                updateTypeButtonHighlight();
                return;
            }

            // 9) Otherwise: pan
            if (!state.activeType && e.button === 0) {
                isPanning = true;
                panStart = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty };
            }
        }
    });

    canvas.addEventListener("pointermove", (e) => {
        // Mouse move
        if (e.pointerType === "mouse") {
            // Update crosshair position whenever we move over the canvas.
            const rect = canvas.getBoundingClientRect();
            crosshair.x = e.clientX - rect.left; // canvas CSS coords
            crosshair.y = e.clientY - rect.top;
            crosshair.visible = !!state.activeType; // only show when a point type is armed

            // we'll redraw below in all cases where we already call invalidate()
        }

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
                    const requestedScale = pinchStart.scale * rawFactor;

                    const minScale = view.minScale || 1;
                    const maxScale = 4.0;
                    const oldScale = view.scale;
                    const zoomingIn = requestedScale > pinchStart.scale + 1e-4;

                    // Pinch center in screen coords
                    const cx = (pts[0].x + pts[1].x) / 2;
                    const cy = (pts[0].y + pts[1].y) / 2;

                    // If already at min zoom and user keeps pinching out, pan to center
                    if (!zoomingIn && oldScale <= minScale + 1e-4) {
                        animatePanToCenter();
                        setDebug(
                            `pinch: at min zoom, panning image to center (dist=${dist.toFixed(1)})`
                        );
                        return;
                    }

                    // If trying to go past min, clamp at min
                    if (!zoomingIn && requestedScale < minScale) {
                        zoomAtScreenPoint(cx, cy, minScale);
                        if (typeof clampPan === "function") {
                            clampPan();
                        }
                        invalidate(
                            `pinch: clamped to min scale=${view.scale.toFixed(3)}`
                        );
                        return;
                    }

                    // Normal clamped pinch zoom
                    const targetScale = Math.min(maxScale, Math.max(minScale, requestedScale));
                    zoomAtScreenPoint(cx, cy, targetScale);
                    if (typeof clampPan === "function") {
                        clampPan();
                    }
                    invalidate(
                        `pinch: dist=${dist.toFixed(1)}, scale=${view.scale.toFixed(
                            3
                        )} @ (${cx.toFixed(1)}, ${cy.toFixed(1)})`
                    );
                }
                return;
            }

            if (touchPoints.size === 1 && state.draggingPointId) {
                const imgPt = clientToImage(e.clientX, e.clientY);
                const p = state.points.find((pt) => pt.id === state.draggingPointId);
                if (p) {
                    p.x = imgPt.x;
                    p.y = imgPt.y;
                    invalidate();
                }
                return;
            }

            if (touchPoints.size === 1 && isPanning && panStart) {
                const dx = e.clientX - panStart.x;
                const dy = e.clientY - panStart.y;
                view.tx = panStart.tx + dx;
                view.ty = panStart.ty + dy;
                clampPan();
                invalidate();
            }
            return;
        }

        // Mouse move
        if (state.draggingPointId) {
            const imgPt = clientToImage(e.clientX, e.clientY);
            const p = state.points.find((pt) => pt.id === state.draggingPointId);
            if (p) {
                p.x = imgPt.x;
                p.y = imgPt.y;
                invalidate();
            }
            return;
        }

        if (isPanning && panStart) {
            const dx = e.clientX - panStart.x;
            const dy = e.clientY - panStart.y;
            view.tx = panStart.tx + dx;
            view.ty = panStart.ty + dy;
            clampPan();
            invalidate();
        }

        // Free-move crosshair when in placement mode
        if (e.pointerType === "mouse") {
            if (state.activeType) {
                const rect = canvas.getBoundingClientRect();
                crosshair.x = e.clientX - rect.left;
                crosshair.y = e.clientY - rect.top;
                crosshair.visible = true;
            } else {
                crosshair.visible = false;
                crosshair.x = null;
                crosshair.y = null;
            }
            invalidate();
        }
    });

    canvas.addEventListener("pointerleave", () => {
        crosshair.visible = false;
        crosshair.x = null;
        crosshair.y = null;
        invalidate();
    });

    canvas.addEventListener("pointerup", endPointer);
    canvas.addEventListener("pointercancel", endPointer);

    canvas.addEventListener(
        "wheel",
        (e) => {
            e.preventDefault();

            const factor = Math.pow(1.0015, -e.deltaY);
            const oldScale = view.scale;
            const requestedScale = oldScale * factor;
            const minScale = view.minScale || 1;
            const maxScale = 4.0;
            const zoomingIn = factor > 1;

            // If we are already at min zoom and user tries to zoom out more,
            // don't change scale - instead pan to image center.
            if (!zoomingIn && oldScale <= minScale + 1e-4) {
                animatePanToCenter();
                setDebug("At min zoom: panning image back to center");
                return;
            }

            // If zooming out past the min scale, clamp to min and stop there
            if (!zoomingIn && requestedScale < minScale) {
                zoomAtScreenPoint(e.clientX, e.clientY, minScale);
                if (typeof clampPan === "function") {
                    clampPan();
                }
                invalidate(
                    `wheel: clamped to min scale=${view.scale.toFixed(3)}`
                );
                return;
            }

            // Normal zoom (within [minScale, maxScale])
            const targetScale = Math.min(maxScale, Math.max(minScale, requestedScale));
            zoomAtScreenPoint(e.clientX, e.clientY, targetScale);

            if (typeof clampPan === "function") {
                clampPan();
            }
            invalidate(
                `wheel: deltaY=${e.deltaY.toFixed(2)}, scale=${view.scale.toFixed(3)}`
            );
        },
        { passive: false }
    );
}

const BV = (window.BikeViewer ||= {});
BV.addPointerEvents = addPointerEvents;
