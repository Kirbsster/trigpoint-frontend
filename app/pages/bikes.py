# frontend/app/pages/bikes.py
import os
import reflex as rx

from app.components.template import app_template
from app.components.page_loading import page_loading
from app.components.protected import protected_page
from app.state.auth_state import AuthState
from app.state.page_state import PageState
from app.state.bike_state import BikeState

BACKEND_ORIGIN = os.getenv("BACKEND_ORIGIN", "http://127.0.0.1:9000")


@rx.page(
    route="/bikes",
    title="My bikes",
    on_load=[
        AuthState.ensure_auth_or_redirect, 
        BikeState.load_bikes,
        PageState.ready,
        ],
)
def bikes_page() -> rx.Component:
    def bike_card(bike: dict) -> rx.Component:
        """Render a single bike card with optional hero image."""

        # --- Text details (always shown) ---
        details = rx.vstack(
            rx.heading(bike.get("name", "Untitled"), size="4"),
            rx.text(bike.get("brand", ""), size="3"),
            rx.text(
                (
                    f"Model year: {bike.get('model_year')}"
                    if bike.get("model_year") is not None
                    else ""
                ),
                size="2",
            ),
            spacing="1",
            align_items="flex-start",
            width="100%",
        )

        # --- Row when an image is present (image left, details right) ---
        row_with_image = rx.hstack(
            rx.image(
                # hero_url may come either from backend (signed URL)
                # or be constructed in BikeState.load_bikes as a /media/{id} URL.
                src=bike.get("hero_url", ""),
                width="140px",
                height="140px",
                object_fit="cover",
                border_radius="0.75rem",
            ),
            details,
            spacing="3",
            align_items="center",
            width="100%",
        )

        # --- Row when no image: just details ---
        row_without_image = details

        # Note: use Var-aware condition; truthiness of hero_url is enough.
        return rx.card(
            rx.link(
                rx.cond(
                    bike.get("hero_url") != None,
                    row_with_image,
                    row_without_image,
                ),
                on_click=BikeState.goto_bike(bike["id"]),
            ),
            width="100%",
        )

    body = rx.vstack(
        # Header row with title + add button
        rx.hstack(
            rx.heading("My bikes", size="6"),
            rx.spacer(),
            rx.button(
                "+ Add bike",
                # on_click=BikeState.goto_bike(bike["id"]),
            ),
            align_items="center",
            width="100%",
        ),
        # Body: loading → list → empty state
        rx.cond(
            BikeState.loading,
            rx.text("Loading bikes..."),
            rx.cond(
                BikeState.has_bikes,
                rx.vstack(
                    # 🔥 This will render ALL bikes in BikeState.bikes
                    rx.foreach(BikeState.bikes, bike_card),
                    spacing="3",
                    width="100%",
                ),
                rx.text("You have no bikes yet. Add one!", size="3"),
            ),
        ),
        # Any status / error message
        rx.cond(
            BikeState.message != "",
            rx.text(BikeState.message, color="red"),
        ),
        spacing="4",
        width="100%",
    )

    return app_template(page_loading(protected_page(body)))