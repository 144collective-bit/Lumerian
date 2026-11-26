# Lumerian Orrery

A 3D, browser-based solar system that reports live astrological data.

```
npm install
npm run dev      # local development
npm run build    # production build in dist/
```

- Positions are computed in the browser with `astronomy-engine` (no API keys, no server).
- Signs are tropical and geocentric; correspondences follow the Golden Dawn.
- Ceres, Pallas, Juno, Vesta and Chiron are integrated numerically from seed orbital elements
  (`src/ephemeris.ts`), so they stay within a fraction of a degree across 1900-2100.
- Natal charts (`src/natal.ts`, `src/chart.ts`): Placidus or Whole Sign houses, transits, a 2D wheel
  and an overlay on the 3D zodiac ring. Charts are stored in the browser only. Birthplace lookup
  uses the Open-Meteo geocoding service.
- Lunar nodes and Black Moon Lilith are mean positions.
- Tarot cards are drawn in code. To show scanned cards instead, add images to `public/tarot/`
  named by slug: `major-00.jpg` … `major-21.jpg`, and `wands-02.jpg` … `wands-10.jpg`
  (likewise `cups-`, `swords-`, `pentacles-`).
- Planet surfaces are generated in code except Earth and Moon (`public/textures/`, from the three.js examples).
- Stars and constellation figures come from the d3-celestial catalogue (BSD-3, see `public/data/LICENSE-d3-celestial.txt`).
- Planetary hours use the viewer's location, which is kept in the browser only.
- Interface styles (Observatory, Alchemical, Neon, Mono) are sets of CSS tokens at the top of `src/style.css`;
  the list shown in the menu is `THEMES` in `src/main.ts`.
