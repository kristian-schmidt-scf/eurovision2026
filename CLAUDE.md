# Eurovision 2026 Scorecard — CLAUDE.md

## What This Is

A single-file React component (`eurovision2026.jsx`) — a personal scorecard for Eurovision 2026 (Vienna, 16 May 2026, 70th edition). Users rate all 35 entries on a 0.5–10 scale and explore results via four views: rate grid, tier list, ranking, and interactive D3 map.

---

## Stack

- **Framework**: React (hooks only — `useState`, `useEffect`, `useRef`)
- **Visualization**: D3 (map projection + SVG rendering)
- **Map data**: `world-atlas@2` and `topojson-client@3` loaded at runtime from jsDelivr CDN
- **Flags**: `flagcdn.com/w80/{id}.png` (ISO 3166-1 alpha-2 codes)
- **Fonts**: Cinzel (serif, headings/tier labels), IBM Plex Mono (monospace, data/scores) — Google Fonts

No build-time dependencies beyond React and D3. TopoJSON is dynamically injected into `<head>` on first map render.

---

## File Structure

```
eurovision2026.jsx   # Everything — data, components, root export
```

Single-file, no router, no external state management, no CSS files.

---

## Key Data Structures

### `ENTRIES` (line 6)
Array of 35 objects: `{ id, country, artist, song }`. `id` is ISO 3166-1 alpha-2 (e.g. `'de'`, `'gb'`).

### `TIERS` (line 44)
Five tiers derived from numeric score:
| Tier | Min score | Color |
|------|-----------|-------|
| S    | 9         | Gold  |
| A    | 7         | Pink  |
| B    | 5         | Blue  |
| C    | 3         | Green |
| D    | 0.5       | Orange|

### `ISO_NUMERIC` (line 52)
Maps alpha-2 → numeric ID used in world-atlas GeoJSON features, enabling map country lookup.

### `INLAY_IDS` (line 69)
`Set(['au', 'am', 'az', 'ge', 'il'])` — non-European entries shown in a separate inlay card on the map rather than rendered in the SVG projection.

---

## Components

| Component      | Purpose |
|----------------|---------|
| `Flag`         | Renders `flagcdn.com` image with fallback to country code text |
| `ScoreBtn`     | Individual score button (whole or half); styled by tier |
| `RateView`     | Grid of all 35 entries with score buttons |
| `TierView`     | Tier rows with entries sorted by score within each tier |
| `RankingView`  | Sorted list with medal styling for top 3 |
| `MapView`      | D3 Mercator map; countries colored by tier; hover tooltip; inlay panel |
| `InlayCard`    | Card for a non-European entry shown in the map inlay |
| `Eurovision2026` | Root — owns `ratings` and `view` state, renders header + tabs + active view |

---

## State

All state lives in the root `Eurovision2026` component:

- `ratings`: `{ [countryId]: number | undefined }` — scores 0.5–10 in half-step increments. Toggling an already-active score removes it.
- `view`: `'rate' | 'tiers' | 'ranking' | 'map'`

**No persistence** — ratings reset on page reload. Adding `localStorage` sync to the `ratings` state is the natural next feature.

---

## Scoring

- Range: 0.5 – 10 in steps of 0.5 (20 possible values)
- `WHOLE = [1..10]` and `HALVES = [0.5, 1.5, ..., 9.5]` rendered as two rows of buttons
- Half-scores displayed as `½`, `1½`, `2½`, etc. via `scoreLabel()`
- `getTier(rating)` walks `TIERS` by `min` descending; returns `null` if unrated

---

## Map Implementation Notes

- Projection: `d3.geoMercator` centered on `[17, 52]` (central Europe), scale 700
- Country paths drawn once on `status === 'ready'`; fill/stroke updated separately on every `ratings` change
- `ratingsRef` keeps a live reference so mouseover handlers don't close over stale state
- Countries not in `ENTRIES` get a dark default fill; participating-but-unrated countries get `#1A1A2C`

---

## Conventions

- All styling is inline (`style={{}}`); no CSS classes or external stylesheets except the Google Fonts `@import` in the `<style>` tag inside the component
- Dark theme throughout — background `#08080F`, accent colors per tier
- `fontFamily` is always explicit on every element (never relies on inherited default)
