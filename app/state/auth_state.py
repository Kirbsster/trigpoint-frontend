import os
from typing import Optional
import asyncio

import httpx
import reflex as rx

from app.state.page_state import PageState

# Talk directly to the FastAPI backend.
# With the attached backend (Reflex running FastAPI on 8000),
# this should point to :8000 by default.
BACKEND_ORIGIN = os.getenv("BACKEND_ORIGIN", "http://127.0.0.1:9000")
print("AuthState BACKEND_ORIGIN at startup:", BACKEND_ORIGIN)
AUTH_PREFIX = "/auth"   # backend routes live under /auth/*


class AuthState(rx.State):
    """Frontend-side auth state for Reflex, using JWTs via Authorization header.

    Uses backend JWT endpoints:
      POST /auth/login          -> TokenPair (access + refresh)
      POST /auth/register       -> register user
      GET  /auth/verify-email   -> verify email via ?token=...
      GET  /auth/users/me       -> current user (requires Authorization header)
      POST /auth/forgot-password
      POST /auth/reset-password
    """

    # form fields
    email: str = ""
    password: str = ""
    password2: str = ""
    remember_me: bool = False

    # ui state
    message: str = ""
    loading: bool = False

    # current user state
    me_email: Optional[str] = None
    me_role: Optional[str] = None
    is_verified: Optional[bool] = None
    verify_success: bool = False
    just_verified: bool = False

    # tokens (we mainly use access_token)
    access_token: Optional[str] = rx.LocalStorage(sync=True)
    refresh_token: Optional[str] = None

    # forgot / reset fields
    reset_token: Optional[str] = None
    new_password: Optional[str] = None
    new_password2: Optional[str] = None

    # ---------- HTTP helper ----------

    async def _fetch_json(
        self,
        method: str,
        path: str,
        json: dict | None = None,
        query: dict | None = None,
        auth_required: bool = False,
    ):
        """Call backend /auth/* endpoints and parse JSON.

        path: like "/login", "/register", "/verify-email", "/users/me"
        """
        headers: dict[str, str] = {}
        if auth_required and self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"

        timeout = httpx.Timeout(
            connect=10.,
            read=10.,
            write=10.,
            pool=10.,
        )

        async with httpx.AsyncClient(
            base_url=BACKEND_ORIGIN,
            follow_redirects=True,
            timeout=timeout,
        ) as client:
            url = f"{AUTH_PREFIX}{path}"  # e.g. "/auth/register"
            try:
                if method.upper() == "GET":
                    r = await client.get(url, params=query, headers=headers)
                else:
                    r = await client.request(
                        method.upper(),
                        url,
                        json=json,
                        params=query,
                        headers=headers,
                    )
            except httpx.ReadTimeout:
                # unified shape: looks like a "response" with status 0
                return 0, {"detail": "Backend timeout – please try again."}
            except httpx.HTTPError as e:
                return 0, {"detail": f"Error contacting backend: {e}"}

        try:
            data = r.json()
        except Exception:
            data = None
        return r.status_code, data

    def reset_form(self):
        """Clear login/register form fields."""
        self.email = ""
        self.password = ""
        self.password2 = ""
        self.remember_me = False
        self.message = ""

    # ---------- Auth flows ----------
    async def login(self):
        """Login via backend /auth/login (JWT TokenPair)."""
        page = await self.get_state(PageState)

        # Turn on loader while we talk to the backend.
        page.loading_message = "Signing you in…"
        page.loading = True

        self.loading = True
        self.message = ""
        payload = {"email": self.email, "password": self.password}

        code, data = await self._fetch_json("POST", "/login", json=payload)

        self.loading = False

        if 200 <= code < 300 and isinstance(data, dict):
            # Tokens
            self.access_token = data.get("access_token")
            self.refresh_token = data.get("refresh_token")
            self.just_verified = False

            # Fetch /users/me
            await self.refresh_me()

            # Optional: clear form
            # self.reset_form()

            # STOP loader here, then redirect
            page.loading = False
            return rx.redirect("/")
        else:
            # On error, also stop loader so user sees the form + message
            page.loading = False

            detail = (data or {}).get("detail") if isinstance(data, dict) else None
            if isinstance(detail, str):
                self.message = f"Login failed: {detail}"
            else:
                self.message = f"Login failed (status {code})"

    async def logout(self):
        """Clear auth state and go back to login."""
        from app.state.page_state import PageState  # or keep at top

        page = await self.get_state(PageState)
        page.loading_message = "Logging you out…"
        page.loading = True

        # clear auth state
        self.access_token = ""   # LocalStorage-backed, this also clears stored value
        self.refresh_token = ""
        self.me_email = None
        self.me_role = None
        self.is_verified = None
        self.just_verified = False
        self.reset_form()

        # Use PageState.goto so you see loader while switching to /login
        return page.goto("/login", "Logging you out…")

    async def register(self):
        """Register via backend /auth/register and prompt for email verification."""
        self.loading = True
        self.message = ""
        if self.password != self.password2:
            self.loading = False
            self.message = "Passwords do not match."
            return

        payload = {"email": self.email, "password": self.password}
        code, data = await self._fetch_json("POST", "/register", json=payload)
        self.loading = False

        if 200 <= code < 300:
            dev_token = (data or {}).get("verify_token_dev_only") if isinstance(data, dict) else None
            if dev_token:
                self.message = (
                    "Registered. Check your email to verify your address. "
                    "(Dev: verification token returned in response.)"
                )
            else:
                self.message = "Registered. Check your email to verify your address."

            # Clear only passwords; keep email + message visible
            self.password = ""
            self.password2 = ""
            # self.email = ""  # optional if you want to clear it too
        else:
            detail = (data or {}).get("detail") if isinstance(data, dict) else None
            if isinstance(detail, str):
                self.message = f"Registration failed: {detail}"
            else:
                self.message = f"Registration failed (status {code})"


    async def verify_email(self, token: str):
        """Trigger backend /auth/verify-email?token=... endpoint."""
        self.loading = True
        self.message = ""
        self.verify_success = False
        self.just_verified = False

        code, data = await self._fetch_json(
            "GET",
            "/verify-email",
            query={"token": token},
        )
        self.loading = False

        if 200 <= code < 300:
            self.message = "Email verified. You can now log in."
            self.verify_success = True
            self.just_verified = True

            # If backend returns the email, store it so the login form can prefill
            if isinstance(data, dict):
                email = data.get("email")
                if isinstance(email, str) and email:
                    self.email = email

            # redirect straight to login
            return rx.redirect("/login")
        else:
            detail = (data or {}).get("detail") if isinstance(data, dict) else None
            if isinstance(detail, str):
                self.message = f"Verification failed: {detail}"
            else:
                self.message = f"Verification failed (status {code})"
            self.verify_success = False
            self.just_verified = False

    async def refresh_me(self):
        """Call /auth/users/me with Authorization header to get current user."""
        code, data = await self._fetch_json("GET", "/users/me", auth_required=True)

        if 200 <= code < 300 and isinstance(data, dict):
            self.me_email = data.get("email")
            self.me_role = data.get("role")
            self.is_verified = (
                data.get("is_active")
                or data.get("verified")
                or data.get("email_verified")
            )
        else:
            if code == 401:
                self.access_token = None
                self.refresh_token = None
            self.me_email = None
            self.me_role = None
            self.is_verified = None

    # async def ensure_auth_or_redirect(self):
    #     """Guard for protected pages using LocalStorage-backed access_token."""
    #     if not self.access_token:
    #         return rx.redirect("/login")

    #     await self.refresh_me()

    #     if not self.me_email:
    #         # token invalid / expired
    #         self.access_token = ""
    #         return rx.redirect("/login")
    
    @rx.event
    async def ensure_auth_or_redirect(self):
        """Guard for protected pages using the access_token.

        - While we're checking the session, `loading` is True.
        - If not logged in or token invalid, redirect to /login and
          make sure loading goes back to False.
        """
        # Start "checking session"
        self.loading = True

        # No token at all → straight to login
        if not self.access_token:
            self.loading = False
            return rx.redirect("/login")

        # Try to refresh /users/me with the current token
        await self.refresh_me()

        # If refresh failed (me_email not set), clear tokens & redirect
        if not self.me_email:
            self.access_token = ""
            self.refresh_token = None
            self.loading = False
            return rx.redirect("/login")

        # All good, user is authenticated
        self.loading = False


    # ---------- Forgot / reset password ----------

    async def forgot_password(self):
        """Request a password reset email via /auth/forgot-password."""
        self.loading = True
        self.message = ""

        payload = {"email": self.email}
        code, data = await self._fetch_json("POST", "/forgot-password", json=payload)
        self.loading = False

        if 200 <= code < 300:
            self.message = "If that email exists, a reset link has been sent."
        else:
            detail = (data or {}).get("detail") if isinstance(data, dict) else None
            if isinstance(detail, str):
                self.message = f"Reset request failed: {detail}"
            else:
                self.message = f"Reset request failed (status {code})"

    async def reset_password(self):
        """Submit new password to /auth/reset-password using self.reset_token."""
        self.loading = True
        self.message = ""

        if not self.reset_token:
            self.loading = False
            self.message = "Missing reset token."
            return

        if self.new_password != self.new_password2:
            self.loading = False
            self.message = "Passwords do not match."
            return

        payload = {"token": self.reset_token, "new_password": self.new_password}
        code, data = await self._fetch_json("POST", "/reset-password", json=payload)
        self.loading = False

        if 200 <= code < 300:
            self.message = "Password reset. Redirecting to login..."
            # Clear fields
            self.new_password = ""
            self.new_password2 = ""
            self.reset_token = ""
            await asyncio.sleep(1.5)
            return rx.redirect("/login")
        else:
            detail = (data or {}).get("detail") if isinstance(data, dict) else None
            if isinstance(detail, str):
                self.message = f"Reset failed: {detail}"
            else:
                self.message = f"Reset failed (status {code})"

    async def load_reset_token(self):
        """Read ?token=... from the URL and store it in reset_token."""
        params = self.router.page.params or {}
        token = params.get("token")

        # params values may be str or list; handle both.
        if isinstance(token, list):
            token = token[0] if token else None

        if token:
            self.reset_token = token
        else:
            self.message = "Missing reset token in URL."


    async def load_verify_token(self):
        """Read ?token=... from URL and call verify_email."""
        params = self.router.page.params or {}
        token = params.get("token")

        # token may be str or list[str]
        if isinstance(token, list):
            token = token[0] if token else None

        if token:
            await self.verify_email(token)
        else:
            self.message = "Missing verification token in URL."


    # async def verify_and_redirect(self):
    #     """Load token, verify it, then redirect after 2 seconds."""
    #     # Step 1: Verify normally
    #     await self.load_verify_token()

    #     # Step 2: If verification succeeded, redirect after 2s
    #     if self.message.startswith("Email verified"):
    #         return rx.redirect("/login")