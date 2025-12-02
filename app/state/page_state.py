# app/state/page_state.py
import reflex as rx

class PageState(rx.State):
    """Global page-level navigation + loading state."""

    loading: bool = False
    loading_message: str = "Loading..."

    @rx.event
    def ready(self):
        """Call when the page has finished loading its data and is ready to show."""
        self.loading = False

    @rx.event
    def goto(self, path: str, message: str = "Loading..."):
        """Navigate to a new route and show the loader while switching."""
        self.loading = True
        self.loading_message = message
        return rx.redirect(path)