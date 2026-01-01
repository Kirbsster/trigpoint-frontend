import reflex as rx
from app.state.auth_state import AuthState
from app.state.page_state import PageState
from app.state.shed_state import ShedState
from app.state.bike_state import BikeState


def navbar_card(text: str, url: str, on_click=None) -> rx.Component:
    loading_message = f"Loading {text.lower()}..."
    return rx.card(
        rx.link(
            rx.text(text, size="5", color="var(--text)"),
            href=None if on_click else url,
            on_click=on_click or (lambda: PageState.goto(url, loading_message)),
        ),
        as_child=True,
        variant="ghost",
    )

def navbar() -> rx.Component:

    # left grouping
    left_group = rx.hstack(
        rx.link(
            rx.image(
                src="/images/logo.png",
                width="5em",
                height="auto"
            ),
            href="/",
        ),
        rx.flex(
            navbar_card("News", "/news"),
            navbar_card("Bikes", "/bikes", on_click=BikeState.goto_bikes),
            navbar_card("Sheds", "/sheds"),
            spacing="5",
            align="center",
        ),
        spacing="4",
        align="center",
    )

    # right grouping
    right_group = rx.box(
        rx.menu.root(
            rx.menu.trigger(
                rx.icon_button(
                    "user",
                    size="3",
                    color="var(--text-dark)",
                    radius="full",
                    bg="var(--bg)",
                    _active={"box_shadow": "none"},
                    _focus={"box_shadow": "none", "outline": "none"},
                ),
            ),
            rx.menu.content(
                rx.menu.item("Settings"),
                rx.menu.separator(),
                rx.menu.item("Log out", on_click=AuthState.logout),
            ),
        ),
        padding_right="0.5rem",   # 🔥 works reliably
    )

    return rx.box(
        rx.hstack(
            left_group,
            rx.spacer(),
            right_group,
            align="center",
            justify="between",
            width="100%",
            # padding_right="5px",
        ),
        width="100%",
        bg="var(--nav-bg)"
    )
