import { useState, useEffect } from 'react'
import { scales, songs } from '../lib/music'
import { createPlayer } from '../lib/player'
import SongChart from './SongChart'

const controlClass = 'h-10 rounded border border-gray-300 bg-white px-3'
const buttonClass = 'cursor-pointer rounded px-5 py-2 font-medium text-white uppercase shadow'

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
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 p-5">
      <h1>Bluegrass Bass</h1>

      {!soundEnabled && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50">
          <button
            type="button"
            className={`${buttonClass} bg-primary`}
            onClick={enableSound}
          >
            enable sound
          </button>
        </div>
      )}

      {/* On phones the song gets its own line, with key, tempo and the button below */}
      <div className="grid w-full max-w-md grid-cols-[1fr_1fr_auto] gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <label className="col-span-3 flex min-w-0 flex-col gap-1 sm:col-span-1">
          <span className="text-muted">Song</span>
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

        <label className="flex flex-col gap-1">
          <span className="text-muted">Key</span>
          <select value={key} onChange={e => changeKey(e.target.value)} className={`${controlClass} w-full`}>
            {Object.keys(scales).map(k => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-muted">Tempo</span>
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
          className={`flex size-10 cursor-pointer items-center justify-center self-end rounded border text-white ${
            playing ? 'border-secondary bg-secondary' : 'border-primary bg-primary'
          }`}
          onClick={togglePlayback}
        >
          <svg viewBox="0 0 16 16" className="size-4 fill-current" aria-hidden="true">
            {playing ? <rect x="2" y="2" width="12" height="12" rx="1" /> : <path d="M4 2l10 6-10 6z" />}
          </svg>
        </button>
      </div>

      <SongChart song={song} position={position} />
    </div>
  )
}

export default BluegrassBass
