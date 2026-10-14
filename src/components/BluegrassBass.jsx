import { useState, useEffect } from 'react'
import { scales, songs } from '../lib/music'
import { createPlayer } from '../lib/player'
import SongChart from './SongChart'

// 44px tall, the minimum comfortable touch target
const controlClass = 'h-11 rounded-lg border border-control bg-white px-3 text-[17px] text-ink'

// 80 to 150 BPM in steps of 5
const tempos = Array.from({ length: 15 }, (_, i) => 80 + i * 5)

const BluegrassBass = () => {
  const [position, setPosition] = useState(null)
  const [player] = useState(() => createPlayer({ onPosition: setPosition }))
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [key, setKey] = useState(player.settings.key)
  const [song, setSong] = useState(player.settings.song)

  const changeKey = newKey => {
    setKey(newKey)
    player.settings.key = newKey
  }

  // Fiddle tunes have a standard key, so switch to it
  const changeSong = newSong => {
    setSong(newSong)
    player.settings.song = newSong
    if (songs[newSong].key) changeKey(songs[newSong].key)
  }

  const enableSound = () => {
    setSoundEnabled(true)
    player.loadSound()
  }

  const togglePlayback = () => {
    setSoundEnabled(true)
    player.toggle()
    setPlaying(player.isPlaying())
  }

  // The first Space only enables sound, like the overlay button; after that it starts and stops
  useEffect(() => {
    const handleKeyDown = event => {
      if (event.code === 'Space') {
        event.preventDefault()
        if (soundEnabled) {
          togglePlayback()
        } else {
          enableSound()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [player, soundEnabled])

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-5 px-4 py-7">
      <h1 className="text-3xl font-[750] tracking-tight">Bluegrass Bass</h1>

      {!soundEnabled && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-ink/60">
          <button
            type="button"
            className="h-11 cursor-pointer rounded-[10px] bg-accent px-6 text-[17px] font-semibold text-white"
            onClick={enableSound}
          >
            Enable sound
          </button>
        </div>
      )}

      {/* On phones the song gets its own line, with key, tempo and the button below */}
      <div className="grid grid-cols-[1fr_1fr_auto] gap-3 rounded-[14px] border border-line bg-paper p-3.5 sm:grid-cols-[1fr_auto_auto_auto]">
        <label className="col-span-3 flex min-w-0 flex-col gap-1.5 sm:col-span-1">
          <span className="eyebrow">Song</span>
          <select
            value={song}
            onChange={e => changeSong(e.target.value)}
            className={`${controlClass} w-full min-w-0`}
          >
            {Object.keys(songs).map(songName => (
              <option key={songName} value={songName}>
                {songName}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="eyebrow">Key</span>
          <select value={key} onChange={e => changeKey(e.target.value)} className={`${controlClass} w-full`}>
            {Object.keys(scales).map(k => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="eyebrow">Tempo</span>
          <select
            defaultValue={player.settings.tempo}
            onChange={e => {
              player.settings.tempo = Number(e.target.value)
            }}
            className={`${controlClass} w-full`}
          >
            {tempos.map(tempo => (
              <option key={tempo} value={tempo}>
                {tempo}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          aria-label={playing ? 'Stop' : 'Start'}
          title={playing ? 'Stop (Space)' : 'Start (Space)'}
          className={`flex size-11 cursor-pointer items-center justify-center self-end rounded-[10px] text-white ${
            playing ? 'bg-accent-dark' : 'bg-accent'
          }`}
          onClick={togglePlayback}
        >
          <svg viewBox="0 0 16 16" className="size-4 fill-current" aria-hidden="true">
            {playing ? <rect x="3" y="3" width="10" height="10" rx="1.5" /> : <path d="M4 2l10 6-10 6z" />}
          </svg>
        </button>
      </div>

      <SongChart song={song} musicKey={key} position={position} />
    </div>
  )
}

export default BluegrassBass
