# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev`: Astro dev server
- `npm run build`: static build to `dist/`
- `npm run preview`: serve the built `dist/`. In Astro 7 this runs as a background daemon; stop it with `npx astro preview stop`.

There is no test suite or linter. Netlify builds the site using `netlify.toml`.

## Architecture

"Bluegrass Bass" plays a root–fifth bluegrass bass line over a song's chord progression in any of 12 keys. It uses the same stack as the sibling `greenwold` repo: Astro 7, React 19 components embedded in Astro pages, and Tailwind 4 through `@tailwindcss/vite`, It also shares greenwold's look: Bricolage Grotesque and IBM Plex Mono (loaded in `Layout.astro`) and greenwold's palette, defined as theme tokens in `src/styles/global.css`, which also has a small `.eyebrow` label style. Interactive controls are at least 44px tall, and text and input borders meet WCAG contrast. The `control` token is the darker border used on inputs, because greenwold's `line` color is too faint for form controls.

- `src/layouts/Layout.astro`: the HTML shell, including the GoatCounter analytics script.
- `src/pages/index.astro`: the only page. It renders the app component with `client:load`.
- `src/components/BluegrassBass.jsx`: the UI.
- `src/components/SongChart.jsx`: a Nashville-number chart of the selected song. It shows the form (`pattern`) as a segmented row, then each section's bars, four to a row. Each bar shows its Nashville number and the chord name in the current key (♭ and ♯ are drawn by `Accidental.jsx`, because neither font has those characters). Split bars are underlined. In the section being played, the current bar is filled green and earlier bars are dimmed.
- `src/lib/player.js`: the Web Audio playback engine, written as plain JavaScript with no React.
- `src/lib/music.js`: song and music-theory data.

### Music data (`src/lib/music.js`)

- `songs`: each song has an optional `key` (a key from `scales`, used for fiddle tunes; selecting the song switches to it), a `pattern` (an ordered list of section names, e.g. `['A', 'A', 'B', 'B']`) and one array per section. Each array entry is a **scale degree (1–7) for one beat**, so a chord held for a bar of 2/4 is written `1, 1`. The chart and the root/fifth pattern rely on this two-beats-per-bar layout (`BEATS_PER_BAR` in `music.js`). Playback loops through the pattern forever.
- `scales`: each key's scale is **mixolydian** (flat 7th), so degree `7` gives the bVII chord (e.g. Bb in C).
- `rootFifthMap`: spelled note → its fifth.
- `noteMap`: spelled note (including enharmonics like `Gb`, `E#`, `F##`) → sample name. The samples are one octave of mp3s in `public/`, fetched from `/${name}.mp3`. F#/Gb is stored as `Fsh.mp3`.
- Adding a key means adding entries to `scales`, `rootFifthMap` and `noteMap`. Every spelling the new scale uses must also be a key in `rootFifthMap` and `noteMap`.

### Playback engine (`src/lib/player.js`)

- `createPlayer({ onPosition })` returns `{ settings, loadSound, toggle, isPlaying }`. The component makes one with `useState(() => createPlayer(...))`.
- The UI writes straight into `player.settings` (`key`, `song`, `tempo`, `countIn`), and changes take effect on the next beat. `key` and `song` are also kept in React state, because they drive the song and key dropdowns and the chart. Tempo is an uncontrolled dropdown (80–150 BPM in steps of 5). Count-in has no control in the UI and stays on (`settings.countIn`).
- `loadSound` creates the `AudioContext` and decodes every sample once. It must first run from a user gesture: the "enable sound" overlay, the Start/Stop button, or Space. iOS only lets audio start during the gesture itself, so `loadSound` and `start` call `audioContext.resume()` synchronously, before any `await`. Don't move those calls after an `await`. `loadSound` also sets `navigator.audioSession.type = 'playback'` so the iPhone silent switch doesn't mute the app.
- Notes are scheduled ahead on the `AudioContext` clock. A `requestAnimationFrame` loop (`tick`) schedules each note half a beat before it sounds. A `setTimeout` then calls `onPosition({ song, patternIndex, chordIndex })` when the note actually sounds, and `stop` calls `onPosition(null)`.
- Bass pattern: root on the first beat of each bar and on any chord change, fifth otherwise. This is tied to the bar so a section always starts on a root, even when the previous bar ended on the same chord.
- `nextNote` tracks its place by section (`patternIndex`) and by beat within that section (`chordIndex`). Keep this section-level position, because a planned feature will let the user choose the next section during playback. It jumps back to the top whenever `settings.song` differs from the song it was playing. `start` uses this to restart from the top.
- The optional count-in schedules 4 `click` samples before the first note.
- Each run plays through its own `output` gain node, which is `null` while stopped. Stopping disconnects that node, which silences notes already scheduled. Each `tick` loop carries the output node it started with and exits once that is no longer the current one, so a quick stop/start can't leave two loops running.
