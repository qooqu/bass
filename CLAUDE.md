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
- `src/components/BluegrassBass.jsx`: the UI.
- `src/lib/player.js`: the Web Audio playback engine, written as plain JavaScript with no React.
- `src/lib/music.js`: song and music-theory data.

### Music data (`src/lib/music.js`)

- `songs`: each song has a `pattern` (an ordered list of section names, e.g. `['A', 'A', 'B', 'B']`) and one array per section. Each array entry is a **scale degree (1–7) for one beat**, so a chord held for a bar of 2/4 is written `1, 1`. Playback loops through the pattern forever.
- `scales`: each key's scale is **mixolydian** (flat 7th), so degree `7` gives the bVII chord (e.g. Bb in C).
- `rootFifthMap`: spelled note → its fifth.
- `noteMap`: spelled note (including enharmonics like `Gb`, `E#`, `F##`) → sample name. The samples are one octave of mp3s in `public/`, fetched from `/${name}.mp3`. F#/Gb is stored as `Fsh.mp3`.
- Adding a key means adding entries to `scales`, `rootFifthMap` and `noteMap`. Every spelling the new scale uses must also be a key in `rootFifthMap` and `noteMap`.

### Playback engine (`src/lib/player.js`)

- `createPlayer({ onChord })` returns `{ settings, loadSound, start, stop, toggle }`. The component makes one with `useState(() => createPlayer(...))`.
- The UI writes straight into `player.settings` (`key`, `song`, `tempo`, `countIn`), and changes take effect on the next beat. Only `key` is also kept in React state, because the key buttons show which one is selected. The tempo, count-in and song controls are uncontrolled inputs.
- `loadSound` creates the `AudioContext` and decodes every sample once. It must first run from a user gesture: the "enable sound" overlay, Start, or Space.
- Notes are scheduled ahead on the `AudioContext` clock. A `requestAnimationFrame` loop (`tick`) schedules each note half a beat before it sounds.
- Bass pattern: on a chord change it plays the root. When the chord repeats, it alternates root and fifth.
- `nextNote` jumps back to the top of the song whenever `settings.song` differs from the song it was playing. `start` uses this to restart from the top.
- The optional count-in schedules 4 `click` samples before the first note.
- Stopping calls `stop()` on every source still playing or queued, which cancels future notes, and then bumps `loopId`. Each `tick` loop carries the `loopId` it started with and exits once that no longer matches, so a quick stop/start can't leave two loops running.
