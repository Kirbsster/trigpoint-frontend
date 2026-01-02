// ui_shock.js
export function createShockStrokeInput(deps) {
    const {
        BV,
        containerEl,
        cssVar,
        bikeId,
        accessToken,
        state,
        invalidate,
        setDebug,
    } = deps;

    const shockStrokeInput = document.createElement("input");
    shockStrokeInput.type = "text";
    shockStrokeInput.id = "shock-stroke-input";
    shockStrokeInput.placeholder = "Stroke [mm]";

    Object.assign(shockStrokeInput.style, {
        position: "absolute",
        zIndex: 50,
        display: "none",
        padding: "3px 8px",
        minWidth: "80px",
        textAlign: "center",
        whiteSpace: "nowrap",
        background: cssVar("--text-dark"),
        border: "0px",
        color: cssVar("--text-light"),
        fontSize: "12px",
        lineHeight: "1.2",
        borderRadius: "999px",
        pointerEvents: "auto",
    });

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
            shockStrokeInput.blur();
        }
    });

    let lastValidShockStroke = "";
    const STROKE_NUMERIC_REGEX = /^\d*\.?\d*$/;

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
        e.target.value = lastValidShockStroke;
    });

    shockStrokeInput.addEventListener("focus", (e) => {
        const raw = String(e.target.value || "").replace(/mm/i, "").trim();
        e.target.value = raw;
    });

    shockStrokeInput.addEventListener("blur", async (e) => {
        let raw = String(e.target.value || "").replace(/mm/i, "").trim();

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

        const norm = String(val);
        lastValidShockStroke = norm;
        e.target.value = norm + " mm";

        const shockBody = (state.bodies || []).find((b) => b.type === "shock");
        if (shockBody) shockBody.stroke = val;

        invalidate();

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
                    stroke: b.type === "shock"
                        ? (b.stroke ?? null)
                        : (typeof b.stroke === "number" ? b.stroke : null),
                })),
            };

            const res = await BV.putBodies({
                containerEl,
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

            setDebug("Shock stroke saved OK");
        } catch (err) {
            console.error("[BikeViewer] stroke PUT error:", err);
            setDebug("Error saving stroke (see console)");
        }
    });

    function setLastValidShockStroke(value) {
        lastValidShockStroke = value == null ? "" : String(value);
    }

    function getLastValidShockStroke() {
        return lastValidShockStroke;
    }

    return {
        shockStrokeInput,
        setLastValidShockStroke,
        getLastValidShockStroke,
    };
}

export function updateShockStrokePill(deps) {
    const {
        pointById,
        findShockBar,
        shockStrokeInput,
        view,
        state,
        viewer,
        setDebug,
    } = deps;

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

    const imageToCss = (xImg, yImg) => ({
        x: view.tx + view.scale * xImg,
        y: view.ty + view.scale * yImg,
    });

    let ax = (p1.x + p2.x) / 2;
    let ay = (p1.y + p2.y) / 2;

    const shockBody = (state.bodies || []).find((b) => b.type === "shock");
    const strokeMm =
        shockBody && typeof shockBody.stroke === "number" && shockBody.stroke > 0
            ? shockBody.stroke
            : null;

    if (strokeMm) {
        const scaleMmPerPx = viewer?.scale_mm_per_px;
        if (scaleMmPerPx && scaleMmPerPx > 0) {
            const strokeImgDist = strokeMm / scaleMmPerPx;

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
            setDebug("Warning: Set Rear Centre first - cannot display stroke without scale.");
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

const BV = (window.BikeViewer ||= {});
BV.createShockStrokeInput = createShockStrokeInput;
BV.updateShockStrokePill = updateShockStrokePill;
