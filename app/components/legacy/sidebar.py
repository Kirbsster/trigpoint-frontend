# frontend/components/sidebar.py
import reflex as rx
from app.state.auth_state import AuthState
from frontend.app.state.legacy.sidebar_state import SidebarState


def sidebar() -> rx.Component:
    '''Simple open/closed sidebar on the right with a circular toggle.'''
    return rx.box(
        # Circular toggle handle at the top
        sidebar_toggle_button(),

        # Inner content
        rx.vstack(
            # Placeholder for your real content
            rx.text(
                'Sidebar content',
                font_size=dict(base='0.9rem', md='1rem'),
                color='var(--text)',
            ),

            rx.spacer(),
            rx.button(
                "+ Add bike", width="100%", size="3", variant="solid", 
                on_click=rx.redirect("/bikes/new")
            ),

            rx.button(
                "Sign Out",
                color_scheme="red",
                width="100%",
                on_click=AuthState.logout,
            ),

            spacing='2',
            padding='0.75rem 0.75rem',
            align_items="stretch",
        ),

        # Outer container
        border_left='1px solid var(--accent)',
        width=rx.breakpoints(initial='0px', sm='50px', md='200px'),
        height='100vh',
        display=rx.breakpoints(md='block'),
        bg='var(--side-bg)'
    )




def sidebar_toggle_button() -> rx.Component:
    '''
    Circular arrow button at the top-left edge of the sidebar.

    - When open: arrow points into the sidebar.
    - When closed: arrow points into the content.
    '''
    return rx.box(
        rx.icon_button(
            rx.icon(
                'panel-right-open',
                color='#ffffff',
            ),
            size='2',
            radius='full',
            bg='var(--accent)',
            color='#0b1120',
            border='2px solid var(--accent)',
            on_click=SidebarState.toggle,
        ),
        position='absolute',
        right='0',
        top='0px',
    )