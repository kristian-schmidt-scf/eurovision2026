# Eurovision 2026 Scorecard

A personal scorecard for the **Eurovision Song Contest 2026** — Vienna, 16 May, 70th edition.

Rate all 35 entries on a 0.5–10 scale and explore your picks through four views.

---

## Features

**Rate All** — Score every entry with whole or half-point buttons (0.5–10). Cards light up in tier color as you rate.

**Tier List** — Classic tier-list layout. Entries sorted by score within each tier row.

**Ranking** — Full sorted leaderboard with gold/silver/bronze medal styling for the top 3.

**Map** — Interactive D3 map of Europe. Countries fill in their tier color as you rate them. Hover for song and score details. Non-European entries (Armenia, Australia, Azerbaijan, Georgia, Israel) appear in a separate inlay panel.

---

## Tier System

| Tier | Score range | Color  |
|------|-------------|--------|
| S    | 9 – 10      | Gold   |
| A    | 7 – 8.5     | Pink   |
| B    | 5 – 6.5     | Blue   |
| C    | 3 – 4.5     | Green  |
| D    | 0.5 – 2.5   | Orange |

---

## Entries (35 countries)

Albania, Armenia, Australia, Austria, Azerbaijan, Belgium, Bulgaria, Croatia, Cyprus, Czechia, Denmark, Estonia, Finland, France, Georgia, Germany, Greece, Israel, Italy, Latvia, Lithuania, Luxembourg, Malta, Moldova, Montenegro, Norway, Poland, Portugal, Romania, San Marino, Serbia, Sweden, Switzerland, Ukraine, United Kingdom.

---

## Usage

This is a single React component. Drop it into any React project that has D3 installed:

```bash
npm install d3
```

Then import and render the default export:

```jsx
import Eurovision2026 from './eurovision2026';

export default function App() {
  return <Eurovision2026 />;
}
```

The component loads TopoJSON and world map data from CDN at runtime — no extra setup needed. Flags are fetched from [flagcdn.com](https://flagcdn.com).

> **Note:** Ratings are in-memory only and reset on page reload. Wiring up `localStorage` is the natural next step if you want persistence.

---

## Stack

- React (hooks)
- D3 (map projection and SVG)
- [world-atlas](https://github.com/topojson/world-atlas) + [topojson-client](https://github.com/topojson/topojson-client) (loaded from CDN)
- [flagcdn.com](https://flagcdn.com) for flag images
- [Cinzel](https://fonts.google.com/specimen/Cinzel) + [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) from Google Fonts
