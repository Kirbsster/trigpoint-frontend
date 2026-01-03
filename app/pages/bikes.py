# frontend/app/pages/bikes.py
import os
import reflex as rx

from app.components.template import app_template
from app.components.page_loading import page_loading
from app.components.protected import protected_page
from app.state.auth_state import AuthState
from app.state.page_state import PageState
from app.state.bike_state import BikeState

from app.components.new_bike_modal import new_bike_modal

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

        hero_src = rx.cond(
            bike.get("hero_thumb_url"),
            bike.get("hero_thumb_url"),
            bike.get("hero_url", ""),
        )

        row_with_image = rx.hstack(
            rx.image(
                src=hero_src,
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

        content = rx.cond(
            hero_src,
            row_with_image,
            details,
        )

        return rx.card(
            rx.hstack(
                # Clickable area -> go to analyser
                rx.box(
                    content,
                    on_click=BikeState.goto_bike(bike["id"]),
                    width="100%",
                    cursor="pointer",
                ),

                # Delete icon (not inside clickable box)
                rx.icon_button(
                    "trash-2",
                    variant="ghost",
                    on_click=BikeState.delete_bike(bike["id"]),
                ),

                align_items="start",
                width="100%",
                spacing="2",
            ),
            width="100%",
        )

    body = rx.vstack(
        # Header row with title + add button
        # rx.hstack(
        #     rx.heading("My bikes", size="6"),
        #     rx.spacer(),
        #     rx.button(
        #         "+ Add bike",
        #         on_click=rx.redirect("/bikes/new"),
        #     ),
        #     align_items="center",
        #     width="100%",
        # ),

        # inside bikes_page() header row:
        rx.hstack(
            rx.heading("My bikes", size="6"),
            rx.spacer(),
            new_bike_modal(),
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
