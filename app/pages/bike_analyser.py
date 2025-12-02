import reflex as rx

from app.components.template import app_template
from app.components.page_loading import page_loading
from app.components.protected import protected_page
from app.state.auth_state import AuthState
from app.state.page_state import PageState
from app.state.bike_state import BikeState


POINT_TYPES = [
    ("frame",      "Frame point",  "square"),
    ("free",       "Free pivot",   "move-3d"),
    ("fixed",      "Fixed pivot",  "pin"),
    ("shock",      "Shock pivot",  "activity"),
    ("front_axle", "Front axle",   "circle-dot"),
    ("rear_axle",  "Rear axle",    "target"),
]


def point_type_panel() -> rx.Component:
    """Vertical stack of point-type buttons on the right-hand side."""
    buttons: list[rx.Component] = []

    for type_key, label, icon_name in POINT_TYPES:
        buttons.append(
            rx.button(
                rx.hstack(
                    rx.icon(icon_name),
                    rx.text(label),
                    spacing="1",
                    align_items="center",
                ),
                size="2",
                color="var(--accent)",
                variant="soft",
                justify_content="flex-start",
                width="140px",
                padding_x="0.5rem",
                padding_y="0.35rem",
                border_radius="999px",
                cursor="pointer",
                transition="all 0.15s ease",
                _hover={
                    "bg": "rgba(255,255,255,0.08)",
                    "border_color": "rgba(0,229,255,0.8)",
                    "transform": "translateX(-3px)",
                },
                _active={
                    "transform": "scale(0.98)",
                },
                class_name="point-type-btn",
                data_point_type=type_key,
                on_click=rx.call_script(
                    f'(() => {{ const c = document.getElementById("bike-viewer-container"); if (c && c.bikeViewer && c.bikeViewer.setType) {{ c.bikeViewer.setType("{type_key}"); }} }})();'
                ),
            )
        )

    return rx.box(
        *buttons,
        position="absolute",
        top="16px",
        right="8px",
        display="flex",
        flex_direction="column",
        gap="0.4rem",
        z_index="20",
        pointer_events="auto",
    )


@rx.page(
    route="/bike_analyser/[bike_id]",
    title="Bike Analyser",
    on_load=[
        AuthState.ensure_auth_or_redirect,
        BikeState.load_one_bike,
        PageState.ready,
    ],
)
def bike_analyser() -> rx.Component:
    body = rx.box(
        rx.script(src="/js/bike_points_viewer.js"),

        # === VIEWER + TOOL PANEL CONTAINER ===
        rx.box(
            # inner viewport: image + canvas attach here
            rx.box(
                rx.cond(
                    BikeState.current_bike != {},
                    rx.image(
                        id="bike-image",
                        src=BikeState.current_bike.get("hero_url", ""),
                        width="100%",
                        height="100%",
                        object_fit="contain",
                    ),
                    rx.text("Bike not found", size="4"),
                ),
                # RESET VIEW BUTTON (BOTTOM CENTER) OVER IMAGE
                rx.icon_button(
                    "rotate-ccw",
                    size="3",
                    variant="solid",
                    color_scheme="gray",
                    border_radius="full",
                    position="absolute",
                    bottom="16px",
                    left="50%",
                    transform="translateX(-50%)",
                    z_index="10",
                    opacity="0.85",
                    _hover={"opacity": "1"},
                    on_click=rx.call_script(
                        '(() => { const c = document.getElementById("bike-viewer-container"); if (c && c.bikeViewer && c.bikeViewer.resetView) { c.bikeViewer.resetView(); } })();'
                    ),
                ),
                id="bike-viewer-inner",  # 👈 match JS
                position="relative",
                width="100%",
                height="100%",
            ),
            id="bike-viewer-container",
            bg="var(--bg)",
            width="100%",
            height="100%",
            position="relative",
            overflow="hidden",
        ),

        # Right-side vertical palette of point-type buttons
        point_type_panel(),

        width="100%",
        height="100%",
        position="relative",
        overflow="visible",
    )

    return app_template(page_loading(protected_page(body)))