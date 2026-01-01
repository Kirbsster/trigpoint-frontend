import reflex as rx
from app.state.kinematics_state import KinematicsState


def kinematics_panel(bike_id: str, access_token: str) -> rx.Component:
    return rx.vstack(
        rx.hstack(
            rx.text("Kinematics", weight="medium"),
            spacing="2",
            align="center"
        ),

        # Run solver
        rx.button(
            rx.cond(
                KinematicsState.is_loading,
                "Running…",
                "Run solver",
            ),
            on_click=lambda: KinematicsState.load_kinematics(bike_id, access_token),
            disabled=KinematicsState.is_loading,
        ),

        _status_row(),
        _travel_section(),

        spacing="3",
        width="100%",
        align="start",
        border="1px solid #444",
        padding="0.75rem",
        border_radius="0.5rem",
    )


def _status_row():
    return rx.cond(
        KinematicsState.error.is_not_none(),
        rx.text(KinematicsState.error, color="red"),

        rx.cond(
            KinematicsState.has_result,
            rx.text("Solver ran successfully.", color="green"),
            rx.text("No kinematics yet. Run solver.", color="gray"),
        ),
    )


def _travel_section():
    return rx.cond(
        KinematicsState.has_result,
        _travel_list_content(),
        rx.box(),
    )


def _travel_list_content():
    header = rx.hstack(
        rx.text("Step", width="12%", weight="medium"),
        rx.text("Stroke", width="26%", weight="medium"),
        rx.text("Travel", width="26%", weight="medium"),
        rx.text("Leverage", width="26%", weight="medium"),
        spacing="2",
        width="100%"
    )

    def row(step):
        return rx.hstack(
            rx.text(step["step_index"], width="12%"),
            rx.text(step["shock_stroke"], width="26%"),
            rx.text(step["rear_travel"], width="26%"),
            rx.text(step["leverage_ratio"], width="26%"),
            spacing="2",
            width="100%",
        )

    return rx.vstack(
        rx.text("Stroke → Travel / Leverage", weight="medium"),
        header,
        rx.box(
            rx.foreach(KinematicsState.solver_steps, row),
            width="100%",
        ),
        spacing="1",
        width="100%",
        align="start",
    )