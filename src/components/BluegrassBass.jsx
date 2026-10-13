import { useState, useEffect } from 'react'
import { scales, songs } from '../lib/music'
import { createPlayer } from '../lib/player'
import SongChart from './SongChart'

const controlClass = 'rounded border border-gray-300 bg-white px-3 py-2'
const buttonClass = 'cursor-pointer rounded px-5 py-2 font-medium text-white uppercase shadow'

const BluegrassBass = () => {
  const [position, setPosition] = useState(null)
  const [player] = useState(() => createPlayer({ onPosition: setPosition }))
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [key, setKey] = useState(player.settings.key)
  const [song, setSong] = useState(player.settings.song)

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.code === 'Space') {
        event.preventDefault()
        setSoundEnabled(true)
        player.toggle()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [player])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 p-5">
      <h1>Bluegrass Bass</h1>

      {!soundEnabled && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50">
          <button
            type="button"
            className={`${buttonClass} bg-primary`}
            onClick={() => {
              setSoundEnabled(true)
              player.loadSound()
            }}
          >
            enable sound
          </button>
        </div>
      )}

      <fieldset>
        <legend className="mb-2 text-muted">Key:</legend>
        <div className="grid grid-cols-6 gap-px overflow-hidden rounded bg-white sm:grid-cols-12">
          {Object.keys(scales).map(k => (
            <button
              key={k}
              type="button"
              aria-pressed={k === key}
              onClick={() => {
                setKey(k)
                player.settings.key = k
              }}
              className={`cursor-pointer px-4 py-3 text-white ${
                k === key ? 'bg-secondary' : 'bg-primary hover:bg-primary-dark'
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1">
        <span className="text-muted">Tempo (BPM)</span>
        <input
          type="number"
          min={30}
          max={300}
          defaultValue={player.settings.tempo}
          onChange={e => {
            if (e.target.valueAsNumber > 0) player.settings.tempo = e.target.valueAsNumber
          }}
          className={controlClass}
        />
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          defaultChecked={player.settings.countIn}
          onChange={e => {
            player.settings.countIn = e.target.checked
          }}
          className="size-5 accent-primary"
        />
        Count In
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-muted">Select Song:</span>
        <select
          value={song}
          onChange={e => {
            setSong(e.target.value)
            player.settings.song = e.target.value
          }}
          className={controlClass}
        >
          {Object.keys(songs).map(songName => (
            <option key={songName} value={songName}>
              {songName}
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-4">
        <button
          type="button"
          className={`${buttonClass} bg-primary`}
          onClick={() => {
            setSoundEnabled(true)
            player.start()
          }}
        >
          Start
        </button>
        <button type="button" className={`${buttonClass} bg-secondary`} onClick={player.stop}>
          Stop
        </button>
      </div>

      <SongChart song={song} position={position} />
    </div>
  )
}

export default BluegrassBass
