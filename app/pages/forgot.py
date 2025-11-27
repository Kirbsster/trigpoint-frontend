import reflex as rx
from ..state.auth_state import AuthState
from app.components.forms import forgot_form
from app.components.template import app_template

@rx.page(route="/forgot", title="Forgot Password")
def forgot_page():
    content = rx.center(
        rx.box(
            forgot_form()
            ), 
        min_height="100vh",
        )
    return app_template(content)