# app/components/page_loading.py
import reflex as rx
from app.components.loading import loading_screen
from app.state.page_state import PageState


def page_loading(content: rx.Component) -> rx.Component:
    """
    Wrap content in a generic page-level loader using PageState.loading.
    """
    return rx.cond(
        PageState.loading,
        loading_screen(PageState.loading_message),
        content,
    )