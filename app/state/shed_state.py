# app/state/shed_state.py

from typing import List, Dict, Optional
import os
import httpx
import reflex as rx

from app.state.auth_state import AuthState
from app.state.page_state import PageState


BACKEND_ORIGIN = os.getenv("BACKEND_ORIGIN", "http://127.0.0.1:9000")


class ShedState(rx.State):
    """Frontend state for managing bike sheds."""

    # form fields
    name: str = ""
    description: str = ""
    visibility: str = "private"  # "private" | "unlisted" | "public"

    # ui + data
    message: str = ""
    loading: bool = True          # start in loading state
    sheds: List[Dict] = []
    has_sheds: bool = False

    # currently viewed shed (for /sheds/[shed_id])
    current_shed: Dict = {}

    async def _auth_headers(self) -> Optional[dict]:
        """Get Authorization headers from AuthState, or redirect to login."""
        auth_state = await self.get_state(AuthState)
        token = auth_state.access_token
        if not token:
            return None
        return {"Authorization": f"Bearer {token}"}

    # ---------- Load all sheds ----------

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

    # ---------- Load a single shed (for /sheds/[shed_id]) ----------

    @rx.event
    async def load_one_shed(self):
        """GET /sheds/{shed_id} based on URL params and store in current_shed."""
        self.loading = True
        self.message = ""
        self.current_shed = {}

        params = self.router.page.params or {}
        shed_id = params.get("shed_id")
        if isinstance(shed_id, list):
            shed_id = shed_id[0]

        if not shed_id:
            self.loading = False
            self.message = "No shed id in URL."
            return

        headers = await self._auth_headers()
        if headers is None:
            self.loading = False
            return rx.redirect("/login")

        async with httpx.AsyncClient(base_url=BACKEND_ORIGIN) as client:
            try:
                r = await client.get(f"/sheds/{shed_id}", headers=headers)
            except Exception as e:
                self.loading = False
                self.message = f"Error contacting backend: {e}"
                self.current_shed = {}
                return

        self.loading = False
        if r.status_code == 200:
            self.current_shed = r.json()
        else:
            try:
                detail = r.json().get("detail")
            except Exception:
                detail = None
            self.message = detail or f"Failed to load shed (status {r.status_code})"
            self.current_shed = {}

    # ---------- Create shed ----------
    async def create_shed(self, *, redirect_after: bool = False):
        """POST /sheds to create a new shed for this user.

        If redirect_after=True, navigate to /sheds/{id} after creation
        *without* re-rendering the sheds grid first.
        """
        self.message = ""

        # default name if blank
        if not self.name.strip():
            self.name = "NEW SHED"

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
            data = r.json()
            shed_id = data.get("id")

            # reset form fields
            self.name = ""
            self.description = ""
            self.visibility = "private"

            if redirect_after and shed_id:
                # 👇 IMPORTANT:
                # Do NOT call load_sheds() here.
                # Just jump straight to the new shed page so we don't
                # briefly re-render /sheds with the extra tile.
                return await self.goto_shed(shed_id)

            # Normal (non-redirect) path: behave as before
            await self.load_sheds()
            self.message = "Shed created."
        else:
            try:
                detail = r.json().get("detail")
            except Exception:
                detail = None
            self.message = detail or f"Failed to create shed (status {r.status_code})"

    @rx.event
    async def create_shed_and_go(self):
        """Convenience wrapper: create shed and redirect to its page."""
        return await self.create_shed(redirect_after=True)

    # ---------- Delete shed ----------

    @rx.event
    async def delete_shed(self, shed_id: str):
        """Delete a shed on the backend and update local state."""
        self.loading = True
        self.message = ""

        auth = await self.get_state(AuthState)
        token = auth.access_token
        if not token:
            self.loading = False
            return rx.redirect("/login")

        headers = {"Authorization": f"Bearer {token}"}

        async with httpx.AsyncClient(base_url=BACKEND_ORIGIN) as client:
            try:
                r = await client.delete(f"/sheds/{shed_id}", headers=headers)
            except Exception as e:
                self.loading = False
                self.message = f"Error contacting backend: {e}"
                return

        self.loading = False
        if 200 <= r.status_code < 300:
            # Remove locally so UI updates instantly
            self.sheds = [s for s in self.sheds if s.get("id") != shed_id]
            # also clear current_shed if we're on that page
            if self.current_shed.get("id") == shed_id:
                self.current_shed = {}
        else:
            try:
                data = r.json()
                detail = data.get("detail")
            except Exception:
                detail = None
            self.message = detail or f"Failed to delete shed (status {r.status_code})"

    @rx.event
    async def delete_current_shed_and_back(self):
        """Use URL param shed_id → delete_shed → go back to /sheds."""
        params = self.router.page.params or {}
        shed_id = params.get("shed_id")
        if isinstance(shed_id, list):
            shed_id = shed_id[0]

        if not shed_id:
            self.message = "No shed id in URL."
            return

        self.current_shed = {}
        self.shed_bikes = []
        self.selected_bike_ids = []
        await self.delete_shed(shed_id)
        return await self.goto_sheds()
    

    # --- Detail view state ---
    current_shed: dict = {}
    shed_bikes: List[Dict] = []
    detail_loading: bool = False

