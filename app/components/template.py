# frontend/layout.py
import reflex as rx
from app.components.navbar import navbar
from app.components.sidebar import sidebar

def app_template(content: rx.Component) -> rx.Component:
    return rx.hstack(
        # LEFT COLUMN (navbar + content) + script hidden in here
        rx.box(
            rx.fragment(
                # rx.script(src='/js/pointer_tracker.js'),  # not a flex child now
                rx.vstack(
                    navbar(),
                    rx.box(
                        content,
                        padding={"base": "1rem", "md": "2rem"},
                        width="100%",
                        height="100%",
                        overflow="auto",
                    ),
                    spacing="0",
                    width="100%",
                    height="100vh",
                ),
            ),
            flex="1",       # <-- important: left column fills all remaining space
            min_width="0",  # <-- allow shrinking properly
            height="100vh",
        ),

        # RIGHT SIDEBAR
        # sidebar(),

        
        height="100vh",
        spacing="0",
        class_name="page",
    )