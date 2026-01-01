<!-- AI_AGENT_CONTEXT: read this first -->

# Context (for Codex)
- This file is authoritative for goals + constraints in this directory.
- Do not change data schemas without updating the matching context file.
- Prefer explicit, testable code. Avoid hidden state.
- Ask before large refactors.

# TrigPoint Frontend — Context

This directory contains the TrigPoint frontend application.

## Technology Stack

- Reflex (Python → React)
- JavaScript where needed (custom interactions)
- Plotly / canvas / SVG for visualisation
- Auth via backend cookies / tokens

## Responsibilities

The frontend is responsible for:
- User interaction and flow
- Geometry input (image + points)
- Triggering solver runs
- Rendering plots and animations
- Helping users interpret results

The frontend is **not** responsible for:
- Solver math
- Geometry validation beyond basic sanity checks
- Persisting authoritative physics state

## UI Philosophy

- Engineering tool, not a toy
- Visual clarity over decoration
- Show axes, units, reference lines
- Prefer fewer controls with clear meaning

## Interaction Model

Typical flow:
1. User uploads or selects a bike image
2. User places or adjusts pivot points
3. Geometry is previewed visually
4. Solver is triggered
5. Results are visualised and explained

## Visualisation Priorities

High priority:
- Axle path (relative to BB / ground)
- Leverage ratio vs travel
- Shock stroke usage
- Key geometry milestones
- Anti-squat / anti-rise
- Wheel forces assuming coil and air shocks

Later:
- Terrain input response

## State Management

- Reflex state should be:
  - Explicit
  - Small
  - Serializable where possible
- Avoid hidden coupling between components
- Backend is the source of truth for solved data

## UX Goals

- Make “what does this curve mean on trail?” obvious
- Support comparison between bikes/setups
- Encourage exploration without invalid states

When unsure:
- Prefer showing *less* but more correct information