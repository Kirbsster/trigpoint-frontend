# app/pages/sheds.py
import reflex as rx
from app.components.template import app_template
from app.components.page_loading import page_loading
from app.components.protected import protected_page
from app.state.auth_state import AuthState
from app.state.page_state import PageState
from app.state.shed_state import ShedState


@rx.page(
    route="/sheds",
    title="Bike Sheds",
    on_load=[
        AuthState.ensure_auth_or_redirect,
        ShedState.load_sheds,
        PageState.ready,
    ],
)
def sheds_page() -> rx.Component:
    # ---------- Local helpers: tile_card + tile_grid ----------
    def tile_card(content: rx.Component, on_click=None) -> rx.Component:
        """Square-ish tile used for shed cards (optionally clickable)."""
        inner = rx.box(
            content,
            width="100%",
            height="100%",
            on_click=on_click,
            cursor="pointer" if on_click is not None else "default",
        )
        return rx.card(
            inner,
            aspect_ratio="1 / 1",   # keep it square-ish
            display="flex",
            align_items="stretch",
            justify_content="stretch",
            padding="1rem",
        )

    def tile_grid(
        items,
        render_item,
        extra_tiles=None,
    ) -> rx.Component:
        """
        Responsive tile layout:
          - Mobile/Tablet: horizontal scroll row.
          - Desktop: responsive grid with 4–5 columns.
        """
        extra_tiles = extra_tiles or []

        # --- MOBILE + TABLET: one horizontal row, scrollable left-right ---
        mobile_row = rx.box(
            rx.hstack(
                rx.foreach(items, render_item),
                *extra_tiles,
                spacing="3",
            ),
            width="max-content",
            overflow_x="auto",
            overflow_y="hidden",
            padding_y="0.5rem",
        )
        mobile_layout = rx.mobile_and_tablet(mobile_row)

        # --- DESKTOP: responsive grid ---
        desktop_grid = rx.grid(
            rx.foreach(items, render_item),
            *extra_tiles,
            columns=rx.breakpoints(
                sm="4",   # tablet-ish
                lg="5",   # desktop
            ),
            gap="1rem",
            width="100%",
        )
        desktop_layout = rx.desktop_only(desktop_grid)

        return rx.box(
            mobile_layout,
            desktop_layout,
            width="100%",
        )

    # ---------- Single shed card ----------
    def shed_card(shed: dict) -> rx.Component:
        vis = shed.get("visibility")

        visibility_label = rx.text(
            rx.cond(
                vis != None,
                vis,
                "private",
            ),
            size="2",
            color="gray",
        )

        bike_count_label = rx.text(
            "bikes",        # placeholder until we wire real counts
            size="2",
            color="gray",
        )

        content = rx.vstack(
            rx.hstack(
                rx.heading(shed.get("name", "Untitled shed"), size="4"),
                rx.spacer(),
                rx.icon_button(
                    rx.icon("trash-2"),
                    size="1",
                    variant="ghost",
                    on_click=ShedState.delete_shed(shed["id"]).stop_propagation,
                    aria_label="Delete shed",
                ),
                align="center",
                width="100%",
            ),
            rx.text(shed.get("description", ""), size="3"),
            rx.hstack(
                visibility_label,
                bike_count_label,
                spacing="3",
            ),
            spacing="2",
            width="100%",
        )

        # whole tile clickable → shed detail page
        return tile_card(
            content,
            on_click=ShedState.goto_shed(shed["id"]),
        )

    # ---------- "+ New shed" blank tile ----------
    def new_shed_tile() -> rx.Component:
        return tile_card(
            rx.center(
                rx.text("+ New shed", size="5", weight="bold"),
            ),
            # IMPORTANT: pass the event handler, do NOT call it
            on_click=ShedState.create_shed_and_go,
        )

    # ---------- Grid / rail of sheds + final blank tile ----------
    shed_grid = tile_grid(
        items=ShedState.sheds,
        render_item=shed_card,
        extra_tiles=[new_shed_tile()],
    )

    # ---------- Main body ----------
    body = rx.vstack(
        rx.hstack(
            rx.heading("My bike sheds", size="6"),
            rx.spacer(),
            align_items="center",
            width="100%",
        ),
        rx.cond(
            ShedState.loading,
            rx.text("Loading sheds..."),
            rx.cond(
                ShedState.sheds != [],
                shed_grid,
                rx.vstack(
                    rx.text(
                        "You have no bike sheds yet. Create your first shed.",
                        size="3",
                    ),
                    shed_grid,
                    spacing="3",
                    width="100%",
                ),
            ),
        ),
        rx.cond(
            ShedState.message != "",
            rx.text(ShedState.message, color="red"),
        ),
        spacing="4",
        width="100%",
    )

    return app_template(
        page_loading(
            protected_page(body)
        )
    )