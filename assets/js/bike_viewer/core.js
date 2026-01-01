// /js/bike_viewer/core.js (ES module)
// Side-effect module: ensures window.BikeViewer exists and attaches helpers.

function ensureBV() {
    const w = window;
    w.BikeViewer = w.BikeViewer || {};
    return w.BikeViewer;
}

const BV = ensureBV();

BV.log = function (...args) {
    console.log("[BikeViewer]", ...args);
};

// Creates/updates a small HUD inside the container
BV.setDebug = function (container, text) {
    // Accept: DOM element, element id string, or nothing
    let elContainer = null;

    if (typeof container === "string") {
        elContainer = document.getElementById(container);
    } else if (container instanceof HTMLElement) {
        elContainer = container;
    } else if (container && container.nodeType === 1) {
        elContainer = container;
    } else {
        elContainer = document.getElementById("bike-viewer-container");
    }

    if (!elContainer || typeof elContainer.appendChild !== "function") {
        console.warn("[BikeViewer] setDebug: invalid container", container);
        return;
    }

    let hud = elContainer.__bv_debug_el;
    if (!hud) {
        hud = document.createElement("div");
        Object.assign(hud.style, {
            position: "absolute",
            left: "8px",
            bottom: "8px",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "11px",
            background: "rgba(0,0,0,0.6)",
            color: "#0ff",
            pointerEvents: "none",
            zIndex: "999",
        });

        elContainer.appendChild(hud);
        elContainer.__bv_debug_el = hud;
    }

    hud.textContent = String(text);
    BV.log(text);
};

console.log("[BikeViewer] core.js loaded (module)");

export { }; // keeps it explicitly a module even if you remove imports/exports later