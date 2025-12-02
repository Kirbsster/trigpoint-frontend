// public/js/mouse_tracker.js

(function () {
    console.log("[mouse_tracker] script loaded");

    // Simple global pointer state (image-local coords)
    let pointer = {
        x: 0,
        y: 0,
        ts: 0,
        active: 0, // 1 = over/dragging; 0 = idle
    };

    function updateFromPointerEvent(evt) {
        const img = evt.currentTarget;
        const rect = img.getBoundingClientRect();

        pointer.x = evt.clientX - rect.left;
        pointer.y = evt.clientY - rect.top;
        pointer.ts = Date.now();
        pointer.active = 1;

        console.log("[mouse_tracker] move", pointer.x, pointer.y);
    }

    function updateFromTouchEvent(evt) {
        const img = evt.currentTarget;
        const t = evt.touches[0];
        if (!t) return;

        const rect = img.getBoundingClientRect();

        pointer.x = t.clientX - rect.left;
        pointer.y = t.clientY - rect.top;
        pointer.ts = Date.now();
        pointer.active = 1;

        console.log("[mouse_tracker] touch", pointer.x, pointer.y);
    }

    function handleLeave() {
        pointer.active = 0;
        console.log("[mouse_tracker] leave");
    }

    function attachBikeImageTracker() {
        const img = document.getElementById("bike-analyser-image");
        if (!img) {
            console.log("[mouse_tracker] no #bike-analyser-image yet");
            return;
        }
        console.log("[mouse_tracker] attaching listeners to #bike-analyser-image");

        img.addEventListener("mousemove", updateFromPointerEvent);
        img.addEventListener("mouseleave", handleLeave);

        img.addEventListener(
            "touchmove",
            function (evt) {
                evt.preventDefault();
                updateFromTouchEvent(evt);
            },
            { passive: false },
        );
        img.addEventListener("touchend", handleLeave);
    }

    // Try once on DOM ready, and again on full load (SSR / client nav safety)
    document.addEventListener("DOMContentLoaded", attachBikeImageTracker);
    window.addEventListener("load", attachBikeImageTracker);

    // Export a getter for Reflex to poll later
    window.getTrigpointPointer = function () {
        // [x, y, timestamp, active]
        return [pointer.x, pointer.y, pointer.ts, pointer.active];
    };
})();