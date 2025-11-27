# app/state/bike_state.py
from typing import List, Dict
import os
import httpx
import reflex as rx

from app.state.auth_state import AuthState  # to reuse the token


BACKEND_ORIGIN = os.getenv("BACKEND_ORIGIN", "http://127.0.0.1:9000")


class BikeState(rx.State):
    name: str = ""
    brand: str = ""
    model_year: str = ""
    message: str = ""
    loading: bool = True
    bikes: List[Dict] = []
    has_bikes: bool = False
    current_bike: dict = {}

    # ---------- Create / save bike (with optional hero upload) ----------

    async def save_bike(self, files: list[rx.UploadFile]):
        """Create a bike, then optionally upload a hero image file."""
        self.loading = True
        self.message = ""

        # get access token from AuthState's LocalStorage-backed value
        auth_state = await self.get_state(AuthState)
        token = auth_state.access_token
        if not token:
            self.loading = False
            self.message = "You must be logged in to add a bike."
            return rx.redirect("/login")

        headers = {"Authorization": f"Bearer {token}"}

        # ---- 1) Create the bike via POST /bikes ----
        payload = {
            "name": self.name,
            "brand": self.brand,
        }
        if self.model_year.strip():
            try:
                payload["model_year"] = int(self.model_year.strip())
            except ValueError:
                self.loading = False
                self.message = "Model year must be a number."
                return

        async with httpx.AsyncClient(base_url=BACKEND_ORIGIN) as client:
            try:
                r = await client.post("/bikes", json=payload, headers=headers)
            except Exception as e:
                self.loading = False
                self.message = f"Error contacting backend: {e}"
                return

        if not (200 <= r.status_code < 300):
            try:
                data = r.json()
                detail = data.get("detail")
            except Exception:
                detail = None
            self.loading = False
            self.message = detail or f"Failed to add bike (status {r.status_code})"
            return

        # bike was created successfully
        bike_data = r.json()
        bike_id = bike_data.get("id")
        if not bike_id:
            self.loading = False
            self.message = "Bike created but response had no id."
            return

        # ---- 2) If files were provided, upload the first as hero image ----
        if files:
            file0 = files[0]
            try:
                content = await file0.read()
                filename = file0.filename or "image"
                content_type = file0.content_type or "application/octet-stream"
                async with httpx.AsyncClient(base_url=BACKEND_ORIGIN) as client:
                    resp = await client.post(
                        f"/bikes/{bike_id}/media/hero",
                        headers=headers,
                        files={"file": (filename, content, content_type)},
                    )
            except Exception as e:
                # bike is created, but image upload failed
                self.message = f"Bike added, but image upload failed: {e}"
                self.loading = False
                await self.load_bikes()
                return rx.redirect("/bikes")

            if not (200 <= resp.status_code < 300):
                self.message = (
                    f"Bike added, but hero image upload failed "
                    f"(status {resp.status_code})."
                )
                self.loading = False
                await self.load_bikes()
                return rx.redirect("/bikes")

        # ---- 3) Success: reload list and go to /bikes ----
        self.message = "Bike and hero image added." if files else "Bike added."
        self.loading = False
        await self.load_bikes()
        return rx.redirect("/bikes")

    async def submit_bike(self):
        """Helper: create a bike without handling files."""
        return await self.save_bike([])

    # ---------- Load all bikes (list page) ----------

    async def load_bikes(self):
        self.loading = True
        self.message = ""

        auth_state = await self.get_state(AuthState)
        token = auth_state.access_token
        if not token:
            self.loading = False
            return rx.redirect("/login")

        headers = {"Authorization": f"Bearer {token}"}
        async with httpx.AsyncClient(base_url=BACKEND_ORIGIN) as client:
            try:
                r = await client.get("/bikes", headers=headers)
            except Exception as e:
                self.loading = False
                self.message = f"Error contacting backend: {e}"
                return

        self.loading = False

        if 200 <= r.status_code < 300:
            data = r.json() or []

            # For each bike, ensure hero_url is present if backend only gave hero_media_id
            for b in data:
                hero_id = b.get("hero_media_id")
                if hero_id and not b.get("hero_url"):
                    b["hero_url"] = f"{BACKEND_ORIGIN}/media/{hero_id}"

            self.bikes = data
            self.has_bikes = len(data) > 0
        else:
            try:
                detail = r.json().get("detail")
            except Exception:
                detail = None
            self.message = detail or f"Failed to load bikes (status {r.status_code})"
            self.bikes = []
            self.has_bikes = False

    # ---------- Load a single bike for the analyser ----------

    current_bike: dict = {}

    @rx.event
    async def load_one_bike(self):
        """Load one bike using bike_id from the dynamic route."""
        self.loading = True
        self.message = ""
        self.current_bike = {}

        # get bike_id from /bike-analyser/[bike_id]
        params = self.router.page.params or {}
        bike_id = params.get("bike_id")
        if isinstance(bike_id, list):
            bike_id = bike_id[0]

        if not bike_id:
            self.loading = False
            self.message = "No bike_id in route params."
            return

        auth = await self.get_state(AuthState)
        token = auth.access_token
        if not token:
            self.loading = False
            self.message = "Missing access token in load_one_bike."
            return rx.redirect("/login")

        headers = {"Authorization": f"Bearer {token}"}

        try:
            async with httpx.AsyncClient(base_url=BACKEND_ORIGIN) as client:
                r = await client.get(f"/bikes/{bike_id}", headers=headers)
        except Exception as e:
            self.loading = False
            self.message = f"Error contacting backend in load_one_bike: {e}"
            self.current_bike = {}
            return

        self.loading = False

        # Try to parse JSON for debugging even on error
        try:
            data = r.json()
        except Exception:
            data = None

        if r.status_code == 200 and isinstance(data, dict):
            # If backend only returns hero_media_id, synthesize hero_url here too.
            hero_id = data.get("hero_media_id")
            if hero_id and not data.get("hero_url"):
                data["hero_url"] = f"{BACKEND_ORIGIN}/media/{hero_id}"
            self.current_bike = data

            # Optional: keep a human-readable message too
            self.message = f"Loaded bike {data.get('id')} (hero_url={data.get('hero_url')!r})"
        else:
            detail = None
            if isinstance(data, dict):
                detail = data.get("detail")
            self.message = (
                detail
                or f"Failed to load bike {bike_id!r} (status {r.status_code})"
            )
            self.current_bike = {}