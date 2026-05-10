# Eurovision 2026 Scorecard

A personal scorecard for the **Eurovision Song Contest 2026** — Vienna, 16 May, 70th edition.

Rate all 35 entries on a 1–10 scale (with 0.1 increments) and explore your picks through four views. Your ratings are automatically saved to your browser's localStorage.

---

## Features

**Rate All** — Score every entry using an adjustable slider (1.0–10.0). Cards light up in tier color as you rate. Ratings persist across page reloads.

**Tier List** — Classic tier-list layout. Entries sorted by score within each tier row.

**Ranking** — Full sorted leaderboard with gold/silver/bronze medal styling for the top 3.

**Map** — Interactive D3 map of Europe. Countries fill in their tier color as you rate them. Hover for song and score details. Non-European entries (Armenia, Australia, Azerbaijan, Georgia, Israel) appear in a separate inlay panel.

---

## Tier System

| Tier | Score range | Color  |
| ---- | ----------- | ------ |
| S    | 9.0 – 10.0  | Gold   |
| A    | 8.0 – 8.9   | Pink   |
| B    | 6.0 – 7.9   | Blue   |
| C    | 4.0 – 5.9   | Green  |
| D    | 2.0 – 3.9   | Orange |
| F    | 1.0 – 1.9   | Gray   |

---

## Entries (35 countries)

Albania, Armenia, Australia, Austria, Azerbaijan, Belgium, Bulgaria, Croatia, Cyprus, Czechia, Denmark, Estonia, Finland, France, Georgia, Germany, Greece, Israel, Italy, Latvia, Lithuania, Luxembourg, Malta, Moldova, Montenegro, Norway, Poland, Portugal, Romania, San Marino, Serbia, Sweden, Switzerland, Ukraine, United Kingdom.

---

## Usage

This is a single React component built with Vite. To run locally:

```bash
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser. To access from other devices on the same WiFi:

```bash
ipconfig
```

Find your local IP address and visit `http://<YOUR_IP>:5173` on any device.

---

## Dependencies

- **React** 18.2+
- **D3** 7.9+
- **Vite** (dev server)

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
```
