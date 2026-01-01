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

    function rebuildBarsFromBodies() {
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


    // ---- Measurement system (v1: rear_center only) ----
    const meas = {
        show: true,
        activeScaleKey: null,     // "rear_center" later "wheelbase" etc.
    };

    function getPtsByType() {
        const out = {};
        for (const p of state.points) {
            out[p.type] = p;

            // Optional aliases (VERY helpful long-term)
            if (p.type === "bottom_bracket") out.bb = p;
            if (p.type === "rear_axle") out.rear_axle = p;
            if (p.type === "front_axle") out.front_axle = p;
        }
        return out;
    }


    // let rearMeasureAnim = {
    //     running: false,
    //     startTime: 0,
    //     fromX: 0,
    //     toX: 0,
    //     duration: 220,   // ms
    // };


    const MEASURE_DEFS = {
        rear_center: {
            id: "rear_center",
            label: "Rear Center",
            units: "mm",
            type: "input",
            scaleCandidate: true,
            anchors: { aType: "bb", bType: "rear_axle" },
            place: {
                orientation: "horizontal",
                normalOffsetPx: -50,
                pillOffsetPx: 25,
            },
            style: { headW: 10, headH: 14, shaftThickness: 3, minSpanPx: 20 },
            ticks: {
                enabled: true,

                // which end(s) get ticks
                ends: "both",            // "both" | "a" | "b" | "none"

                // tick direction relative to the measurement line (root-space +Y is “normal”)
                side: "both",            // "both" | "pos" | "neg"
                lengthPosPx: 25,          // length toward +normal
                lengthNegPx: 50,          // length toward -normal

                thicknessPx: 3,
                offsetPx: 0,             // shifts the tick center along normal (rarely needed)
            },
        },

        front_center: {
            id: "front_center",
            label: "Front Center",
            units: "mm",
            type: "input",
            scaleCandidate: true,
            anchors: { aType: "bb", bType: "front_axle" },
            place: {
                orientation: "horizontal",
                normalOffsetPx: 50,
                pillOffsetPx: -25,
            },
            style: { headW: 10, headH: 14, shaftThickness: 3, minSpanPx: 20 },
            ticks: {
                enabled: true,

                // which end(s) get ticks
                ends: "both",            // "both" | "a" | "b" | "none"

                // tick direction relative to the measurement line (root-space +Y is “normal”)
                side: "both",            // "both" | "pos" | "neg"
                lengthPosPx: 50,          // length toward +normal
                lengthNegPx: 25,          // length toward -normal

                thicknessPx: 3,
                offsetPx: 0,             // shifts the tick center along normal (rarely needed)
            },
        },

        wheelbase: {
            id: "wheelbase",
            label: "Wheelbase",
            units: "mm",
            type: "input",
            scaleCandidate: true,
            anchors: { aType: "rear_axle", bType: "front_axle" },
            place: {
                orientation: "horizontal",   // wheelbase is usually horizontal span
                normalOffsetPx: 125,         // push it further away so it doesn’t clash with RC
                pillOffsetPx: -25,
            },
            style: { headW: 10, headH: 14, shaftThickness: 3, minSpanPx: 40 },
            ticks: {
                enabled: true,

                // which end(s) get ticks
                ends: "both",            // "both" | "a" | "b" | "none"

                // tick direction relative to the measurement line (root-space +Y is “normal”)
                side: "both",            // "both" | "pos" | "neg"
                lengthPosPx: 100,          // length toward +normal
                lengthNegPx: 100,          // length toward -normal

                thicknessPx: 3,
                offsetPx: 50,             // shifts the tick center along normal (rarely needed)
            },
        },
    };

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
        MEASURE_DEFS,
    });
    const {
        measurementDom,
        measurementValues,
        getActiveScaleMeasurementId,
        setActiveScaleMeasurementId,
        recomputeMeasurementsFromScale,
        updateMeasurementsOverlay,
    } = measurements;

    // === Shock stroke input box (HTML overlay) ===
    const shockStrokeInput = document.createElement("input");
    shockStrokeInput.type = "text";  // ⬅️ text = no number arrows
    shockStrokeInput.id = "shock-stroke-input";
    shockStrokeInput.placeholder = "Stroke [mm]";

    // --- Styling for a short pill box ---
    Object.assign(shockStrokeInput.style, {
        position: "absolute",
        zIndex: 50,
        display: "none",
        // Layout
        padding: "3px 8px",
        minWidth: "80px",           // ⬅️ narrower
        textAlign: "center",
        whiteSpace: "nowrap",
        // Visuals
        background: cssVar("--text-dark"),
        border: "0px",
        color: cssVar("--text-light"),
        fontSize: "12px",
        lineHeight: "1.2",
        borderRadius: "999px",
        // simple pill, no arrow clipPath
        // clipPath removed
        // transition: "left 0.18s ease, top 0.18s ease",
        pointerEvents: "auto",
    });
    // Optional nicer focus ring
    shockStrokeInput.addEventListener("focus", () => {
        shockStrokeInput.style.boxShadow =
            "0 0 0 1px var(--accent), 0 0 10px rgba(0, 229, 255, 0.6)";
    });
    shockStrokeInput.addEventListener("blur", () => {
        shockStrokeInput.style.boxShadow = "none";
    });
    containerEl.appendChild(shockStrokeInput);
    shockStrokeInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            shockStrokeInput.blur();   // 🔥 triggers the save
        }
    });

    // -------------------------------
    // Numeric-only + " mm" suffix UX
    // -------------------------------
    let lastValidShockStroke = "";                 // keep ONE variable name
    const STROKE_NUMERIC_REGEX = /^\d*\.?\d*$/;

    // Typing (numbers only)
    shockStrokeInput.addEventListener("input", (e) => {
        let raw = String(e.target.value || "").replace(/mm/i, "").trim();

        if (raw === "") {
            lastValidShockStroke = "";
            return;
        }
        if (STROKE_NUMERIC_REGEX.test(raw)) {
            lastValidShockStroke = raw;
            return;
        }
        // revert
        e.target.value = lastValidShockStroke;
    });

    // Strip units on focus
    shockStrokeInput.addEventListener("focus", (e) => {
        const raw = String(e.target.value || "").replace(/mm/i, "").trim();
        e.target.value = raw;
    });

    // Commit on blur
    shockStrokeInput.addEventListener("blur", async (e) => {
        let raw = String(e.target.value || "").replace(/mm/i, "").trim();

        // empty clears
        if (raw === "") {
            lastValidShockStroke = "";
            e.target.value = "";

            const shockBody = (state.bodies || []).find((b) => b.type === "shock");
            if (shockBody) shockBody.stroke = null;

            invalidate();
            return;
        }

        const val = Number.parseFloat(raw);
        if (!Number.isFinite(val) || val <= 0) {
            lastValidShockStroke = "";
            e.target.value = "";
            setDebug("Shock stroke invalid; cleared");

            const shockBody = (state.bodies || []).find((b) => b.type === "shock");
            if (shockBody) shockBody.stroke = null;

            invalidate();
            return;
        }

        // normalize + suffix
        const norm = String(val);
        lastValidShockStroke = norm;
        e.target.value = norm + " mm";

        // 1) update local model immediately
        const shockBody = (state.bodies || []).find((b) => b.type === "shock");
        if (shockBody) shockBody.stroke = val;

        invalidate(); // instant visual update

        // 2) save to backend (via BV wrapper)
        try {
            if (!bikeId) {
                console.warn("[BikeViewer] No bikeId; skipping stroke save");
                return;
            }

            const payload = {
                bodies: (state.bodies || []).map((b) => ({
                    id: b.id,
                    name: b.name ?? null,
                    point_ids: Array.isArray(b.point_ids) ? b.point_ids : [],
                    closed: !!b.closed,
                    type: b.type || null,
                    length0: typeof b.length0 === "number" ? b.length0 : null,
                    stroke: b.type === "shock" ? (b.stroke ?? null) : (typeof b.stroke === "number" ? b.stroke : null),
                })),
            };

            const res = await BV.putBodies({
                containerEl,     // IMPORTANT: use containerEl consistently everywhere
                bikeId,
                accessToken,
                payload,
            });

            const text = await res.text();
            if (!res.ok) {
                console.warn("[BikeViewer] stroke PUT failed:", res.status, text);
                setDebug(`Failed to save stroke (${res.status})`);
                return;
            }

            setDebug("Shock stroke saved ✔");
        } catch (err) {
            console.error("[BikeViewer] stroke PUT error:", err);
            setDebug("Error saving stroke (see console)");
        }
    });

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
    function findShockBody() {
        if (!Array.isArray(state.bodies)) return null;
        return state.bodies.find((body) => body.type === "shock") || null;
    }

    function findShockBar() {
        const shockBody = findShockBody();
        if (!shockBody || !Array.isArray(state.bars)) return null;
        return state.bars.find((bar) => bar.bodyId === shockBody.id) || null;
    }

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


    function updateShockStrokePill(pointById) {
        const shockBar = findShockBar();
        if (!shockBar) {
            shockStrokeInput.style.display = "none";
            return;
        }

        const p1 = pointById.get(shockBar.a);
        const p2 = pointById.get(shockBar.b);
        if (!p1 || !p2) {
            shockStrokeInput.style.display = "none";
            return;
        }

        // helper: image -> CSS
        const imageToCss = (xImg, yImg) => ({
            x: view.tx + view.scale * xImg,
            y: view.ty + view.scale * yImg,
        });

        // Default anchor = midpoint
        let ax = (p1.x + p2.x) / 2;
        let ay = (p1.y + p2.y) / 2;

        // If stroke known + scale known, anchor at stroke marker instead
        const shockBody = (state.bodies || []).find((b) => b.type === "shock");
        const strokeMm =
            shockBody && typeof shockBody.stroke === "number" && shockBody.stroke > 0
                ? shockBody.stroke
                : null;

        if (strokeMm) {
            const scaleMmPerPx = viewer?.scale_mm_per_px;
            if (scaleMmPerPx && scaleMmPerPx > 0) {
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
                ax = freePt.x + ufx * strokeClamped;
                ay = freePt.y + ufy * strokeClamped;
            } else {
                setDebug("⚠ Set Rear Centre first — cannot display stroke without scale.");
            }
        }

        const { x: axCss, y: ayCss } = imageToCss(ax, ay);

        const pillWidthCss = 90;
        const pillHeightCss = 24;
        const offsetRightCss = 12;

        shockStrokeInput.style.display = "block";
        shockStrokeInput.style.left = `${axCss + offsetRightCss}px`;
        shockStrokeInput.style.top = `${ayCss - pillHeightCss / 2}px`;
        shockStrokeInput.style.width = `${pillWidthCss}px`;
        shockStrokeInput.style.height = `${pillHeightCss}px`;
    }

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
                MEASURE_DEFS,
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
        if (!state.connectChain.length) {
            setDebug("Connect chain empty, nothing to save");
            return;
        }
        if (state.connectChain.length < 2) {
            state.connectChain = [];
            rebuildBarsFromBodies();
            invalidate("rebuilt bars after finalising connect chain and save");
            return;
        }

        // Use the same logic as everywhere else:
        createBodyFromChain(state.activeLinkType);
    }

    function createBodyFromChain(linkType) {
        if (!state.connectChain.length) return;

        if (state.connectChain.length < 2) {
            state.connectChain = [];
            rebuildBarsFromBodies();
            invalidate("Bars not rebuilt with no second point");
            return;
        }

        const body = {
            id: `body_${state.nextBodyId++}`,
            name: null,
            point_ids: state.connectChain.slice(),
            closed: false,           // open linkage by default
            type: (linkType === "shock" ? "shock" : "bar"),
        };
        if (state.bodies.some(b => b.id === body.id)) {
            // extremely rare now, but prevents bad writes
            body.id = `body_${state.nextBodyId++}`;
        }
        state.bodies.push(body);

        state.connectChain = [];
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
        setLastValidShockStroke: (value) => {
            lastValidShockStroke = value;
        },
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
