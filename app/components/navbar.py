import reflex as rx
from app.state.auth_state import AuthState
from app.state.page_state import PageState
from app.state.shed_state import ShedState


def navbar_card(text: str, url: str) -> rx.Component:
    """Generic navbar item that also triggers the global loading overlay."""
    # Optional: customise the message per tab if you like
    loading_message = f"Loading {text.lower()}..."

    return rx.card(
        rx.link(
            rx.text(text, size="5", color="var(--text)"),
            href=url,
            # IMPORTANT: wrap PageState.goto in a lambda so Reflex
            # doesn't treat the click event payload as the `message` arg.
            on_click=lambda: PageState.goto(url, loading_message),
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
            navbar_card("Bikes", "/bikes"),
            navbar_card("Sheds", "/sheds"),
            spacing="5",
            align="center",
        ),
        spacing="4",
        align="center",
    )

    # right grouping
    right_group = rx.menu.root(
        rx.menu.trigger(
            rx.icon_button(rx.icon("user"), size="2", radius="full", bg="var(--accent)"),
        ),
        rx.menu.content(
            rx.menu.item("Settings"),
            rx.menu.separator(),
            rx.menu.item("Log out", on_click=AuthState.logout),
        ),
    )

    return rx.box(
        rx.hstack(
            left_group,
            rx.spacer(),
            right_group,
            align="center",
            justify="between",
            width="100%",
        ),
        width="100%",
        bg="var(--nav-bg)"
    )
