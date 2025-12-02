# app/pages/shed_detail.py
import reflex as rx
from app.state.shed_state import ShedState
from app.state.auth_state import AuthState
from app.state.page_state import PageState
from app.state.bike_state import BikeState
from app.components.template import app_template
from app.components.page_loading import page_loading
from app.components.protected import protected_page


@rx.page(
    route="/sheds/[shed_id]",
    title="Bike shed",
    on_load=[
        AuthState.ensure_auth_or_redirect,
        ShedState.load_shed_detail,   # loads current_shed + shed_bikes
        PageState.ready,              # hide loader when done
    ],
)
def shed_detail_page() -> rx.Component:
    # ---------- Filter + table block ----------
    filter_panel = rx.vstack(
        rx.hstack(
            rx.button(
                "Filter bikes",
                size="2",
                variant="soft",
                on_click=ShedState.toggle_filter_open,
            ),
            rx.spacer(),
            rx.input(
                placeholder="Search brand / model / year...",
                value=ShedState.text_filter,
                on_change=ShedState.set_text_filter,
                width="250px",
            ),
            width="100%",
            align_items="center",
        ),
        rx.cond(
            ShedState.filter_open,
            rx.box(
                rx.table.root(
                    rx.table.header(
                        rx.table.row(
                            rx.table.column_header_cell(
                                rx.vstack(
                                    rx.text("Brand", weight="medium", size="2"),
                                    rx.input(
                                        placeholder="Filter brand",
                                        value=ShedState.brand_filter,
                                        on_change=ShedState.set_brand_filter,
                                        size="1",
                                    ),
                                    spacing="1",
                                )
                            ),
                            rx.table.column_header_cell(
                                rx.vstack(
                                    rx.text("Model", weight="medium", size="2"),
                                    rx.input(
                                        placeholder="Filter model",
                                        value=ShedState.model_filter,
                                        on_change=ShedState.set_model_filter,
                                        size="1",
                                    ),
                                    spacing="1",
                                )
                            ),
                            rx.table.column_header_cell(
                                rx.vstack(
                                    rx.text("Year", weight="medium", size="2"),
                                    rx.input(
                                        placeholder="Year",
                                        value=ShedState.year_filter,
                                        on_change=ShedState.set_year_filter,
                                        size="1",
                                    ),
                                    spacing="1",
                                )
                            ),
                        )
                    ),
                    rx.table.body(
                        rx.foreach(
                            ShedState.filtered_bikes,
                            lambda b: rx.table.row(
                                rx.table.cell(b.get("brand", "")),
                                rx.table.cell(b.get("name", "")),
                                rx.table.cell(
                                    rx.cond(
                                        b.get("model_year") != None,
                                        b["model_year"],
                                        "",
                                    )
                                ),
                                bg=rx.cond(
                                    ShedState.selected_bike_ids.contains(b["id"]),
                                    "var(--accent-2)",
                                    "transparent",
                                ),
                                on_click=ShedState.toggle_select_bike(b["id"]),
                            ),
                        )
                    ),
                ),
                mt="0.75rem",
                border_radius="1rem",
                border=f"1px solid var(--accent-4)",
                padding="0.75rem",
                overflow_x="auto",
            ),
        ),
        spacing="3",
        width="100%",
    )

    # ---------- Shed header ----------
    shed_header = rx.hstack(
        rx.heading(
            rx.cond(
                ShedState.current_shed.get("name") != None,
                ShedState.current_shed.get("name"),
                "Untitled shed",
            ),
            size="6",
        ),
        rx.spacer(),
        rx.button(
            "Delete shed",
            color_scheme="red",
            variant="outline",
            on_click=ShedState.delete_current_shed_and_back,
        ),
        width="100%",
        align_items="center",
    )

    # ---------- Bikes grid (cards that go to bike analyser) ----------
    def shed_bike_card(b: dict) -> rx.Component:
        # image (if present) or a grey placeholder
        bike_image = rx.cond(
            b.get("hero_url") != None,
            rx.image(
                src=b.get("hero_url"),
                width="100%",
                height="100%",
                object_fit="cover",
                border_radius="0.75rem",
            ),
            rx.box(
                "No image",
                bg="var(--accent-3)",
                width="100%",
                height="100%",
                border_radius="0.75rem",
                display="flex",
                align_items="center",
                justify_content="center",
                font_size="0.75rem",
            ),
        )

        content = rx.vstack(
            rx.box(
                bike_image,
                width="100%",
                height="100%",
                border_radius="0.75rem",
                overflow="hidden",
            ),
            rx.text(b.get("name", "Untitled"), size="3", weight="medium"),
            rx.text(b.get("brand", ""), size="2", color="gray"),
            rx.text(
                rx.cond(
                    b.get("model_year") != None,
                    f"{b.get('model_year')}",
                    "",
                ),
                size="2",
                color="gray",
            ),
            spacing="1",
            align_items="flex-start",
            width="100%",
        )

        return rx.card(
            rx.box(
                content,
                width="100%",
                height="100%",
            ),
            aspect_ratio="1 / 1",
            padding="0.75rem",
            cursor="pointer",
            on_click=BikeState.goto_bike(b["id"]),   # go to /bike_analyser/[bike_id]
        )

    bikes_grid = rx.grid(
        rx.foreach(ShedState.shed_bikes, shed_bike_card),
        columns=rx.breakpoints(
            initial="2",   # small
            sm="3",        # tablet
            lg="4",        # desktop
        ),
        gap="1rem",
        width="100%",
    )

    bikes_section = rx.cond(
        ShedState.shed_bikes != [],
        bikes_grid,
        rx.text("No bikes in this shed yet.", size="3"),
    )

    # ---------- Main body ----------
    body = rx.vstack(
        shed_header,
        filter_panel,
        rx.heading("Bikes in this shed", size="4"),
        bikes_section,
        spacing="4",
        width="100%",
    )

    return app_template(
        page_loading(
            protected_page(body)
        )
    )