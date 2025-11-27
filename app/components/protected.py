# app/components/protected.py
import reflex as rx
from app.state.auth_state import AuthState


def protected_page(content: rx.Component) -> rx.Component:
    """Show content only if we have an access token, else blank while redirecting."""
    return rx.cond(
        AuthState.access_token,
        content,
        rx.box(),
    )