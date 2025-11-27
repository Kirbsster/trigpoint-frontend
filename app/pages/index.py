import reflex as rx

from app.components.template import app_template
from app.components.page_loading import page_loading
from app.components.protected import protected_page
from app.state.auth_state import AuthState
from app.state.page_state import PageState
from app.state.bike_state import BikeState

@rx.page(
    route="/",
    title="TRIG POINT",
    on_load=AuthState.ensure_auth_or_redirect,  # 👈 guard uses cookies + /users/me
)
def index() -> rx.Component:
    body = rx.box(
        rx.heading("Featured", size="6"),
        
        bg="var(--bg)",
        height="100%",
        position="relative",
        overflow="visible",
    )
    return app_template(page_loading(protected_page(body)))
