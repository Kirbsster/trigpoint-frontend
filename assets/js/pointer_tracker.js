// public/js/pointer_tracker.js

// Global object used by Reflex to read pointer position.
window.pointerPos = {
    x: 0,
    y: 0,
};

function updateFromEvent(e) {
    let x = 0;
    let y = 0;

    if (e.touches && e.touches.length > 0) {
        // Touch event (mobile / tablet)
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
    } else {
        // Mouse / pointer event (desktop)
        x = e.clientX;
        y = e.clientY;
    }

    window.pointerPos.x = x;
    window.pointerPos.y = y;
}

// Desktop: mouse move (includes drag when button is down)
window.addEventListener("mousemove", updateFromEvent);

// Mobile: finger move / drag
window.addEventListener("touchmove", updateFromEvent, { passive: true });