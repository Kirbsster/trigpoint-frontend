import os
import reflex as rx

from app.components.template import app_template
from app.components.page_loading import page_loading
from app.components.protected import protected_page
from app.state.auth_state import AuthState
from app.state.page_state import PageState
from app.state.bike_state import BikeState

from app.components.kinematics_panel import kinematics_panel

from app.components.icons import bb_icon, wheel_icon

POINT_TYPES = [
    ("bb",         "Bottom Bracket", bb_icon),
    ("rear_axle",  " Rear Axle",   "/icons/rwheel.png"),
    ("front_axle", " Front Axle",   "/icons/fwheel.png"),
    ("free",       "Free pivot",   "circle-dot"),
    ("fixed",      "Fixed pivot",  "anchor"),
]
LINK_TYPES = [
    ("bar",  "Rigid Link", "link"),
    ("shock","Shock Link", "activity"),
]

def point_type_panel() -> rx.Component:
    """Right-hand floating toolbar: point type buttons + link-mode button."""
    buttons: list[rx.Component] = []

    buttons.append(
        rx.box(
            width="40px",
            height="2px",
            bg="var(--text-dark)",   # or any subtle line color
            margin_y="1px",
            # spacing="0",
            opacity="0.5",
        )
    )

    # --- Point type buttons (unchanged logic) ---
    for type_key, label, icon_spec in POINT_TYPES:
        if callable(icon_spec):
            icon = icon_spec()
        elif icon_spec.endswith(".png") or icon_spec.endswith(".jpg"):
            icon =  rx.image(
                src=icon_spec,
                width="35px",
                height="35px",
                object_fit="contain",
                style={"pointerEvents": "auto"},
            )
        else:
            icon = rx.icon(
                icon_spec,
                size=30,
                class_name="point-type-icon",
                color="var(--text)",
            )            
        buttons.append(
            rx.button(
                rx.hstack(
                    icon,
                    rx.spacer(),
                    rx.text(
                        label,
                        color="var(--text-light)",
                        class_name="point-type-label",
                        white_space="nowrap",
                        overflow="hidden",
                        max_width="0px",     # collapsed by default
                        # opacity="0",
                        # margin_left="0",
                        # text_align="right",
                        # spacing="5",
                        # justify_content="right",
                        # transition=(
                        #     "max-width 0.18s ease, "
                        #     "opacity 0.18s ease, "
                        #     "margin-left 0.18s ease"
                        # ),
                    ),
                    spacing="0",
                    align="center",
                    # justify="between",
                ),
                # size="2",
                variant="solid",
                bg="var(--bg)",
                # justify_content="center",
                width="40px",          # collapsed width (icon-only)
                height="40px",
                padding="0",
                border_radius="999px",
                cursor="pointer",
                transition=(
                    "width 0.18s ease, "
                    "background 0.15s ease, "
                    "box-shadow 0.15s ease"
                ),
                class_name="point-type-btn",
                data_point_type=type_key,
                pointer_events="auto",   # <-- important: buttons still clickable
                _hover={
                    # "bg": "var(--text-dark)",
                    "box_shadow": "0 0 4px var(--text-dark)",
                },
                _active={"transform": "scale(0.97)"},
                on_click=rx.call_script(
                    f"""
                    (() => {{
                        const c = document.getElementById('bike-viewer-container');
                        const bv = c?.bikeViewer;
                        if (!bv) return;
                        // mark this as a UI-origin click so JS can suppress the next canvas pointerdown
                        bv.setType('{type_key}', {{ fromUI: true }});
                    }})();
                    """
                ),
                
            )
        )

    buttons.append(
        rx.box(
            width="40px",
            height="2.5px",
            bg="var(--text-dark)",   # or any subtle line color
            margin_y="6px",
            opacity="0.5",
        )
    )

    for type_key, label, icon_spec in LINK_TYPES:
        if callable(icon_spec):
            icon = icon_spec()
        else:
            icon = rx.icon(
                icon_spec,
                size=30,
                class_name="link-type-icon",
                color="var(--text-dark)",
            )

        buttons.append(
            rx.button(
                rx.hstack(
                    icon,
                    rx.spacer(),
                    rx.text(
                        label,
                        color="var(--text-light)",
                        class_name="link-type-label",
                        white_space="nowrap",
                        overflow="hidden",
                        max_width="0px",
                    ),
                    spacing="0",
                    align="center",
                ),
                variant="solid",
                bg="var(--bg)",
                width="40px",
                height="40px",
                padding="0",
                border_radius="999px",
                cursor="pointer",
                transition=(
                    "width 0.18s ease, "
                    "background 0.15s ease, "
                    "box-shadow 0.15s ease"
                ),
                class_name="link-type-btn",
                data_link_type=type_key,      # <-- changed from data_point_type
                pointer_events="auto",
                _hover={"box_shadow": "0 0 4px var(--text-dark)"},
                _active={"transform": "scale(0.97)"},
                on_click=rx.call_script(
                    f"""
                    (() => {{
                        const c = document.getElementById('bike-viewer-container');
                        const bv = c?.bikeViewer;
                        if (!bv) return;
                        // behaves like point setType, with fromUI flag
                        bv.setLinkType('{type_key}', {{ fromUI: true }});
                    }})();
                    """
                ),
            )
        )

    return rx.box(
        rx.vstack(
            *buttons,
            spacing="2",
            align_items="flex-end",
        ),
        id="point-tools-panel",
        position="absolute",
        top="16px",
        right="8px",
        display="flex",
        flex_direction="column",
        # align_items="flex-end",
        width="150px",   # a bit wider to accommodate the link button text
        z_index="20",
        pointer_events="none",   # <-- panel itself does NOT eat clicks
    )

