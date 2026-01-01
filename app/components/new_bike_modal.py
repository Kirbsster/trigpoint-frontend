# app/components/new_bike_modal.py
import reflex as rx
from app.state.bike_state import BikeState


def new_bike_modal() -> rx.Component:
    upload_id = "bike-hero-upload-modal"

    hero_drop_zone = rx.box(
        rx.vstack(
            rx.icon("image", size=26, opacity="0.9"),
            rx.text("Add a hero image", size="3", weight="medium"),
            rx.text("Click to browse or drag & drop", size="2", opacity="0.7"),
            spacing="1",
            align="center",
            width="100%",
        ),
        width="100%",
        padding="1rem",
        text_align="center",
        border_radius="0.75rem",
        border="2px solid rgba(0,0,0,0.35)",
        box_shadow="0 10px 28px rgba(0,0,0,0.35)",
        bg="rgba(255,255,255,0.03)",
        _hover={
            "border": "2px solid rgba(0,0,0,0.35)",
            "bg": "rgba(0,0,0,0.1)",
            "box_shadow": "0 10px 28px rgba(0,0,0,0.35)",
            # "transform": "translateY(-1px)",
            "cursor": "pointer",
        },
        _active={
            "transform": "translateY(1px) scale(0.98)",
        }
    )







    hero_section = rx.vstack(
        rx.text("Hero image (optional)", size="3"),
        rx.cond(
            BikeState.hero_preview_src != "",
            rx.box(
                rx.image(
                    src=BikeState.hero_preview_src,
                    width="100%",
                    height="250px",          # controls how much top/bottom is cropped
                    object_fit="cover",      # fills width, crops overflow
                    object_position="center",
                ),
                # Top-right close button (overlay)
                rx.icon_button(
                    rx.icon("x", size=18),
                    aria_label="Clear image",
                    variant="solid",
                    radius="full",
                    size="2",
                    position="absolute",
                    top="10px",
                    right="10px",
                    bg="rgba(0,0,0,0.55)",
                    color="white",
                    box_shadow="0 6px 18px rgba(0,0,0,0.35)",
                    _hover={"bg": "rgba(0,0,0,0.75)"},
                    _active={"transform": "scale(0.96)"},
                    on_click=[
                        BikeState.clear_hero_preview,
                        rx.clear_selected_files(upload_id),
                    ],
                ),
                width="100%",
                position="relative",
                border_radius="0.75rem",
                overflow="hidden",
                border="1px solid rgba(255,255,255,0.12)",
                box_shadow="0 12px 36px rgba(0,0,0,0.35)",
            ),
            rx.upload(
                hero_drop_zone,
                id=upload_id,
                max_files=1,
                accept=["image/*"],
                width="100%",
                on_drop=BikeState.set_hero_preview(rx.upload_files(upload_id)),
                border_radius="0.75rem",
            ),
        ),
        rx.cond(
            BikeState.hero_preview_error != "",
            rx.text(BikeState.hero_preview_error, color="orange", size="2"),
            rx.box(),
        ),
        spacing="2",
        width="100%",
        
    )

    form = rx.vstack(
        rx.heading("Add a bike", size="6"),
        rx.text("Enter basic details for this bike.", size="3", opacity="0.8"),
        rx.vstack(
            rx.text("Name", size="3"),
            rx.input(
                placeholder="e.g. Whyte T-130",
                value=BikeState.name,
                on_change=BikeState.set_name,
                width="100%",
            ),
            spacing="1",
            width="100%",
        ),
        rx.vstack(
            rx.text("Brand", size="3"),
            rx.input(
                placeholder="e.g. Whyte",
                value=BikeState.brand,
                on_change=BikeState.set_brand,
                width="100%",
            ),
            spacing="1",
            width="100%",
        ),
        rx.vstack(
            rx.text("Model year", size="3"),
            rx.input(
                placeholder="e.g. 2019",
                value=BikeState.model_year,
                on_change=BikeState.set_model_year,
                width="100%",
            ),
            spacing="1",
            width="100%",
        ),
        hero_section,
        rx.cond(
            BikeState.message != "",
            rx.text(BikeState.message, color="red"),
            rx.box(),
        ),
        rx.hstack(
            rx.dialog.close(
                rx.button(
                    "Cancel",
                    variant="soft",
                    on_click=[
                        BikeState.reset_new_bike_form,
                        rx.clear_selected_files(upload_id),
                    ],
                ),
            ),
            rx.spacer(),
            rx.button(
                "Save bike",
                on_click=BikeState.save_bike(rx.upload_files(upload_id)),
                loading=BikeState.loading,
            ),
            width="100%",
        ),
        spacing="4",
        width="100%",
    )

    return rx.dialog.root(
        rx.dialog.trigger(
            rx.button(
                "+ Add bike",
                on_click=[
                    BikeState.reset_new_bike_form,
                    rx.clear_selected_files(upload_id),
                ],
            ),
        ),
        rx.dialog.content(
            form,
            max_width="520px",
            width="95vw",
        ),
    )