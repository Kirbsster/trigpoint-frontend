# app/state/bike_state.py
# app/state/bike_state.py
import base64
import os
import httpx
import reflex as rx
from typing import List, Dict

from app.state.auth_state import AuthState
from app.state.page_state import PageState

BACKEND_ORIGIN = os.getenv("BACKEND_ORIGIN", "http://127.0.0.1:9000")


class BikeState(rx.State):
    name: str = ""
    brand: str = ""
    model_year: str = ""
    message: str = ""
    loading: bool = False

    bikes: List[Dict] = []
    has_bikes: bool = False
    current_bike: dict = {}

    # ---- hero preview + cached upload payload ----
    hero_preview_src: str = ""
    hero_preview_error: str = ""
    hero_upload_b64: str = ""          # raw bytes as base64 (NO data-url prefix)
    hero_upload_filename: str = ""
    hero_upload_content_type: str = ""

    @rx.event
    async def set_hero_preview(self, files: list[rx.UploadFile]):
        """Read file once; build preview AND cache bytes for Save."""
        self.hero_preview_error = ""
        self.hero_preview_src = ""
        self.hero_upload_b64 = ""
        self.hero_upload_filename = ""
        self.hero_upload_content_type = ""

        if not files:
            return

        f0 = files[0]
        try:
            content = await f0.read()
            if not content:
                self.hero_preview_error = "No file content received."
                return

            if len(content) > 5_000_000:
                self.hero_preview_error = "Image too large to preview (max 5MB)."
                return

            filename = f0.filename or "image"
            content_type = f0.content_type or "application/octet-stream"

            b64 = base64.b64encode(content).decode("utf-8")

            # cache for saving (so we don't re-read the file later)
            self.hero_upload_b64 = b64
            self.hero_upload_filename = filename
            self.hero_upload_content_type = content_type

            # data-url for preview
            self.hero_preview_src = f"data:{content_type};base64,{b64}"

        except Exception as e:
            self.hero_preview_error = f"Preview failed: {e}"

    @rx.event
    def clear_hero_preview(self):
        self.hero_preview_src = ""
        self.hero_preview_error = ""
        self.hero_upload_b64 = ""
        self.hero_upload_filename = ""
        self.hero_upload_content_type = ""

    @rx.event
    def reset_new_bike_form(self):
        self.name = ""
        self.brand = ""
        self.model_year = ""
        self.message = ""
        self.loading = False
        self.clear_hero_preview()

    @rx.event
    async def save_bike(self, files: list[rx.UploadFile]):
        """Create bike, then upload hero image (prefer cached bytes), redirect."""
        self.loading = True
        self.message = ""

        auth_state = await self.get_state(AuthState)
        token = auth_state.access_token
        if not token:
            self.loading = False
            self.message = "You must be logged in to add a bike."
            return rx.redirect("/login")

        headers = {"Authorization": f"Bearer {token}"}
        payload = {"name": self.name, "brand": self.brand}

        if self.model_year.strip():
            try:
                payload["model_year"] = int(self.model_year.strip())
            except ValueError:
                self.loading = False
                self.message = "Model year must be a number."
                return

        # 1) Create bike
        try:
            async with httpx.AsyncClient(base_url=BACKEND_ORIGIN, timeout=20.0) as client:
                r = await client.post("/bikes", json=payload, headers=headers)
        except Exception as e:
            self.loading = False
            self.message = f"Error contacting backend: {e}"
            return

        if not (200 <= r.status_code < 300):
            try:
                detail = (r.json() or {}).get("detail")
            except Exception:
                detail = None
            self.loading = False
            self.message = detail or f"Failed to add bike (status {r.status_code})"
            return

        bike_data = r.json() or {}
        bike_id = bike_data.get("id")
        if not bike_id:
            self.loading = False
            self.message = "Bike created but response had no id."
            return

        # 2) Optional hero upload
        # Prefer cached bytes from preview (prevents “empty file on save”).
        should_upload = bool(self.hero_upload_b64) or bool(files)

        if should_upload:
            try:
                if self.hero_upload_b64:
                    content = base64.b64decode(self.hero_upload_b64.encode("utf-8"))
                    filename = self.hero_upload_filename or "image"
                    content_type = self.hero_upload_content_type or "application/octet-stream"
                else:
                    # fallback: no preview was generated, use file directly
                    f0 = files[0]
                    content = await f0.read()
                    filename = f0.filename or "image"
                    content_type = f0.content_type or "application/octet-stream"

                async with httpx.AsyncClient(base_url=BACKEND_ORIGIN, timeout=60.0) as client:
                    resp = await client.post(
                        f"/bikes/{bike_id}/media/hero",
                        headers=headers,
                        files={"file": (filename, content, content_type)},
                    )

                if not (200 <= resp.status_code < 300):
                    self.message = f"Bike added, but hero image upload failed (status {resp.status_code})."
                else:
                    warning = None
                    try:
                        warning = (resp.json() or {}).get("warning")
                    except Exception:
                        warning = None
                    if warning:
                        self.message = f"Bike added. {warning}"
                    else:
                        self.message = "Bike and hero image added."

            except Exception as e:
                self.message = f"Bike added, but image upload failed: {e}"
        else:
            self.message = "Bike added."

        self.loading = False

        # optional refresh list
        try:
            await self.load_bikes()
        except Exception:
            pass

        # clean up form so next open is fresh
        self.reset_new_bike_form()
        return await self.goto_bike(bike_id)
        # return rx.redirect(f"/bike_analyser/{bike_id}")

    @rx.event
    async def submit_bike(self):
        return await self.save_bike([])

    # ----------------------------
    # Bikes list
    # ----------------------------
    @rx.event
    async def load_bikes(self):
        self.loading = True
        self.message = ""

        auth_state = await self.get_state(AuthState)
        token = auth_state.access_token
        if not token:
            self.loading = False
            return rx.redirect("/login")

        headers = {"Authorization": f"Bearer {token}"}

        try:
            async with httpx.AsyncClient(base_url=BACKEND_ORIGIN, timeout=20.0) as client:
                r = await client.get("/bikes", headers=headers)
        except Exception as e:
            self.loading = False
            self.message = f"Error contacting backend: {e}"
            return

        self.loading = False

        if 200 <= r.status_code < 300:
            data = r.json() or []
            for b in data:
                hero_id = b.get("hero_media_id")
                if hero_id and not b.get("hero_url"):
                    b["hero_url"] = f"{BACKEND_ORIGIN}/media/{hero_id}"
                if b.get("hero_url") and not b.get("hero_thumb_url"):
                    b["hero_thumb_url"] = b["hero_url"]
            self.bikes = data
            self.has_bikes = len(data) > 0
        else:
            try:
                detail = (r.json() or {}).get("detail")
            except Exception:
                detail = None
            self.message = detail or f"Failed to load bikes (status {r.status_code})"
            self.bikes = []
            self.has_bikes = False

    # ----------------------------
    # Single bike (analyser)
    # ----------------------------
    @rx.event
    async def load_one_bike(self):
        self.loading = True
        self.message = ""
        self.current_bike = {}

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
            return rx.redirect("/login")

        headers = {"Authorization": f"Bearer {token}"}

        try:
            async with httpx.AsyncClient(base_url=BACKEND_ORIGIN, timeout=20.0) as client:
                r = await client.get(f"/bikes/{bike_id}", headers=headers)
        except Exception as e:
            self.loading = False
            self.message = f"Error contacting backend in load_one_bike: {e}"
            return

        self.loading = False
        data = None
        try:
            data = r.json()
        except Exception:
            pass

        if r.status_code == 200 and isinstance(data, dict):
            hero_id = data.get("hero_media_id")
            if hero_id and not data.get("hero_url"):
                data["hero_url"] = f"{BACKEND_ORIGIN}/media/{hero_id}"
            if data.get("hero_url") and not data.get("hero_thumb_url"):
                data["hero_thumb_url"] = data["hero_url"]
            self.current_bike = data
        else:
            detail = data.get("detail") if isinstance(data, dict) else None
            self.message = detail or f"Failed to load bike (status {r.status_code})"
            self.current_bike = {}

    # ----------------------------
    # Navigation helpers
    # ----------------------------
    @rx.event
    async def goto_bikes(self):
        page = await self.get_state(PageState)
        page.loading = True
        page.loading_message = "Loading your bikes..."
        self.message = ""
        return rx.redirect("/bikes")

    @rx.event
    async def goto_bike(self, bike_id: str):
        page = await self.get_state(PageState)
        page.loading = True
        page.loading_message = "Loading bike..."
        self.current_bike = {}
        self.message = ""
        return rx.redirect(f"/bike_analyser/{bike_id}")

    # ----------------------------
    # Delete bike
    # ----------------------------
    @rx.event
    async def delete_bike(self, bike_id: str):
        self.message = ""

        auth_state = await self.get_state(AuthState)
        token = auth_state.access_token
        if not token:
            self.message = "Missing access token."
            return rx.redirect("/login")

        headers = {"Authorization": f"Bearer {token}"}

        try:
            async with httpx.AsyncClient(base_url=BACKEND_ORIGIN, timeout=20.0) as client:
                r = await client.delete(f"/bikes/{bike_id}", headers=headers)
        except Exception as e:
            self.message = f"Delete failed: {e}"
            return

        if r.status_code != 204:
            self.message = f"Delete failed ({r.status_code}): {r.text}"
            return

        await self.load_bikes()
        self.message = "Bike deleted."

    # ----------------------------
    # Viewer init (unchanged)
    # ----------------------------
    def init_viewer_js(self):
        if not self.current_bike:
            return
        initial_data = {
            "points": self.current_bike.get("points", {}),
            "links": self.current_bike.get("links", []),
        }
        return rx.call_script(
            f"window.initBikePointsViewer('bike-viewer-container', {json.dumps(initial_data)});"
        )