def details_section() -> rx.Component:
    """Stub for the section below the hero viewer (future tabs, tables, charts)."""
    return rx.box(
        rx.vstack(
            rx.heading("Bike details", size="5"),
            rx.text(
                "Here we’ll show component lists, geometry tables, and linkage charts.",
                size="3",
                opacity="0.8",
            ),
            rx.box(
                rx.text("• Component list / build spec (coming soon)"),
                rx.text("• Geometry table (reach, stack, CS length, etc.)"),
                rx.text("• Linkage charts (leverage ratio, axle path, anti-squat…)"),
                padding_y="0.75rem",
                padding_x="1rem",
                border_radius="0.75rem",
                border="1px solid rgba(255,255,255,0.08)",
                bg="rgba(255,255,255,0.02)",
            ),
            spacing="4",
            align_items="flex-start",
        ),
        id="bike-details-section",
        padding_top="2.5rem",
        padding_bottom="4rem",
        padding_x="1rem",
        width="100%",
        max_width="960px",
        margin_x="auto",
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
    viewer = rx.box(
        # rx.script(src="/js/bike_viewer/core.js"),
        # rx.script(src="/js/bike_viewer/dom.js"),
        # rx.script(src="/js/bike_viewer/theme.js"),
        # rx.script(src="/js/bike_viewer/ui_buttons.js"),
        # rx.script(src="/js/bike_viewer/api.js"),
        rx.script(src="/js/bike_viewer/index.js", type="module"),

        rx.box(
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
                id="bike-viewer-inner",
                position="relative",
                width="100%",
                height="100%",
            ),
            id="bike-viewer-container",
            data_bike_id=BikeState.current_bike.get("id"),
            data_access_token=AuthState.access_token,
            data_backend_origin=os.getenv("BACKEND_ORIGIN", "http://127.0.0.1:9000"),
            bg="var(--bg)",
            width="100%",
            height="500px",
            position="relative",
            overflow="hidden",
        ),

        # Right-side point-type + link-mode palette
        point_type_panel(),

        # Big down arrow to hint “scroll to next section”
        rx.icon_button(
            "chevron-down",
            size="4",
            variant="ghost",
            border_radius="full",
            position="absolute",
            bottom="8px",
            left="50%",
            z_index="25",
        ),

        width="100%",
        position="relative",
        padding_bottom="2.5rem",
    )

    body = rx.vstack(
        viewer,
        details_section(),
        kinematics_panel(
            BikeState.current_bike.get("id"),
            AuthState.access_token,
        ),
        spacing="0",
        align_items="stretch",
        width="100%",
    )
    return app_template(page_loading(protected_page(body)))