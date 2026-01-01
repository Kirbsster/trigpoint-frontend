import reflex as rx


class SidebarState(rx.State):
    """
    Simple open/closed sidebar with a circular toggle button.

    Also includes a JS mouse bridge so we can keep interacting
    with window.sidebarDrag.mouseX via call_script.
    """

    # ---------------------------
    # OPEN / CLOSED STATE
    # ---------------------------

    open: bool = False  # True = open, False = closed

    @rx.var
    def sidebar_width(self) -> str:
        """Width (CSS) derived from open/closed."""
        if self.open:
            return "100px"   # tweak to taste
        else:
            return "0px"  # thin strip so toggle stays visible

    @rx.var
    def arrow_rotation(self) -> str:
        """Rotate chevron based on open/closed."""
        # when open, arrow points right (into sidebar)
        # when closed, arrow points left (into content)
        return "rotate(0deg)" if self.open else "rotate(180deg)"

    def toggle(self):
        """Click to open/close the sidebar."""
        self.open = not self.open

