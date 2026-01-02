// events_keyboard.js
export function addKeyboardEvents(deps) {
    const {
        state,
        crosshair,
        updateTypeButtonHighlight,
        invalidate,
    } = deps;

    const KEY_NUDGE = 0.5;

    window.addEventListener("keydown", (e) => {
        const ae = document.activeElement;
        if (
            ae &&
            (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA" || ae.isContentEditable)
        ) {
            return; // ignore typing in inputs
        }

        // === ESCAPE CANCELS POINT-PLACEMENT MODE ===
        if (e.key === "Escape") {
            if (state.activeType) {
                state.activeType = null;

                // turn off crosshair
                crosshair.visible = false;
                crosshair.x = crosshair.y = null;

                updateTypeButtonHighlight();
                invalidate("Point placement cancelled (ESC)");
                return;
            }

            // Optional: also deselect point/body when ESC pressed
            if (state.selectedPointId || state.selectedBodyId) {
                state.selectedPointId = null;
                state.selectedBodyId = null;
                state.bodyDeleteHit = null;
                state.draggingPointId = null;
                invalidate("Selection cleared (ESC)");
                return;
            }

            return;
        }

        // ==== Arrow key nudging (unchanged) ====
        if (!state.selectedPointId) return;

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
        const p = state.points.find((pt) => pt.id === state.selectedPointId);
        if (!p) return;
        p.x += dx;
        p.y += dy;
        invalidate();
    });
}

const BV = (window.BikeViewer ||= {});
BV.addKeyboardEvents = addKeyboardEvents;
