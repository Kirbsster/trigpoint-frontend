# app/components/loading.py
import reflex as rx


def loading_screen(message: str = "Loading...") -> rx.Component:
    """Full-width/height centered loading message."""
    return rx.center(
        rx.vstack(
            rx.text(message, size="4", weight="medium"),
            rx.text("Please wait", size="2", color="var(--gray-9)"),
            spacing="2",
            align_items="center",
        ),
        width="100%",
        height="100%",
        padding="2rem",
    )