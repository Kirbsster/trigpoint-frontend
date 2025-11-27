# app/state/bike_state.py  (or frontend/state/bike_state.py)
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
    loading: bool = False
    bikes: List[Dict] = []
    has_bikes: bool = False

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
            # same error handling style as before
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
        if files:
            self.message = "Bike and hero image added."
        else:
            self.message = "Bike added."

        self.loading = False
        await self.load_bikes()
        return rx.redirect("/bikes")

    async def submit_bike(self):
        """Helper: create a bike without handling files."""
        return await self.save_bike([])

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

            # 🔥 FOR EACH BIKE → ensure hero_url is present
            for b in data:
                hero_id = b.get("hero_media_id")
                if hero_id and not b.get("hero_url"):
                    b["hero_url"] = f"{BACKEND_ORIGIN}/media/{hero_id}"

            # 🔥 Store all bikes
            self.bikes = data
            self.has_bikes = len(data) > 0
        else:
            try:
                detail = r.json().get("detail")
            except:
                detail = None
            self.message = detail or f"Failed to load bikes (status {r.status_code})"
            self.bikes = []
            self.has_bikes = False#

    current_bike: dict = {}

    @rx.event
    async def load_one_bike(self):
        """Load one bike using bike_id from URL."""
        params = self.router.page.params or {}
        bike_id = params.get("bike_id")
        if isinstance(bike_id, list):
            bike_id = bike_id[0]

        if not bike_id:
            self.current_bike = {}
            return

        auth = await self.get_state(AuthState)
        token = auth.access_token
        if not token:
            return rx.redirect("/login")

        async with httpx.AsyncClient(base_url=BACKEND_ORIGIN) as client:
            try:
                r = await client.get(f"/bikes/{bike_id}",
                                     headers={"Authorization": f"Bearer {token}"})
            except Exception:
                self.current_bike = {}
                return

        if r.status_code == 200:
            self.current_bike = r.json()
        else:
            self.current_bike = {}