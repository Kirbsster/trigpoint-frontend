export function initBikePointsViewer(container, config = {}) {
    const containerEl =
        typeof container === "string"
            ? document.getElementById(container)
            : container;

    if (!containerEl) {
        console.error("[BikeViewer] initBikePointsViewer: container not found");
        return;
    }

    const viewer = (containerEl.bikeViewer ??= {});
    viewer.config = config;

    const bikeId = containerEl.dataset.bikeId || null;

    viewer.scale_mm_per_px ??= null;
    viewer.activeScaleMeasurementId ??= null;
    viewer.measurementValues ??= {};
    viewer.points ??= [];
    viewer.bodies ??= [];

    const BV = window.BikeViewer;
    const { makeDefaultState, getState } = BV;

    const state = getState(viewer, bikeId);

    let __bv_needs_draw = false;
    // Coalesce redraws into a single animation frame.
    // Schedule a render pass and optional debug message.
    function invalidate(msg) {
        if (msg) setDebug(msg);
        if (__bv_needs_draw) return;
        __bv_needs_draw = true;
        requestAnimationFrame(() => {
            __bv_needs_draw = false;
            drawAll();
        });
    }

    const log = (...args) => BV.log(...args);
    const setDebug = (text) => BV.setDebug(containerEl, text);
    const cssVar = (name) => BV.cssVar(name);
    const inner = containerEl.querySelector("#bike-viewer-inner") || containerEl;
    const img = inner.querySelector("img");

    if (!img) {
        console.error("[BikeViewer] no <img> found inside containerEl");
        return;
    }

    // Canvas overlay for draw layers and pointer hit tests.
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.pointerEvents = "auto";
    canvas.style.touchAction = "none";
    inner.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    if (!bikeId && window.location && window.location.pathname) {
        const m = window.location.pathname.match(/bike_analyser\/([^/]+)/);
        if (m && m[1]) {
            bikeId = m[1];
            console.log("[BikeViewer] Fallback bikeId from URL:", bikeId);
        }
    }

    const accessToken = containerEl.dataset.accessToken || null;

    console.log("[BikeViewer] bikeId from dataset/URL:", bikeId);

    const recomputeNextIdFromPoints = () => BV.recomputeNextIdFromPoints(state);

    const rebuildBarsFromBodies = () => BV.rebuildBarsFromBodies(state);

    const getPtsByType = () => BV.getPtsByType(state.points);

    // Measurement system wires into render and geometry updates.
    const measurements = BV.createMeasurements({
        BV,
        viewer,
        containerEl,
        bikeId,
        accessToken,
        state,
        getPtsByType,
        setDebug,
        invalidate,
        drawAll,
    });
    const {
        measureDefs,
        measurementDom,
        measurementValues,
        getActiveScaleMeasurementId,
        setActiveScaleMeasurementId,
        recomputeMeasurementsFromScale,
        updateMeasurementsOverlay,
    } = measurements;

    const shockUi = BV.createShockStrokeInput({
        BV,
        containerEl,
        cssVar,
        bikeId,
        accessToken,
        state,
        invalidate,
        setDebug,
    });
    const { shockStrokeInput, setLastValidShockStroke } = shockUi;

    let crosshair = {
        x: null,
        y: null,
        visible: false,
    };
    let imgW = 0;
    let imgH = 0;

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
    containerEl.appendChild(debug);

    function updateTypeButtonHighlight() {
        BV.updateTypeButtonHighlight(state.activeType);
    }

    function updateLinkButtonHighlight() {
        BV.updateLinkButtonHighlight(state.connectMode, state.activeLinkType);
    }

    // View transform shared by draw and input.
    const view = {
        scale: 1,
        tx: 0,
        ty: 0,
        minScale: 1,
        baseTx: 0,
        baseTy: 0,
    };
    const viewHelpers = BV.createViewHelpers({
        view,
        canvas,
        getImageSize: () => ({ w: imgW, h: imgH }),
        invalidate,
    });
    const {
        resetView,
        animatePanToCenter,
        clientToImage,
        clampPan,
        zoomAtScreenPoint,
        zoomAtImageCenter,
    } = viewHelpers;

    // Resize canvas to container and re-fit view if image is loaded.
    function resizeCanvas() {
        const rect = inner.getBoundingClientRect();
        const dpr = Math.max(1, window.devicePixelRatio || 1);

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + "px";
        canvas.style.height = rect.height + "px";

        if (imgW && imgH) {
            resetView();
        } else {
            invalidate();
        }
    }

    const findShockBody = () => BV.findShockBody(state.bodies);
    const findShockBar = () => BV.findShockBar(state.bodies, state.bars);

    // Actions mutate state and invalidate the render loop.
    const actions = BV.createActions({
        state,
        clientToImage,
        invalidate,
        setDebug,
        saveNowIfPossible,
    });
    const { drawDotAtClient, nudgeSelectedPoint } = actions;

    const NUDGE_INNER_RADIUS = 32;
    const NUDGE_OUTER_RADIUS = 70;

    function resetPerspectiveState() {
        state.perspective.points = [];
        state.perspective.nextId = 1;
        state.perspective.stage = "rear";
        state.perspective.active = true;
        state.perspective.preview = false;
        state.perspective.selectedPointId = null;
        state.perspective.draggingPointId = null;
    }

    function clearPerspectiveState() {
        state.perspective.points = [];
        state.perspective.nextId = 1;
        state.perspective.stage = "rear";
        state.perspective.active = false;
        state.perspective.preview = false;
        state.perspective.selectedPointId = null;
        state.perspective.draggingPointId = null;
        setDebug("Perspective cleared");
        invalidate("Perspective reset");
        savePerspectiveNowIfPossible();
    }

    function updatePerspectiveStage() {
        const p = state.perspective;
        const rearCount = (p.points || []).filter((pt) => pt.type === "rear").length;
        const frontCount = (p.points || []).filter((pt) => pt.type === "front").length;

        if (rearCount < 4) {
            p.stage = "rear";
            return;
        }
        if (frontCount < 4) {
            p.stage = "front";
            return;
        }
        p.stage = "done";
    }

    function setPerspectiveMode(mode) {
        const p = state.perspective;
        const enable = mode === "toggle" ? !p.active : !!mode;
        if (enable) {
            if (p.stage === "done") {
                resetPerspectiveState();
            } else {
                p.active = true;
            }
            setDebug("Perspective: click rear rim N/E/S/W");
        } else {
            p.active = false;
            setDebug("Perspective: off");
        }
        invalidate("Perspective mode updated");
    }

    function handlePerspectiveClick(clientX, clientY) {
        const p = state.perspective;
        if (!p.active) return false;
        if (p.stage !== "rear" && p.stage !== "front" && p.stage !== "done") return false;

        const hit = BV.findNearestPointIdAtClient(clientX, clientY, {
            state,
            view,
            clientToImage,
            points: p.points,
        });
        if (hit) {
            p.selectedPointId = hit;
            p.draggingPointId = hit;
            invalidate("Perspective point selected");
            return true;
        }

        if (p.stage === "done") return true;

        const targetGroup = p.stage === "rear" ? "rear" : "front";
        const targetCount = (p.points || []).filter((pt) => pt.type === targetGroup).length;
        if (targetCount >= 4) return true;

        const newPoint = BV.placePointAtClient({
            x: clientX,
            y: clientY,
            points: p.points,
            type: targetGroup,
            getNextId: () => p.nextId,
            setNextId: (v) => {
                p.nextId = v;
            },
            idPrefix: "persp_",
            clientToImage,
            invalidate,
            setDebug,
        });
        if (!newPoint) return true;

        const rearCount = (p.points || []).filter((pt) => pt.type === "rear").length;
        const frontCount = (p.points || []).filter((pt) => pt.type === "front").length;
        if (rearCount === 4 && p.stage === "rear") {
            p.stage = "front";
            setDebug("Rear rim set. Click front rim N/E/S/W");
        } else if (frontCount === 4 && p.stage === "front") {
            p.stage = "done";
            p.active = false;
            setDebug("Perspective points captured");
        } else {
            const count = targetGroup === "rear" ? rearCount : frontCount;
            setDebug(`${p.stage} rim: ${count}/4`);
        }

        p.selectedPointId = newPoint.id;
        p.draggingPointId = null;

        invalidate("Perspective point added");
        savePerspectiveNowIfPossible();
        return true;
    }
    // Hydrate measurement values and scale from backend geometry payload.
    function loadGeometryFromBikeDoc(bikeDoc) {
        const g = bikeDoc?.geometry || {};

        if (typeof g.scale_mm_per_px === "number" && g.scale_mm_per_px > 0) {
            viewer.scale_mm_per_px = g.scale_mm_per_px;
        }

        if (typeof g.scale_source === "string") {
            setActiveScaleMeasurementId(g.scale_source);
        }

        if (typeof g.rear_center_mm === "number") measurementValues.rear_center = g.rear_center_mm;
        if (typeof g.wheelbase_mm === "number") measurementValues.wheelbase = g.wheelbase_mm;
        if (typeof g.front_center_mm === "number") measurementValues.front_center = g.front_center_mm;

    }


    // Position shock stroke pill based on current points and view.
    const updateShockStrokePill = (pointById) => BV.updateShockStrokePill({
        pointById,
        findShockBar,
        shockStrokeInput,
        view,
        state,
        viewer,
        setDebug,
    });

    // Render all draw layers and overlays.
    function drawAll() {
        BV.renderBikeViewer(state, {
            ctx,
            canvas,
            img,
            imgW,
            imgH,
            view,
            cssVar,
            scaleMmPerPx: viewer?.scale_mm_per_px,
            crosshair,
            perspective: state.perspective,
            updateMeasurementsOverlay,
            measurement: {
                containerEl,
                measureDefs,
                measurementDom,
                activeScaleMeasurementId: getActiveScaleMeasurementId(),
                measurementValues,
            },
            updateShockStrokePill,
            findShockBar,
            nudgeInnerRadius: NUDGE_INNER_RADIUS,
            nudgeOuterRadius: NUDGE_OUTER_RADIUS,
        });
    }

    // Fire-and-forget point autosave if the viewer hook exists.
    function saveNowIfPossible() {
        try {
            if (
                viewer &&
                typeof viewer.savePoints === "function"
            ) {
                viewer.savePoints();
            }
        } catch (err) {
            console.warn("[BikeViewer] autosave failed:", err);
        }
    }

    function savePerspectiveNowIfPossible() {
        try {
            if (typeof savePerspectivePoints === "function") {
                savePerspectivePoints();
            }
        } catch (err) {
            console.warn("[BikeViewer] perspective save failed:", err);
        }
    }

    const recomputeNextBodyIdFromBodies = () => BV.recomputeNextBodyIdFromBodies(state);

    // End link-chain mode and save bodies when appropriate.
    function finalizeConnectChainAndSave() {
        const action = BV.finalizeConnectChain(state);
        if (action === "empty") {
            setDebug("Connect chain empty, nothing to save");
            return;
        }
        if (action === "discard") {
            rebuildBarsFromBodies();
            invalidate("rebuilt bars after finalising connect chain and save");
            return;
        }

        if (action === "create") {
            createBodyFromChain(state.activeLinkType);
        }
    }

    // Build a body from the current connect chain and persist it.
    function createBodyFromChain(linkType) {
        const body = BV.createBodyFromChain(state, linkType);
        if (!body) return;

        rebuildBarsFromBodies();
        invalidate(
            `bars rebuilt Body ${body.id} [${body.type || "link"}] created with ${body.point_ids.length} points`
        );

        try {
            if (viewer && typeof viewer.saveBodies === "function") {
                viewer.saveBodies();
            }
        } catch (err) {
            console.warn("[BikeViewer] saveBodies from createBodyFromChain failed:", err);
        }
    }

    const backendIO = BV.createBackendIO({
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
    });
    const { loadInitialPoints, loadBodies, saveBodiesHelper, savePoints, savePerspectivePoints } = backendIO;

    // Wire input handlers after dependencies are ready.
    BV.addPointerEvents({
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
        savePerspectiveNowIfPossible,
        zoomAtScreenPoint,
        clampPan,
        animatePanToCenter,
        NUDGE_INNER_RADIUS,
        NUDGE_OUTER_RADIUS,
        viewer,
        handlePerspectiveClick,
        updatePerspectiveStage,
    });

    BV.addKeyboardEvents({
        state,
        crosshair,
        updateTypeButtonHighlight,
        invalidate,
    });

    // Initialize view, then load points/bodies once the image is ready.
    function onImageReady() {
        imgW = img.naturalWidth;
        imgH = img.naturalHeight;

        img.style.display = "none";

        resizeCanvas();
        invalidate(`Image ready. natural=${imgW}×${imgH}`);

        loadInitialPoints();
        loadBodies();
    }

    if (img.complete && img.naturalWidth > 0) {
        onImageReady();
    } else {
        img.addEventListener("load", onImageReady, { once: true });
    }

    window.addEventListener("resize", resizeCanvas);

    Object.assign(viewer, {
        ping() {
            setDebug("bikeViewer.ping() called from console");
        },
        setType(type, options) {
            const newType = type ? String(type) : null;
            const opts = options || {};

            if (state.connectMode) {
                if (state.connectChain.length >= 2) {
                    createBodyFromChain(state.activeLinkType);
                } else if (state.connectChain.length > 0) {
                    state.connectChain = [];
                    rebuildBarsFromBodies();
                    invalidate(
                        "Discarding partial link chain (link mode cancelled via type change)"
                    );
                }
                state.connectMode = false;
                state.activeLinkType = null;
                if (typeof window !== "undefined") {
                    window.__link_mode = false;
                }
                updateLinkButtonHighlight();
            }

            if (state.activeType === newType) {
                state.activeType = null;
                if (typeof crosshair !== "undefined") {
                    crosshair.visible = false;
                    crosshair.x = null;
                    crosshair.y = null;
                }
                updateTypeButtonHighlight();
                invalidate("Point placement cancelled (button toggle)");
                return;
            }

            state.activeType = newType;
            if (typeof crosshair !== "undefined") {
                crosshair.visible = !!state.activeType;
                if (!state.activeType) {
                    crosshair.x = null;
                    crosshair.y = null;
                }
            }
            updateTypeButtonHighlight();
            log("Point type set to:", state.activeType);
            invalidate("Active type: " + (state.activeType || "none"));
        },

        resetView() {
            resetView();
        },

        setLinkType(type, options) {
            const newType = type ? String(type) : null;
            const opts = options || {};

            if (state.activeType) {
                state.activeType = null;
                if (typeof crosshair !== "undefined") {
                    crosshair.visible = false;
                    crosshair.x = null;
                    crosshair.y = null;
                }
                updateTypeButtonHighlight();
            }

            if (state.connectMode) {
                if (state.activeLinkType === newType) {
                    if (state.connectChain.length >= 2) {
                        createBodyFromChain(state.activeLinkType);
                    } else if (state.connectChain.length > 0) {
                        state.connectChain = [];
                        rebuildBarsFromBodies();
                        invalidate("Discarding partial link chain (link tool toggled off)");
                    }
                    state.connectMode = false;
                    state.activeLinkType = null;
                    state.connectChain = [];
                    if (typeof window !== "undefined") {
                        window.__link_mode = false;
                    }
                    updateLinkButtonHighlight();
                    setDebug("Link mode: OFF");
                    return;
                }

                if (state.connectChain.length >= 2) {
                    createBodyFromChain(state.activeLinkType);
                } else if (state.connectChain.length > 0) {
                    state.connectChain = [];
                    rebuildBarsFromBodies();
                    invalidate("Discarding partial link chain (link type changed)");
                }

                state.activeLinkType = newType;
                if (typeof window !== "undefined") {
                    window.__link_mode = true;
                }
                updateLinkButtonHighlight();
                setDebug("Link mode: ON (" + state.activeLinkType + ")");
                return;
            }

            if (newType) {
                state.connectMode = true;
                state.activeLinkType = newType;
                state.connectChain = [];
                if (typeof window !== "undefined") {
                    window.__link_mode = true;
                }
                updateLinkButtonHighlight();
                setDebug("Link mode: ON (" + state.activeLinkType + ")");
                return;
            }

            if (state.connectChain.length >= 2) {
                createBodyFromChain(state.activeLinkType);
            } else if (state.connectChain.length > 0) {
                state.connectChain = [];
                rebuildBarsFromBodies();
                invalidate("Discarding partial link chain (link tool cleared)");
            }
            state.connectMode = false;
            state.activeLinkType = null;
            state.connectChain = [];
            if (typeof window !== "undefined") {
                window.__link_mode = false;
            }
            updateLinkButtonHighlight();
            setDebug("Link mode: OFF");
        },

        setConnectMode(on) {
            const newMode = !!on;

            if (!newMode) {
                if (state.connectChain.length >= 2) {
                    createBodyFromChain(state.activeLinkType);
                } else if (state.connectChain.length > 0) {
                    state.connectChain = [];
                    rebuildBarsFromBodies();
                    invalidate("Discarding partial link chain (setConnectMode OFF)");
                }
                state.connectMode = false;
                state.connectChain = [];
                if (typeof window !== "undefined") window.__link_mode = false;
                updateLinkButtonHighlight();
                setDebug("Link mode: OFF");
                return;
            }

            if (!state.activeLinkType) {
                state.activeLinkType = "bar";
            }
            state.connectMode = true;
            state.connectChain = [];
            if (typeof window !== "undefined") window.__link_mode = true;
            updateLinkButtonHighlight();
            setDebug("Link mode: ON (" + state.activeLinkType + ")");
        },

        getPoints() {
            return state.points.map((p) => ({
                id: p.id,
                type: p.type,
                name: p.name ?? null,
                x: p.x,
                y: p.y,
            }));
        },

        setPoints(newPoints) {
            const pts = state.points;
            pts.length = 0;

            let maxIdNum = 0;

            (newPoints || []).forEach((p) => {
                const idStr = String(p.id ?? "");

                pts.push({
                    id: idStr,
                    type: p.type,
                    name: p.name ?? null,
                    x: Number(p.x),
                    y: Number(p.y),
                });

                const m = idStr.match(/pt_(\d+)/);
                if (m) {
                    const n = parseInt(m[1], 10);
                    if (!Number.isNaN(n)) maxIdNum = Math.max(maxIdNum, n);
                }
            });

            invalidate(`Loaded ${pts.length} point(s) from backend`);
        },

        getBars() {
            return state.bars.map((b) => ({ id: b.id, a: b.a, b: b.b }));
        },
        setBars(newBars) {
            state.bars = (newBars || []).map((b, idx) => ({
                id: b.id || `bar_${idx + 1}`,
                a: b.a,
                b: b.b,
            }));
            invalidate(`Loaded ${state.bars.length} bar(s) from backend`);
        },

        getBodies() {
            return state.bodies.map((b) => ({
                id: b.id,
                name: b.name ?? null,
                point_ids: Array.isArray(b.point_ids) ? b.point_ids.slice() : [],
                closed: !!b.closed,
                type: b.type || null,
            }));
        },

        setBodies(newBodies) {
            state.bodies = (newBodies || []).map((b, idx) => ({
                id: b.id || `body_${idx + 1}`,
                name: b.name ?? null,
                point_ids: Array.isArray(b.point_ids) ? b.point_ids.slice() : [],
                closed: !!b.closed,
                type: b.type || null,
            }));
            rebuildBarsFromBodies();
            invalidate(`Loaded ${state.bodies.length} body(s)`);
        },

        async saveBodies() {
            return saveBodiesHelper();
        },

        async savePoints() {
            return savePoints();
        },

        setPerspectiveMode(mode) {
            setPerspectiveMode(mode);
        },

        resetPerspective() {
            clearPerspectiveState();
        },
    });

    setDebug("BikeViewer initialised. Tap/click to place points.");
};
