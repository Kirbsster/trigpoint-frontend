import reflex as rx

from app.components.template import app_template
from app.components.page_loading import page_loading
from app.components.protected import protected_page
from app.state.auth_state import AuthState
from app.state.page_state import PageState
from app.state.bike_state import BikeState
from app.state.mouse_state import MouseState

@rx.page(
    route="/bike_analyser/[bike_id]",
    title="Bike Analyser",
    on_load=[
        AuthState.ensure_auth_or_redirect, 
        BikeState.load_one_bike,
        PageState.ready
        ],
)
def bike_analyser() -> rx.Component:
    body = rx.box(
        # JS debug controls
        rx.text(
            MouseState.debug_xy,
            font_size="0.7rem",
            color="var(--text)",
            margin_top="0.5rem",
            margin_bottom="1rem",
        ),
        rx.cond(
            BikeState.current_bike != {},
            rx.image(
                src=BikeState.current_bike.get("hero_url", ""),
                width="100%",
                height="100%",
                object_fit="contain",
                on_mouse_move=MouseState.get_pointer_xy.throttle(16),
            ),
            rx.text("Bike not found", size="4"),
        ),
        bg="var(--bg)",
        width="100%",
        height="100%",
        position="relative",
        overflow="visible",
    )

    return app_template(page_loading(protected_page(body)))
