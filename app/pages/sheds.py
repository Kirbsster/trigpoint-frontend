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
    # ----- Single shed card -----
    def shed_card(shed: dict) -> rx.Component:
        # visibility is a Var; we can't call .capitalize() on it.
        vis = shed.get("visibility")

        return rx.card(
            rx.vstack(
                rx.heading(shed.get("name", "Untitled shed"), size="4"),
                rx.text(shed.get("description", ""), size="3"),
                rx.hstack(
                    rx.text(
                        rx.cond(
                            vis != None,
                            vis,
                            "private",
                        ),
                        size="2",
                        color="gray",
                    ),
                    rx.text("bikes", size="2"),  # real counts later
                    spacing="3",
                ),
                spacing="2",
                align_items="flex-start",
                width="100%",
            ),
            width="100%",
        )

    # ----- "+ New shed" card at the end -----
    new_shed_card = rx.card(
        rx.vstack(
            rx.heading("+ New shed", size="4"),
            rx.input(
                placeholder="Shed name",
                value=ShedState.name,
                on_change=ShedState.set_name,
                width="100%",
            ),
            rx.text_area(
                placeholder="Optional description",
                value=ShedState.description,
                on_change=ShedState.set_description,
                width="100%",
                rows="3",  # must be str for Radix TextArea
            ),
            rx.select(
                ["private", "unlisted", "public"],
                value=ShedState.visibility,
                on_change=ShedState.set_visibility,
                label="Visibility",
                width="100%",
            ),
            rx.button(
                "Create shed",
                on_click=ShedState.create_shed,
                width="100%",
            ),
            spacing="3",
            width="100%",
        ),
        width="100%",
    )

    # ----- Main body -----
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
            rx.vstack(
                rx.foreach(ShedState.sheds, shed_card),
                new_shed_card,
                spacing="3",
                width="100%",
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