import { useState, useEffect, useRef } from 'react'
import { sampleNames, scales, rootFifthMap, noteMap, songs } from '../lib/music'

const keys = Object.keys(scales)

const controlClass = 'rounded border border-gray-300 bg-white px-3 py-2'
const buttonClass = 'cursor-pointer rounded px-5 py-2 font-medium text-white uppercase shadow'

const BluegrassBass = () => {
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [currentChord, setCurrentChord] = useState(null)
  const [key, setKeyState] = useState('C')
  const [selectedSong, setSelectedSongState] = useState('old home place')
  const [tempoInput, setTempoInput] = useState('110')
  const [countInEnabled, setCountInEnabledState] = useState(true)

  const audioContextRef = useRef(null)
  const audioBuffersRef = useRef({})
  const loadingRef = useRef(null)
  const activeSourcesRef = useRef(new Set())
  // Incremented on every start/stop so a stale scheduling loop knows to exit
  const loopIdRef = useRef(0)
  const isLoopRunningRef = useRef(false)

  // Settings read by the scheduling loop, mirrored from state so it always sees current values
  const keyRef = useRef(key)
  const selectedSongRef = useRef(selectedSong)
  const tempoRef = useRef(Number(tempoInput))
  const countInEnabledRef = useRef(countInEnabled)

  const patternIndexRef = useRef(0)
  const chordsIndexRef = useRef(-1)
  const playRootRef = useRef(true)
  const nextScaleDegreeRef = useRef(null)
  const previousScaleDegreeRef = useRef(null)
  const nextNoteTimeRef = useRef(null)

  const beatSeconds = () => 60 / tempoRef.current

  const resetPosition = () => {
    patternIndexRef.current = 0
    chordsIndexRef.current = -1
    playRootRef.current = true
    nextScaleDegreeRef.current = null
    previousScaleDegreeRef.current = null
    nextNoteTimeRef.current = null
  }

  // Must first run from a user gesture to satisfy browser autoplay rules
  const loadSound = () => {
    if (!loadingRef.current) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      audioContextRef.current = audioContext
      loadingRef.current = Promise.all(
        sampleNames.map(name =>
          fetch(`/${name}.mp3`)
            .then(response => response.arrayBuffer())
            .then(data => audioContext.decodeAudioData(data))
            .then(buffer => {
              audioBuffersRef.current[name] = buffer
            }),
        ),
      )
      setSoundEnabled(true)
    }
    return loadingRef.current
  }

  const playNoteAtTime = (note, time) => {
    const audioContext = audioContextRef.current
    const source = audioContext.createBufferSource()
    source.buffer = audioBuffersRef.current[note]
    const gainNode = audioContext.createGain()
    if (note === 'click') {
      gainNode.gain.value = 0.2
    } else {
      const beat = beatSeconds()
      gainNode.gain.setValueAtTime(1, time)
      gainNode.gain.linearRampToValueAtTime(0, time + beat - beat / 100)
    }
    source.connect(gainNode)
    gainNode.connect(audioContext.destination)
    activeSourcesRef.current.add(source)
    source.onended = () => activeSourcesRef.current.delete(source)
    source.start(time)
  }

  const advanceScaleDegree = () => {
    const song = songs[selectedSongRef.current]
    let currentPartChords = song[song.pattern[patternIndexRef.current]]

    chordsIndexRef.current++
    if (chordsIndexRef.current >= currentPartChords.length) {
      chordsIndexRef.current = 0
      patternIndexRef.current = (patternIndexRef.current + 1) % song.pattern.length
      currentPartChords = song[song.pattern[patternIndexRef.current]]
    }

    previousScaleDegreeRef.current = nextScaleDegreeRef.current
    nextScaleDegreeRef.current = currentPartChords[chordsIndexRef.current]
  }

  const getNoteFromScaleDegree = () => {
    const root = scales[keyRef.current][nextScaleDegreeRef.current - 1]
    const fifth = rootFifthMap[root]

    setCurrentChord(`${nextScaleDegreeRef.current} / ${root}`)

    // Root on a chord change, then alternate root and fifth while the chord holds
    if (previousScaleDegreeRef.current !== nextScaleDegreeRef.current) {
      playRootRef.current = true
    } else {
      playRootRef.current = !playRootRef.current
    }

    return noteMap[playRootRef.current ? root : fifth]
  }

  const scheduleNextNote = loopId => {
    if (loopId !== loopIdRef.current) return

    nextNoteTimeRef.current =
      (nextNoteTimeRef.current ?? audioContextRef.current.currentTime) + beatSeconds()
    advanceScaleDegree()
    playNoteAtTime(getNoteFromScaleDegree(), nextNoteTimeRef.current)

    requestAnimationFrame(() => checkTimeAndSchedule(loopId))
  }

  // Schedule each note half a beat ahead of when it sounds
  const checkTimeAndSchedule = loopId => {
    if (loopId !== loopIdRef.current) return

    const delta = audioContextRef.current.currentTime - nextNoteTimeRef.current
    if (delta >= 0.5 * beatSeconds()) {
      scheduleNextNote(loopId)
    } else {
      requestAnimationFrame(() => checkTimeAndSchedule(loopId))
    }
  }

  const countIn = loopId => {
    const beat = beatSeconds()
    let clickTime = audioContextRef.current.currentTime + 0.1 * beat
    for (let count = 0; count < 4; count++) {
      if (count > 0) clickTime += beat
      playNoteAtTime('click', clickTime)
    }
    // First note lands one beat after the last click
    nextNoteTimeRef.current = clickTime
    scheduleNextNote(loopId)
  }

  const startLoop = async () => {
    if (isLoopRunningRef.current) return
    isLoopRunningRef.current = true
    const loopId = ++loopIdRef.current

    await loadSound()
    await audioContextRef.current.resume()
    if (loopId !== loopIdRef.current) return

    if (countInEnabledRef.current) {
      countIn(loopId)
    } else {
      scheduleNextNote(loopId)
    }
  }

  const stopLoop = () => {
    isLoopRunningRef.current = false
    loopIdRef.current++
    activeSourcesRef.current.forEach(source => source.stop())
    activeSourcesRef.current.clear()
    resetPosition()
  }

  const toggleLoop = () => {
    if (isLoopRunningRef.current) {
      stopLoop()
    } else {
      startLoop()
    }
  }

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.code === 'Space') {
        event.preventDefault()
        toggleLoop()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  })

  const setKey = newKey => {
    keyRef.current = newKey
    setKeyState(newKey)
  }

  const setSelectedSong = song => {
    selectedSongRef.current = song
    patternIndexRef.current = 0
    chordsIndexRef.current = -1
    setSelectedSongState(song)
  }

  const setTempo = value => {
    setTempoInput(value)
    const newTempo = parseInt(value)
    if (newTempo > 0) {
      tempoRef.current = newTempo
    }
  }

  const setCountInEnabled = enabled => {
    countInEnabledRef.current = enabled
    setCountInEnabledState(enabled)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 p-5">
      <h1>Bluegrass Bass</h1>

      {!soundEnabled && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50">
          <button type="button" className={`${buttonClass} bg-primary`} onClick={loadSound}>
            enable sound
          </button>
        </div>
      )}

      <fieldset>
        <legend className="mb-2 text-muted">Key:</legend>
        <div className="grid grid-cols-6 gap-px overflow-hidden rounded bg-white sm:grid-cols-12">
          {keys.map(k => (
            <button
              key={k}
              type="button"
              aria-pressed={k === key}
              onClick={() => setKey(k)}
              className={`cursor-pointer px-4 py-3 text-white ${
                k === key ? 'bg-secondary' : 'bg-primary hover:bg-primary-dark'
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </fieldset>

      <p>Current chord: {currentChord}</p>

      <label className="flex flex-col gap-1">
        <span className="text-muted">Tempo (BPM)</span>
        <input
          type="number"
          min={30}
          max={300}
          value={tempoInput}
          onChange={e => setTempo(e.target.value)}
          className={controlClass}
        />
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={countInEnabled}
          onChange={e => setCountInEnabled(e.target.checked)}
          className="size-5 accent-primary"
        />
        Count In
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-muted">Select Song:</span>
        <select
          value={selectedSong}
          onChange={e => setSelectedSong(e.target.value)}
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
        <button type="button" className={`${buttonClass} bg-primary`} onClick={startLoop}>
          Start
        </button>
        <button type="button" className={`${buttonClass} bg-secondary`} onClick={stopLoop}>
          Stop
        </button>
      </div>
    </div>
  )
}

export default BluegrassBass