# --- Detail view state ---
    current_shed: dict = {}
    shed_bikes: List[Dict] = []
    detail_loading: bool = False

    @rx.event
    async def load_shed_detail(self):
        """Load a single shed, its bikes, and all user bikes for the picker."""
        self.detail_loading = True
        self.message = ""
        self.current_shed = {}
        self.shed_bikes = []
        self.available_bikes = []   # <-- IMPORTANT: reset here

        # Get shed_id from dynamic route /sheds/[shed_id]
        params = self.router.page.params or {}
        shed_id = params.get("shed_id")
        if isinstance(shed_id, list):
            shed_id = shed_id[0]
        if not shed_id:
            self.detail_loading = False
            return

        headers = await self._auth_headers()
        if headers is None:
            self.detail_loading = False
            return rx.redirect("/login")

        async with httpx.AsyncClient(base_url=BACKEND_ORIGIN) as client:
            # 1) Load the shed itself
            try:
                shed_resp = await client.get(f"/sheds/{shed_id}", headers=headers)
            except Exception as e:
                self.message = f"Error contacting backend: {e}"
                self.detail_loading = False
                return

            if shed_resp.status_code != 200:
                try:
                    detail = shed_resp.json().get("detail")
                except Exception:
                    detail = None
                self.message = detail or f"Failed to load shed (status {shed_resp.status_code})"
                self.detail_loading = False
                return

            self.current_shed = shed_resp.json()

            # 2) Bikes already in this shed
            try:
                bikes_resp = await client.get(f"/sheds/{shed_id}/bikes", headers=headers)
            except Exception as e:
                self.message = f"Shed loaded, but failed to load shed bikes: {e}"
                self.detail_loading = False
                return

            if bikes_resp.status_code == 200:
                # Trust backend's BikeOut hero_url (same as /bikes)
                self.shed_bikes = bikes_resp.json() or []
            else:
                try:
                    detail = bikes_resp.json().get("detail")
                except Exception:
                    detail = None
                self.message = detail or f"Failed to load shed bikes (status {bikes_resp.status_code})"
                self.shed_bikes = []
                self.selected_bike_ids = []

            # 3) ALL bikes for this user → used as candidates in the table
            try:
                all_bikes_resp = await client.get("/bikes", headers=headers)
            except Exception as e:
                self.message = f"Shed loaded, but failed to load bikes list: {e}"
                self.available_bikes = []
                self.detail_loading = False
                return

            if all_bikes_resp.status_code == 200:
                self.available_bikes = all_bikes_resp.json() or []
            else:
                try:
                    detail = all_bikes_resp.json().get("detail")
                except Exception:
                    detail = None
                self.message = detail or f"Failed to load bikes list (status {all_bikes_resp.status_code})"
                self.available_bikes = []
        self.selected_bike_ids = [b["id"] for b in self.shed_bikes]
        self.detail_loading = False

    @rx.event
    async def goto_shed(self, shed_id: str):
        """Navigate to the shed detail page for this shed, with loader."""
        page = await self.get_state(PageState)
        page.loading = True
        page.loading_message = "Loading shed..."
        # Optionally clear local detail to avoid stale use anywhere
        self.current_shed = {}
        self.shed_bikes = []
        return rx.redirect(f"/sheds/{shed_id}")


    @rx.event
    async def goto_sheds(self):
        """Navigate to the shed detail page for this shed, with loader."""
        page = await self.get_state(PageState)
        page.loading = True
        page.loading_message = "Loading shed..."
        return rx.redirect(f"/sheds")




    # --- Filter + selection state for "add bikes to shed" ---
    filter_open: bool = False

    # Column-specific filters
    brand_filter: str = ""
    model_filter: str = ""
    year_filter: str = ""
    text_filter: str = ""          # free text across all

    # Bikes we can add to this shed (e.g. all user's bikes)
    available_bikes: List[Dict] = []

    # which bikes are selected in the picker (by id)
    selected_bike_ids: List[str] = []

    @rx.event
    def toggle_filter_open(self):
        self.filter_open = not self.filter_open

    @rx.event
    def set_brand_filter(self, value: str):
        self.brand_filter = value

    @rx.event
    def set_model_filter(self, value: str):
        self.model_filter = value

    @rx.event
    def set_year_filter(self, value: str):
        self.year_filter = value

    @rx.event
    def set_text_filter(self, value: str):
        self.text_filter = value

    @rx.event
    async def toggle_select_bike(self, bike_id: str):
        """Toggle a bike in/out of this shed and persist to backend."""

        # ---- Determine which shed we are modifying ----
        params = self.router.page.params or {}
        shed_id = params.get("shed_id")
        if isinstance(shed_id, list):
            shed_id = shed_id[0]
        if not shed_id:
            self.message = "No shed id in URL."
            return

        headers = await self._auth_headers()
        if headers is None:
            return rx.redirect("/login")

        is_selected = bike_id in self.selected_bike_ids

        async with httpx.AsyncClient(base_url=BACKEND_ORIGIN) as client:
            try:
                if is_selected:
                    # Remove from shed
                    resp = await client.delete(
                        f"/sheds/{shed_id}/bikes/{bike_id}",
                        headers=headers,
                    )
                else:
                    # Add to shed
                    resp = await client.post(
                        f"/sheds/{shed_id}/bikes/{bike_id}",
                        headers=headers,
                    )
            except Exception as e:
                self.message = f"Failed to update shed bikes: {e}"
                return

        if not (200 <= resp.status_code < 300):
            try:
                detail = resp.json().get("detail")
            except Exception:
                detail = None
            self.message = detail or f"Failed to update shed (status {resp.status_code})"
            return

        # ---- Backend success → update local state ----
        if is_selected:
            # unselect
            self.selected_bike_ids = [
                b for b in self.selected_bike_ids if b != bike_id
            ]
            self.shed_bikes = [
                b for b in self.shed_bikes if b.get("id") != bike_id
            ]
        else:
            # select
            self.selected_bike_ids = [*self.selected_bike_ids, bike_id]

            # optionally append full bike object
            bike_obj = next((b for b in self.available_bikes if b.get("id") == bike_id), None)
            if bike_obj:
                self.shed_bikes = [*self.shed_bikes, bike_obj]

    @rx.var
    def filtered_bikes(self) -> List[Dict]:
        """Apply simple filters to available_bikes for the picker table."""
        bikes = self.available_bikes or []
        bf = (self.brand_filter or "").lower()
        mf = (self.model_filter or "").lower()
        yf = (self.year_filter or "").strip()
        tf = (self.text_filter or "").lower()

        out = []
        for b in bikes:
            brand = str(b.get("brand", "") or "").lower()
            name  = str(b.get("name", "") or "").lower()
            year  = str(b.get("model_year", "") or "")

            if bf and bf not in brand:
                continue
            if mf and mf not in name:
                continue
            if yf and yf != year:
                continue
            if tf and tf not in (brand + " " + name + " " + year).lower():
                continue
            out.append(b)
        return out