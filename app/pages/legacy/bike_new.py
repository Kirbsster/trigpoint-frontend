# app/pages/bike_new.py
import reflex as rx

from app.components.template import app_template
from app.components.page_loading import page_loading
from app.components.protected import protected_page

from app.state.auth_state import AuthState
from app.state.page_state import PageState
from app.state.bike_state import BikeState


@rx.page(
    route="/bikes/new",
    title="Add bike",
    on_load=[
        AuthState.ensure_auth_or_redirect,
        PageState.ready,
    ],
)
def bike_new_page() -> rx.Component:
    upload_id = "bike-hero-upload"

    body = rx.center(
        rx.card(
            rx.vstack(
                rx.heading("Add a bike", size="6"),
                rx.text("Enter basic details for this bike.", size="3"),

                # --- Name ---
                rx.vstack(
                    rx.text("Name", size="3"),
                    rx.input(
                        placeholder="e.g. Whyte T-130",
                        value=BikeState.name,
                        on_change=BikeState.set_name,
                    ),
                    spacing="1",
                    width="100%",
                ),

                # --- Brand ---
                rx.vstack(
                    rx.text("Brand", size="3"),
                    rx.input(
                        placeholder="e.g. Whyte",
                        value=BikeState.brand,
                        on_change=BikeState.set_brand,
                    ),
                    spacing="1",
                    width="100%",
                ),

                # --- Model year ---
                rx.vstack(
                    rx.text("Model year", size="3"),
                    rx.input(
                        placeholder="e.g. 2019",
                        value=BikeState.model_year,
                        on_change=BikeState.set_model_year,
                    ),
                    spacing="1",
                    width="100%",
                ),

                # --- Hero image upload (optional) ---
                rx.vstack(
                    rx.text("Hero image (optional)", size="3"),
                    rx.upload(
                        rx.box(
                            "Click or drag an image here",
                            border="1px dashed #888",
                            padding="1rem",
                            border_radius="0.5rem",
                            text_align="center",
                            width="100%",
                        ),
                        id=upload_id,
                        max_files=1,
                        accept=["image/*"],
                    ),
                    spacing="1",
                    width="100%",
                ),

                rx.cond(
                    rx.selected_files(upload_id) != [],
                    rx.text("File selected", size="2", opacity="0.8"),
                    rx.box(),
                ),

                rx.cond(
                    BikeState.message != "",
                    rx.text(BikeState.message, color="red"),
                    rx.box(),
                ),

                # ✅ IMPORTANT: wrap in lambda so the event is created on click, not at compile time
                rx.button(
                    "Save bike",
                    on_click=lambda: BikeState.save_bike(rx.upload_files(upload_id)),
                    loading=BikeState.loading,
                    width="100%",
                ),

                spacing="4",
                width="100%",
            ),
            max_width="480px",
            width="100%",
        ),
        width="100%",
        height="100%",
    )

    return app_template(page_loading(protected_page(body)))