import reflex as rx
from app.components.forms import register_form
from app.components.template import app_template

@rx.page(route="/register", title="Register")
def register_page() -> rx.Component:
    content = rx.center(
        register_form(),
        min_height="100vh",
        )
    return app_template(content)
