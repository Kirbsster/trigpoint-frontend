import reflex as rx
from ..state.auth_state import AuthState
from app.components.forms import reset_form
from app.components.template import app_template

@rx.page(route="/reset", title="Reset Password", on_load=AuthState.load_reset_token)
def reset_page():
    """Reset password page.

    For now, paste the reset token from the email (or dev JSON) into the form.
    We can wire automatic token-from-URL later.
    """
    content = rx.center(
        reset_form(),
        min_height="100vh",
        )
    return app_template(content)