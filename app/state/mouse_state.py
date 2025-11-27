# import reflex as rx

# class MouseState(rx.State):
#     last_mouse_x: int = 0   # latest mouseX from JS
#     last_mouse_y: int = 0   # latest mouseX from JS
#     js_calls: int = 0       # how many times callback has run

#     @rx.var
#     def debug_xy(self) -> str:
#         """Debug info to display in the sidebar."""
#         return (
#             f"x={self.last_mouse_x}, y={self.last_mouse_y}"
#             f"js_calls={self.js_calls}, "
#         )

#     def update_mouse_xy(self, xy):
#         """
#         Callback from rx.call_script.

#         Receives window.sidebarDrag.mouseX from the browser.
#         """
#         self.js_calls += 1
#         # try:
#         x, y = xy
#         self.last_mouse_x = int(x)
#         self.last_mouse_y = int(y)
#         # except Exception:
#         #     self.last_mouse_x = 0
#         #     self.last_mouse_y = 0

#     @rx.event
#     def get_mouse_xy(self):
#         """
#         Ask the browser for window.sidebarDrag.mouseX.

#         This follows the official Reflex browser-JS pattern:
#         return a list of rx.call_script(...) with callbacks.
#         """
#         return [
#             rx.call_script(
#                 "[window.sidebarDrag && window.sidebarDrag.mouseX || 0," \
#                 "window.sidebarDrag && window.sidebarDrag.mouseY || 0]",
#                 callback=MouseState.update_mouse_xy,
#             )
#         ]
# import reflex as rx


# class MouseState(rx.State):
#     """Track latest pointer position coming from browser JS."""
#     pointer_x: int = 0
#     pointer_y: int = 0
#     js_calls: int = 0

#     @rx.var
#     def debug_xy(self) -> str:
#         """Simple debug string to render in the UI."""
#         return f"x={self.pointer_x}, y={self.pointer_y}, js_calls={self.js_calls}"

#     @rx.event
#     def update_from_js(self, xy):
#         """
#         Event callback used by rx.call_script.

#         xy is expected to be [x, y] from JS.
#         Marking this as @rx.event is crucial so Reflex
#         knows to push updated state to the client.
#         """
#         self.js_calls += 1
#         try:
#             x, y = xy
#             self.pointer_x = int(x)
#             self.pointer_y = int(y)
#         except Exception:
#             self.pointer_x = 0
#             self.pointer_y = 0

#     @rx.event
#     def get_pointer_xy(self):
#         """
#         Ask JS for the current pointer position.

#         Reads from window.pointerPos.{x,y}, which is maintained by
#         a small JS helper that listens to mouse + touch events.
#         """
#         return [
#             rx.call_script(
#                 "[window.pointerPos && window.pointerPos.x || 0,"
#                 " window.pointerPos && window.pointerPos.y || 0]",
#                 callback=MouseState.update_from_js,
#             )
#         ]



import reflex as rx


class MouseState(rx.State):
    """Track latest pointer position using inline JS (mouse + touch)."""

    pointer_x: int = 0
    pointer_y: int = 0
    js_calls: int = 0  # counter to prove the callback is running

    @rx.var
    def debug_xy(self) -> str:
        """Simple debug string to render in the UI."""
        return f"x={self.pointer_x}, y={self.pointer_y}, js_calls={self.js_calls}"

    @rx.event
    def update_from_js(self, xy):
        """
        Event callback used by rx.call_script.

        `xy` is expected to be [x, y] from JS.
        """
        self.js_calls += 1
        try:
            x, y = xy
            self.pointer_x = int(x)
            self.pointer_y = int(y)
        except Exception:
            self.pointer_x = 0
            self.pointer_y = 0

    @rx.event
    def get_pointer_xy(self):
        """
        Inline JS that:
        - On first call, installs mouse + touch listeners and a shared
          window._tpPointer object.
        - Always returns [x, y] from that shared object.

        We then pass that [x, y] into update_from_js via the callback.
        """
        return [
            rx.call_script(
                """
                // Initialise pointer storage and listeners once
                if (!window._tpPointer) {
                    window._tpPointer = { x: 0, y: 0 };

                    function _tpUpdateFromEvent(e) {
                        let x = 0;
                        let y = 0;

                        if (e.touches && e.touches.length > 0) {
                            // Touch event
                            x = e.touches[0].clientX;
                            y = e.touches[0].clientY;
                        } else {
                            // Mouse / pointer event
                            x = e.clientX;
                            y = e.clientY;
                        }

                        window._tpPointer.x = x;
                        window._tpPointer.y = y;
                    }

                    window.addEventListener("mousemove", _tpUpdateFromEvent);
                    window.addEventListener("touchmove", _tpUpdateFromEvent, { passive: true });
                }

                // Always return the latest known pointer coords
                [window._tpPointer.x || 0, window._tpPointer.y || 0]
                """,
                callback=MouseState.update_from_js,
            )
        ]