// /js/bike_viewer/index.js
import "./core.js";
import "./dom.js";
import "./theme.js";
import "./ui_buttons.js";
import "./api.js";
import "./draw.js";
import "./hit_test.js";
import "./events_pointer.js";
import "./events_keyboard.js";
import "./view.js";
import "./actions.js";
import "./io_backend.js";
import "./state.js";
import "./measurements.js";
import { initBikePointsViewer } from "./viewer.js";

(() => {
    const CONTAINER_ID = "bike-viewer-container";
    const IMG_ID = "bike-image";

    const getEl = () => document.getElementById(CONTAINER_ID);
    const getImg = () => document.getElementById(IMG_ID);

    const getBikeId = (el) =>
        (el && el.dataset && el.dataset.bikeId) ? String(el.dataset.bikeId) : "";

    function hydrateBackendOrigin(el) {
        // data_backend_origin -> data-backend-origin -> el.dataset.backendOrigin
        if (!window.BACKEND_ORIGIN && el?.dataset?.backendOrigin) {
            window.BACKEND_ORIGIN = el.dataset.backendOrigin;
        }
    }

    function waitForImage(img) {
        return new Promise((resolve) => {
            if (!img) return resolve(false);
            if (img.complete && img.naturalWidth > 0) return resolve(true);
            img.addEventListener("load", () => resolve(true), { once: true });
            img.addEventListener("error", () => resolve(false), { once: true });
        });
    }

    async function tryMount() {
        const el = getEl();
        if (!el) return false;

        const bikeId = getBikeId(el);
        if (!bikeId) return false;

        // ✅ already mounted for this bike
        if (el.dataset.bvMountedFor === bikeId) return true;

        // ✅ in-flight lock: stops double init while we're awaiting image
        if (el.dataset.bvMountingFor === bikeId) return false;
        el.dataset.bvMountingFor = bikeId;

        try {
            hydrateBackendOrigin(el);

            const img = getImg();
            await waitForImage(img);

            if (getBikeId(el) !== bikeId) return false;

            el.dataset.bvMountedFor = bikeId;
            console.log("[BikeViewer] mounting viewer for bike:", bikeId);
            initBikePointsViewer(el, {});
            return true;
        } finally {
            // always clear mounting lock
            if (el.dataset.bvMountingFor === bikeId) delete el.dataset.bvMountingFor;
        }
    }

    function boot() {
        tryMount().then((ok) => {
            if (!ok) requestAnimationFrame(boot);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
        boot();
    }

    // Keep observer alive for SPA navigation (do NOT disconnect)
    const obs = new MutationObserver(() => {
        tryMount();
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
})();
