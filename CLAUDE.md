# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev`: Astro dev server
- `npm run build`: static build to `dist/`
- `npm run preview`: serve the built `dist/`. In Astro 7 this runs as a background daemon; stop it with `npx astro preview stop`.

There is no test suite or linter. Netlify builds the site using `netlify.toml`.

## Architecture

"Bluegrass Bass" plays a root–fifth bluegrass bass line over a song's chord progression in any of 12 keys. It uses the same stack as the sibling `greenwold` repo: Astro 7, React 19 components embedded in Astro pages, and Tailwind 4 through `@tailwindcss/vite`, with theme colors defined in `src/styles/global.css`.

- `src/layouts/Layout.astro`: the HTML shell, including the GoatCounter analytics script.
- `src/pages/index.astro`: the only page. It renders the app component with `client:load`.
- `src/components/BluegrassBass.jsx`: the whole app, meaning the UI plus the Web Audio playback engine.
- `src/lib/music.js`: song and music-theory data.

### Music data (`src/lib/music.js`)

- `songs`: each song has a `pattern` (an ordered list of section names, e.g. `['A', 'A', 'B', 'B']`) and one array per section. Each array entry is a **scale degree (1–7) for one beat**, so a chord held for a bar of 2/4 is written `1, 1`. Playback loops through the pattern forever.
- `scales`: each key's scale is **mixolydian** (flat 7th), so degree `7` gives the bVII chord (e.g. Bb in C).
- `rootFifthMap`: spelled note → its fifth.
- `noteMap`: spelled note (including enharmonics like `Gb`, `E#`, `F##`) → sample name. The samples are one octave of mp3s in `public/`, fetched from `/${name}.mp3`. F#/Gb is stored as `Fsh.mp3`.
- Adding a key means adding entries to `scales`, `rootFifthMap` and `noteMap`. Every spelling the new scale uses must also be a key in `rootFifthMap` and `noteMap`.

### Playback engine

- Uses the Web Audio API. `loadSound` creates the `AudioContext` and decodes every sample once. It must first run from a user gesture: the "enable sound" overlay, Start, or Space.
- Notes are scheduled ahead on the `AudioContext` clock. A `requestAnimationFrame` loop (`checkTimeAndSchedule`) schedules the next beat once half a beat has passed since the last scheduled note.
- Bass pattern: on a chord change it plays the root. When the chord repeats, it alternates root and fifth (`playRootRef`).
- The optional count-in schedules 4 `click` samples before the first note.
- Stopping calls `stop()` on every source still in `activeSourcesRef`, which also cancels notes scheduled for the future. It then bumps `loopIdRef`. Each scheduling loop carries the `loopId` it started with and exits once that no longer matches, so a quick stop/start can't leave two loops running.

### State pattern

UI settings (key, song, tempo, count-in) live in React state for rendering and are mirrored into refs by their setters. The scheduling loop reads only refs, so it always sees current values, never values captured in an old closure.
