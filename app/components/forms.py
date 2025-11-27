import reflex as rx
from app.state.auth_state import AuthState


def auth_card(title: str, body: rx.Component, footer: rx.Component | None = None) -> rx.Component:
    return rx.center(
        rx.vstack(
            rx.heading(title, size="5"),
            body,
            footer if footer else rx.box(),
            spacing="4",
            align="stretch",
            width="100%",
        ),
        min_h="100vh",
        padding="6",
    )


def login_form() -> rx.Component:
    return auth_card(
        "",
        rx.form(
            rx.vstack(
                rx.center(
                    # rx.image(
                    #     src="/logo.jpg", width="2.5em", height="auto", border_radius="25%"
                    # ),
                    rx.heading(
                        "Sign in",
                        size="6",
                        as_="h2",
                        text_align="center",
                        width="100%",
                    ),
                    direction="column",
                    spacing="5",
                    width="100%",
                ),
                rx.vstack(
                    rx.text(
                        "Email address",
                        size="3",
                        weight="medium",
                        text_align="left",
                        width="100%",
                    ),
                    rx.input(
                        rx.input.slot(rx.icon("user")),
                        type="email",
                        placeholder="email",
                        on_change=AuthState.set_email,
                        required=True,
                        size="3",
                        width="100%",
                    ),
                    spacing="2",
                    width="100%",
                ),
                rx.vstack(
                    rx.hstack(
                        rx.text("Password", size="3", weight="medium"),
                        rx.link("Forgot password?", href="/forgot", size="3"),
                        justify="between",
                        width="100%",
                    ),
                    rx.input(
                        rx.input.slot(rx.icon("lock")),
                        type="password",
                        placeholder="password",
                        on_change=AuthState.set_password,
                        required=True,
                        size="3",
                        width="100%",
                    ),
                    spacing="2",
                    width="100%",
                ),
                rx.cond(
                    AuthState.message != "",
                    rx.text(AuthState.message, color="red"),
                ),
                rx.button(
                    "Sign in", 
                    size="3", 
                    width="100%",
                    type="submit",
                    disabled=AuthState.loading,
                    ),
                rx.center(
                    rx.text("New here?", size="3"),
                    rx.link("Sign up", href="/register", size="3"),
                    opacity="0.8",
                    spacing="2",
                    direction="row",
                    width="100%",
                ),
                spacing="6",
                width="100%",
            ),
            max_width="28em",
            size="4",
            width="100%",
            on_submit=AuthState.login,
            reset_on_submit=False,
        ),
    )


def register_form() -> rx.Component:
    return auth_card(
        "",
        rx.form(
            rx.vstack(
                rx.center(
                    rx.heading(
                        "Register",
                        size="6",
                        as_="h2",
                        text_align="center",
                        width="100%",
                    ),
                    direction="column",
                    spacing="5",
                    width="100%",
                ),
                rx.vstack(
                    rx.text(
                        "Email address",
                        size="3",
                        weight="medium",
                        text_align="left",
                        width="100%",
                    ),
                    rx.input(
                        rx.input.slot(rx.icon("user")),
                        type="email",
                        placeholder="email",
                        on_change=AuthState.set_email,
                        required=True,
                        size="3",
                        width="100%",
                    ),
                    spacing="2",
                    width="100%",
                ),
                rx.vstack(
                    rx.text(
                        "New Password",
                        size="3",
                        weight="medium",
                        text_align="left",
                        width="100%",
                    ),
                    rx.input(
                        rx.input.slot(rx.icon("lock")),
                        type="password",
                        placeholder="password",
                        on_change=AuthState.set_password,
                        required=True,
                        size="3",
                        width="100%",
                    ),
                    rx.input(
                        rx.input.slot(rx.icon("lock")),
                        type="password",
                        placeholder="confirm password",
                        on_change=AuthState.set_password2,
                        required=True,
                        size="3",
                        width="100%",
                    ),
                    spacing="3",
                    width="100%",
                ),
                rx.button(
                    rx.cond(AuthState.loading, "Creating account...", "Create account"),
                    type="submit",
                    disabled=AuthState.loading,
                    width="100%",
                    spacing="3",
                    size="3",
                ),
                rx.cond(
                    AuthState.message != "",
                    rx.text(AuthState.message, color="red"),
                ),
                spacing="6",
                width="100%",
            ),
            on_submit=AuthState.register,
            reset_on_submit=False,
        ),
        rx.center(
            rx.text("Have an account?"),
            rx.link("Login", href="/login"),
            spacing="3",
            size="4",
            width="100%",
        ),    
    )


def forgot_form() -> rx.Component:
    return auth_card(
        "",
        rx.form(
            rx.vstack(
                rx.center(
                    rx.vstack(
                        rx.heading("Forgot your password?", size="6"),
                        rx.text("Enter your email and we'll send you a reset link."),
                        rx.input(
                            rx.input.slot(rx.icon("user")),
                            placeholder="email",
                            type="email",
                            on_change=AuthState.set_email,
                            size="3",
                            width="100%",
                        ),
                    ),
                ),
                rx.center(
                    rx.button(
                        "Send reset link",
                        on_click=AuthState.forgot_password,
                        disabled=AuthState.loading,
                        size="3",
                        width="100%",
                    ),
                ),
                rx.center(
                    rx.cond(
                        AuthState.message != "",
                        rx.text(AuthState.message),
                    ),
                ),
                rx.center(
                    rx.link("Back to login", href="/login"),
                    spacing="4",
                    size="3",
                    width="100%",
                ),
                spacing="6",
                width="100%",
            ),
        ),
    )

def reset_form() -> rx.Component:
    return auth_card(
        "",
        rx.form(
            rx.center(
                rx.vstack(
                    rx.heading("Reset your password", size="6"),
                    rx.text(
                        "New Password",
                        size="3",
                        weight="medium",
                        text_align="left",
                        width="100%",
                    ),
                    rx.input(
                        rx.input.slot(rx.icon("lock")),
                        type="password",
                        placeholder="password",
                        on_change=AuthState.set_new_password,
                        required=True,
                        size="3",
                        width="100%",
                    ),
                    rx.input(
                        rx.input.slot(rx.icon("lock")),
                        type="password",
                        placeholder="confirm password",
                        on_change=AuthState.set_new_password2,
                        required=True,
                        size="3",
                        width="100%",
                    ),
                    rx.button(
                        "Reset password",
                        on_click=AuthState.reset_password,
                        disabled=AuthState.loading,
                        size="3",
                    ),
                    rx.cond(
                        AuthState.message != "",
                        rx.text(AuthState.message),
                    ),
                    rx.center(
                        rx.link("Back to login", href="/login"),
                        spacing="4",
                        size="3",
                        width="100%",
                    ),              
                )
            )
        )

    )