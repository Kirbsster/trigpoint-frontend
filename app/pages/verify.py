import reflex as rx
from app.state.auth_state import AuthState
from app.components.template import app_template

@rx.page(
    route="/auth/verify-email",
    title="Verify email",
    on_load=AuthState.load_verify_token,
)
def verify_page() -> rx.Component:
    content = rx.center(
        rx.box(
            rx.vstack(
                rx.heading("Email verification", size="5"),
                rx.text(AuthState.message),
                rx.link("Back to login", href="/login"),
                spacing="4",
            ),
        ),
        min_h="100vh",
    )
    return app_template(content)