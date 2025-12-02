import reflex as rx

def tile_card(content: rx.Component) -> rx.Component:
    """Square-ish tile used for shed cards."""
    return rx.card(
        rx.box(
            content,
            width="100%",
            height="100%",
        ),
        aspect_ratio="1 / 1",
        display="flex",
        align_items="stretch",
        justify_content="stretch",
        padding="1rem",
    )

def tile_grid(items, render_item) -> rx.Component:
    """
    Responsive tile layout:
        - Mobile/Tablet: horizontal scroll row (only tiles scroll).
        - Desktop: responsive grid with 4–5 columns.
    """
    # Inner row of tiles (can be wider than viewport)
    inner_row = rx.hstack(
        rx.foreach(items, render_item),
        spacing="3",
    )

    # MOBILE/TABLET: row scrolls inside a 100%-width box
    mobile_layout = rx.mobile_and_tablet(
        rx.box(
            inner_row,
            width="max-content",      # row can grow
        )
    )

    mobile_container = rx.box(
        mobile_layout,
        width="100%",               # constrained to viewport width
        overflow_x="auto",          # only this box scrolls
        overflow_y="hidden",
        padding_y="0.5rem",
    )

    # DESKTOP: normal responsive grid
    desktop_grid = rx.grid(
        rx.foreach(items, render_item),
        columns=rx.breakpoints(
            sm="4",
            lg="5",
        ),
        gap="1rem",
        width="100%",
    )
    desktop_layout = rx.desktop_only(desktop_grid)

    return rx.box(
        mobile_container,
        desktop_layout,
        width="100%",
    )