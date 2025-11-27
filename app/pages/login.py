import reflex as rx
from app.state.page_state import PageState
from app.state.auth_state import AuthState
from app.components.forms import login_form
from app.components.navbar import navbar
from app.components.page_loading import page_loading

@rx.page(route="/login", title="Login", on_load=[PageState.ready,AuthState.reset_form])
def login_page() -> rx.Component:
    form =  rx.vstack(
        rx.center(
            login_form(),
            min_height="100vh",
            
        ),
        align_items="center",
    )
    return page_loading(form)


