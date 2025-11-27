import reflex as rx


class PageState(rx.State):
    """Global page-level navigation + loading state."""

    # Default: not loading
    loading: bool = False
    loading_message: str = "Loading…"

    @rx.event
    def ready(self):
        """Call from page on_load when the page is fully initialised."""
        self.loading = False

    @rx.event
    def goto(self, path: str, message: str = "Loading…"):
        """Navigate to a new route and show the loader while switching."""
        self.loading = True
        self.loading_message = message
        return rx.redirect(path)