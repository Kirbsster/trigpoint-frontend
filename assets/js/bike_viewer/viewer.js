export function initBikePointsViewer(container, config = {}) {
    const containerEl =
        typeof container === "string"
            ? document.getElementById(container)
            : container;

    if (!containerEl) {
        console.error("[BikeViewer] initBikePointsViewer: container not found");
        return;
    }

    // 🔒 Single source of truth
    const viewer = (containerEl.bikeViewer ??= {});
    viewer.config = config;

    // IMPORTANT: call this after you’ve resolved bikeId (from dataset/url)
    const bikeId = containerEl.dataset.bikeId || null;

    // Initialise expected state ON THE CONTAINER
    viewer.scale_mm_per_px ??= null;
    viewer.activeScaleMeasurementId ??= null;
    viewer.measurementValues ??= {};
    viewer.points ??= [];
    viewer.bodies ??= [];

    // Keep a local alias for readability
    const BV = window.BikeViewer;
    const { makeDefaultState, getState } = BV;

    const state = getState(viewer, bikeId);

    let __bv_needs_draw = false;
    function invalidate(msg) {
        if (msg) setDebug(msg);
        if (__bv_needs_draw) return;
        __bv_needs_draw = true;
        requestAnimationFrame(() => {
            __bv_needs_draw = false;
            drawAll();
        });
    }

    // Local aliases so the rest of the file stays unchanged
    const log = (...args) => BV.log(...args);
    const setDebug = (text) => BV.setDebug(containerEl, text);
    const cssVar = (name) => BV.cssVar(name);
    // const qs = (sel, root) => BV.qs(sel, root);
    // const qsa = (sel, root) => BV.qsa(sel, root);
    const inner = containerEl.querySelector("#bike-viewer-inner") || containerEl;
    const img = inner.querySelector("img");

    if (!img) {
        console.error("[BikeViewer] no <img> found inside containerEl");
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

    // Fallback: parse from URL /bike_analyser/<id>
    if (!bikeId && window.location && window.location.pathname) {
        const m = window.location.pathname.match(/bike_analyser\/([^/]+)/);
        if (m && m[1]) {
            bikeId = m[1];
            console.log("[BikeViewer] Fallback bikeId from URL:", bikeId);
        }
    }

    const accessToken = containerEl.dataset.accessToken || null;

    // Log once so we can see what we actually have
    console.log("[BikeViewer] bikeId from dataset/URL:", bikeId);

    // --- Geometry state ---

    const recomputeNextIdFromPoints = () => BV.recomputeNextIdFromPoints(state);

    // NEW: bodies as per backend schema
    // each body: { id, name, point_ids: [ "pt_1", "pt_2", ... ], closed: bool }
    // state.bars: [{ id, a, b }]
    const rebuildBarsFromBodies = () => BV.rebuildBarsFromBodies(state);


    // ---- Measurement system (v1: rear_center only) ----
    const meas = {
        show: true,
        activeScaleKey: null,     // "rear_center" later "wheelbase" etc.
    };

    const getPtsByType = () => BV.getPtsByType(state.points);


    // let rearMeasureAnim = {
    //     running: false,
    //     startTime: 0,
    //     fromX: 0,
    //     toX: 0,
    //     duration: 220,   // ms
    // };


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

    // function imageDxDyToMm(dxImg, dyImg) {
    //     const s = viewer?.scale_mm_per_px;
    //     if (!s) return null;
    //     const dPx = Math.hypot(dxImg, dyImg);
    //     return dPx * s;  // mm
    // }

    // Crosshair state: stored in canvas CSS coords
    let crosshair = {
        x: null,
        y: null,
        visible: false,
    };
    // Image intrinsic size
    let imgW = 0;
    let imgH = 0;

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
    containerEl.appendChild(debug);

    function updateTypeButtonHighlight() {
        BV.updateTypeButtonHighlight(state.activeType);
    }

    function updateLinkButtonHighlight() {
        BV.updateLinkButtonHighlight(state.connectMode, state.activeLinkType);
    }

    // === Geometry helpers ===
    const view = {
        scale: 1,
        tx: 0,
        ty: 0,
        minScale: 1, // fit-to-canvas zoom
        baseTx: 0,   // centred translation at minScale
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
            invalidate();
        }
    }

    // After you’ve defined `bars` and `points` somewhere above invalidate
    const findShockBody = () => BV.findShockBody(state.bodies);
    const findShockBar = () => BV.findShockBar(state.bodies, state.bars);

    const actions = BV.createActions({
        state,
        clientToImage,
        invalidate,
        setDebug,
        saveNowIfPossible,
    });
    const { drawDotAtClient, nudgeSelectedPoint } = actions;

    // === Nudge controls around selected point (donut with arrows) ===
    const NUDGE_INNER_RADIUS = 32; // px on screen
    const NUDGE_OUTER_RADIUS = 70; // px on screen
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

        // don’t call invalidate here if you’re going to do it at end of loadInitialPoints
    }


    const updateShockStrokePill = (pointById) => BV.updateShockStrokePill({
        pointById,
        findShockBar,
        shockStrokeInput,
        view,
        state,
        viewer,
        setDebug,
    });

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

    function saveNowIfPossible() {
        // autosave to backend (fire-and-forget)
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

    const recomputeNextBodyIdFromBodies = () => BV.recomputeNextBodyIdFromBodies(state);

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
            // Use the same logic as everywhere else:
            createBodyFromChain(state.activeLinkType);
        }
    }

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

    // === Pointer handlers ===
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
    const { loadInitialPoints, loadBodies, saveBodiesHelper, savePoints } = backendIO;

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
        zoomAtScreenPoint,
        clampPan,
        animatePanToCenter,
        NUDGE_INNER_RADIUS,
        NUDGE_OUTER_RADIUS,
        viewer,
    });

    BV.addKeyboardEvents({
        state,
        crosshair,
        updateTypeButtonHighlight,
        invalidate,
    });

    // === Image load & bootstrapping ===
    function onImageReady() {
        imgW = img.naturalWidth;
        imgH = img.naturalHeight;

        // We only need the image as a source for drawImage; hide the DOM copy
        img.style.display = "none";

        // setDebug(`Image ready. natural=${imgW}×${imgH}`);

        resizeCanvas();
        invalidate(`Image ready. natural=${imgW}×${imgH}`);

        // Load points from backend once image/view are ready{
        loadInitialPoints();
        loadBodies();
    }

    if (img.complete && img.naturalWidth > 0) {
        onImageReady();
    } else {
        img.addEventListener("load", onImageReady, { once: true });
    }

    window.addEventListener("resize", resizeCanvas);

    // === Public API for Reflex hooks ===
    // viewer = {
    Object.assign(viewer, {
        ping() {
            setDebug("bikeViewer.ping() called from console");
        },
        setType(type, options) {
            const newType = type ? String(type) : null;
            const opts = options || {};

            // --- If we were in link mode, finalise/discard chain and turn it off ---
            if (state.connectMode) {
                if (state.connectChain.length >= 2) {
                    // OLD inline body creation here
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

            // --- Toggle behaviour: click same type again => cancel placement ---
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

            // --- Switch to a new point type ---
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

        // --- NEW: link-type tool (rigid / shock) ---
        setLinkType(type, options) {
            const newType = type ? String(type) : null;
            const opts = options || {};

            // If we were in point-placement mode, turn that off
            if (state.activeType) {
                state.activeType = null;
                if (typeof crosshair !== "undefined") {
                    crosshair.visible = false;
                    crosshair.x = null;
                    crosshair.y = null;
                }
                updateTypeButtonHighlight();
            }

            // If we’re already in link mode…
            if (state.connectMode) {
                // Clicking the same link type again => toggle OFF (commit/discard chain)
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

                // Switching from one link type to another while link mode is ON
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

            // Not in link mode yet, and user clicked a link tool
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

            // newType is null => explicit OFF
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

        // Optionally keep a simple toggle for legacy use:
        setConnectMode(on) {
            const newMode = !!on;

            if (!newMode) {
                // turning OFF
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

            // turning ON (if no activeLinkType, default to "bar")
            if (!state.activeLinkType) {
                state.activeLinkType = "bar";
            }
            state.connectMode = true;
            state.connectChain = [];
            if (typeof window !== "undefined") window.__link_mode = true;
            updateLinkButtonHighlight();
            setDebug("Link mode: ON (" + state.activeLinkType + ")");
        },

        // ---- backend sync helpers ----
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
            const pts = state.points;     // or viewer.state.points
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

        // NEW: bars
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
                type: b.type || null,   // <-- NEW
            }));
        },

        setBodies(newBodies) {
            state.bodies = (newBodies || []).map((b, idx) => ({
                id: b.id || `body_${idx + 1}`,
                name: b.name ?? null,
                point_ids: Array.isArray(b.point_ids) ? b.point_ids.slice() : [],
                closed: !!b.closed,
                type: b.type || null,   // <-- NEW
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
    });

    setDebug("BikeViewer initialised. Tap/click to place points.");
};
