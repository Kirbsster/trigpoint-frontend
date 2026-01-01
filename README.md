# TrigPoint Frontend

Reflex-based frontend for **TrigPoint** — a modern platform for comparing mountain bikes in user specified collections (called “Sheds”), analysing geometry, visualising suspension kinematics and outputting engineering plots/data.
The frontend communicates with a FastAPI backend deployed on Google Cloud Run, using MongoDB Atlas for data and Google Cloud Storage (GCS) for bike hero images.

---

## Overview

TrigPoint provides:

- A personal “Bike Shed”: collections of bikes the user owns or compares.
- Each bike includes:
  - Hero image stored in GCS.
  - Geometry fields (reach, chainstay, wheel sizes, pivot locations, etc.).
  - Future: multiple variants (sizes, geometry modes).
- A Bike Analyser page featuring:
  - Full-screen hero image.
  - Touch/drag and pointer tracking.
  - Future: pinch-zoom, landmark placement, and kinematic solver UI.

This repository contains only the Reflex UI.

---

## Architecture

### Frontend (this repo)

Uses Reflex (Python → React) with state-based design:

- **AuthState** — login, logout, JWT storage, user fetch.
- **BikeState** — create bikes, list bikes, upload hero image, load single bike.
- **ShedState** — bike collections (WIP).
- **PageState** — global navigation and loading overlay.

### Pages

- `/login`, `/register`, `/forgot`, `/reset`
- `/bikes`,
- `/bike_analyser/[bike_id]`
- `/sheds`
- `/` (home / featured)

### Shared Components

- `navbar`  
- `app_template`  
- `protected_page` (auth gating)  
- `page_loading` (global loading overlay)  
- `loading_screen`
- `new_bike_modal` (overlay to define new bike + hero image)
- `kinematics_panel` (output kinematics results)

---

## Backend (FastAPI on Cloud Run)

(Not inside this repo, but required for functionality)

- JWT auth under `/auth/*`
- Bikes stored in `bikes` collection
- Hero images stored in GCS and tracked in `media_items` collection
- Media served via:
  - **Signed URLs** (primary)
  - OR secure fallback route `/media/{media_id}`

---

### GCS File Layout
- uses GCS for blob storage 

---

## Authentication Flow

1. User logs in → backend returns JWT.
2. JWT stored in `AuthState.access_token` (LocalStorage).
3. Cookie based auth not used at the moment as flow didn't work with FASTAPI backend 
4. Protected pages use:

   ```python
   on_load=[AuthState.ensure_auth_or_redirect, ...]


---
## template
app_template(page_loading(protected_page(body)))

---
### folder structure
app/
  components/
    navbar.py
    template.py
    protected.py
    page_loading.py
    loading.py
  pages/
    index.py
    login.py
    register.py
    forgot.py
    reset.py
    bikes.py
    bike_new.py
    bike_analyser.py
    sheds.py
  state/
    auth_state.py
    bike_state.py
    shed_state.py
    mouse_state.py
    page_state.py
  assets/
    theme.css
    icons/
    images/
    js/
      bike_viewer/
        api.js
        core.js
        dom.js
        draw.js
        index.js
        viewer.js
        ui_buttons.js
        theme.js
        events_keyboards.js -- NOT IMPLEMENTED YET --
        events_pointer.js -- NOT IMPLEMENTED YET --
  frontend.py

assets/
  theme.css
  images/logo.png

requirements.txt
rxconfig.py

---