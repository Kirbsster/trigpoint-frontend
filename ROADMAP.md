# TrigPoint — Project TODO Summary

## 🔐 Authentication & UX
- [ ] Improve protected-page loading so no previous page flashes.
- [ ] Add a clean, global redirect-after-login flow.
- [ ] Create a unified "Loading…" overlay or skeleton loader.
- [ ] Decide whether to keep JWT-in-localstorage or revisit cookies later.

## 🚴‍♂️ Bikes & Geometry System
### Core Bike Model
- [ ] Move toward the new JSON structure:
  - `variants` (size + geometry mode)
  - `geometry` with full table (reach, chainstay, stack, etc.)
  - `pivots` under variants
  - `calibration.dimension` (e.g. chainstay length)
  - `images.hero` (single source of truth)
  - `components` list
  - `solver_cache`

### User Inputs / Image Workflow
- [ ] Implement single-image upload per bike.
- [ ] Implement pivot placement UI.
- [ ] Implement calibration workflow (choose geometry dimension).
- [ ] Allow user to override geometry values when missing.
- [ ] Auto-populate chainstay length from catalogue when possible.

### Variants
- [ ] Support multiple size variants per bike.
- [ ] Support geometry-mode variants (flip-chip, high/low, etc.).
- [ ] Allow user to select variant before entering analyser.

## 🖼️ Bike Analyser Page
- [ ] Replace existing pointer tracking with full mouse + touch + drag support.
- [ ] Add zoom (pinch + scroll).
- [ ] Add pan/drag.
- [ ] Add marker placement (for pivots).
- [ ] Add toggle to show geometry table below image.
- [ ] Integrate solver results (axle path, leverage ratio, etc.).

## 🗂️ Sheds / Collections
- [ ] Create Shed model on backend.
- [ ] Build Shed CRUD API (list, create, rename, delete).
- [ ] Frontend UI for:
  - [ ] Viewing sheds
  - [ ] Creating a shed
  - [ ] Adding/removing bikes from sheds
- [ ] Featured shed (curated)
- [ ] Allow brand-created sheds (future)

## 🧩 Data Architecture
### Storage
- [ ] Finalise bucket layout: `users/{user}/bikes/{bike}/hero.webp`.
- [ ] Consider storing image metadata in the bike doc (not separate collection).

### User Settings
- [ ] Create `user_settings` collection:
  - Default variant per bike
  - Default calibration dimension
  - View preferences (units, theme, etc.)

### Catalog
- [ ] Build global catalogue of:
  - Manufacturers
  - Models
  - Geometry tables (by size)
  - Chainstay lengths (per size)
  - Wheel sizes
  - Shock stroke lengths
- [ ] Allow community contribution (future).

## 🔧 Backend Refinements
- [ ] Merge media router into bikes router for simplicity.
- [ ] Ensure signed URL generation is stable & cached if necessary.
- [ ] Add endpoint for returning a bike + selected variant + geometry.
- [ ] Add endpoint for posting user-placed pivots.

## 🎨 UI / Layout Cleanup
- [ ] Simplify navbar & template layout.
- [ ] Create a global `<BikeCard>` component.
- [ ] Create a `<PageHeader>` reusable component.
- [ ] Introduce dedicated theme variables for spacing/sizing.
- [ ] Improve layout on mobile/tablet.

## ⚙️ Dev Workflow
- [ ] Add end-to-end tests for login → create bike → upload image.
- [ ] Add local backend mock for faster frontend iteration.
- [ ] Write up full project README (backend + frontend).
- [ ] Add code comments & diagrams for complex flows.