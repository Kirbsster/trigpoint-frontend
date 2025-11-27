# app/state/shed_state.py
from typing import List, Dict, Optional
import os
import httpx
import reflex as rx

from app.state.auth_state import AuthState

BACKEND_ORIGIN = os.getenv("BACKEND_ORIGIN", "http://127.0.0.1:9000")


class ShedState(rx.State):
    """Frontend state for managing bike sheds."""

    # form fields
    name: str = ""
    description: str = ""
    visibility: str = "private"  # "private" | "unlisted" | "public"

    # ui + data
    message: str = ""
    loading: bool = True             # start in loading state
    sheds: List[Dict] = []
    has_sheds: bool = False

    async def _auth_headers(self) -> Optional[dict]:
        """Get Authorization headers from AuthState, or redirect to login."""
        auth_state = await self.get_state(AuthState)
        token = auth_state.access_token
        if not token:
            return None
        return {"Authorization": f"Bearer {token}"}

    # ---------- Load sheds ----------

    async def load_sheds(self):
        """GET /sheds and store them in state."""
        self.loading = True
        self.message = ""

        headers = await self._auth_headers()
        if headers is None:
            self.loading = False
            return rx.redirect("/login")

        async with httpx.AsyncClient(base_url=BACKEND_ORIGIN) as client:
            try:
                r = await client.get("/sheds", headers=headers)
            except Exception as e:
                self.loading = False
                self.message = f"Error contacting backend: {e}"
                self.sheds = []
                self.has_sheds = False
                return

        self.loading = False

        if 200 <= r.status_code < 300:
            data = r.json() or []
            self.sheds = data
            self.has_sheds = len(data) > 0
        else:
            try:
                detail = r.json().get("detail")
            except Exception:
                detail = None
            self.message = detail or f"Failed to load sheds (status {r.status_code})"
            self.sheds = []
            self.has_sheds = False

    # ---------- Create shed ----------

    async def create_shed(self):
        """POST /sheds to create a new shed for this user."""
        self.message = ""

        if not self.name.strip():
            self.message = "Shed name is required."
            return

        headers = await self._auth_headers()
        if headers is None:
            return rx.redirect("/login")

        payload = {
            "name": self.name.strip(),
            "description": self.description.strip() or None,
            "visibility": self.visibility or "private",
        }

        self.loading = True
        async with httpx.AsyncClient(base_url=BACKEND_ORIGIN) as client:
            try:
                r = await client.post("/sheds", json=payload, headers=headers)
            except Exception as e:
                self.loading = False
                self.message = f"Error contacting backend: {e}"
                return

        self.loading = False

        if 200 <= r.status_code < 300:
            # reset form
            self.name = ""
            self.description = ""
            self.visibility = "private"
            # reload list so new shed appears in cards
            await self.load_sheds()
            self.message = "Shed created."
        else:
            try:
                detail = r.json().get("detail")
            except Exception:
                detail = None
            self.message = detail or f"Failed to create shed (status {r.status_code})"