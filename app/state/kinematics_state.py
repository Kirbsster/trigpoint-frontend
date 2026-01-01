# app/state/kinematics_state.py
import os
import httpx
import reflex as rx
from typing import Any, Dict, List, Optional

BACKEND_ORIGIN = os.getenv("BACKEND_ORIGIN", "http://127.0.0.1:9000")


class KinematicsState(rx.State):
    # Core solver data
    solver_steps: List[Dict[str, Any]] = []
    rear_axle_point_id: Optional[str] = None
    has_result: bool = False

    # UX
    error: Optional[str] = None
    is_loading: bool = False
    selected_step: int = 0

    @rx.event
    async def load_kinematics(self, bike_id: str, access_token: str):
        if not bike_id:
            return
        if not access_token:
            self.error = "No access token"
            return

        self.error = None
        self.is_loading = True
        self.solver_steps = []
        self.rear_axle_point_id = None
        self.has_result = False

        url = f"{BACKEND_ORIGIN}/bikes/{bike_id}/kinematics"
        headers = { "Authorization": f"Bearer {access_token}" }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url, headers=headers)

            if resp.status_code != 200:
                self.error = f"HTTP {resp.status_code}: {resp.text}"
                return

            data = resp.json()
            self.solver_steps = data.get("steps", [])
            self.rear_axle_point_id = data.get("rear_axle_point_id")
            self.has_result = len(self.solver_steps) > 0

        except Exception as exc:
            self.error = str(exc)

        finally:
            self.is_loading = False

    @rx.event
    def set_step(self, step: int):
        self.selected_step = step