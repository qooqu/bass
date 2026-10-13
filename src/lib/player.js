import { sampleNames, scales, rootFifthMap, noteMap, songs } from './music'

// Web Audio playback engine. `settings` can be changed at any time and takes effect on the next beat.
export const createPlayer = ({ onChord }) => {
  const settings = { key: 'Bb', song: 'old home place', tempo: 110, countIn: true }

  let audioContext = null
  let loading = null
  const buffers = {}
  const activeSources = new Set()
  let running = false
  // Incremented on every start/stop so a stale scheduling loop knows to exit
  let loopId = 0

  // Position in the song
  let song, patternIndex, chordIndex, degree, playRoot, nextNoteTime

  const beatSeconds = () => 60 / settings.tempo

  // Must first run from a user gesture to satisfy browser autoplay rules
  const loadSound = () => {
    if (!loading) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
      loading = Promise.all(
        sampleNames.map(async name => {
          const response = await fetch(`/${name}.mp3`)
          buffers[name] = await audioContext.decodeAudioData(await response.arrayBuffer())
        }),
      )
    }
    return loading
  }

  const playNoteAtTime = (note, time) => {
    const source = audioContext.createBufferSource()
    source.buffer = buffers[note]
    const gainNode = audioContext.createGain()
    if (note === 'click') {
      gainNode.gain.value = 0.2
    } else {
      const beat = beatSeconds()
      gainNode.gain.setValueAtTime(1, time)
      gainNode.gain.linearRampToValueAtTime(0, time + beat - beat / 100)
    }
    source.connect(gainNode).connect(audioContext.destination)
    activeSources.add(source)
    source.onended = () => activeSources.delete(source)
    source.start(time)
  }

  const nextNote = () => {
    // Start from the top when the song changes
    if (song !== settings.song) {
      song = settings.song
      patternIndex = 0
      chordIndex = -1
    }

    const { pattern } = songs[song]
    if (++chordIndex >= songs[song][pattern[patternIndex]].length) {
      chordIndex = 0
      patternIndex = (patternIndex + 1) % pattern.length
    }
    const nextDegree = songs[song][pattern[patternIndex]][chordIndex]

    // Root on a chord change, then alternate root and fifth while the chord holds
    playRoot = nextDegree !== degree || !playRoot
    degree = nextDegree

    const root = scales[settings.key][degree - 1]
    onChord(`${degree} / ${root}`)
    return noteMap[playRoot ? root : rootFifthMap[root]]
  }

  // Schedule each note half a beat before it sounds
  const tick = id => {
    if (id !== loopId) return
    if (nextNoteTime - audioContext.currentTime <= beatSeconds() / 2) {
      playNoteAtTime(nextNote(), nextNoteTime)
      nextNoteTime += beatSeconds()
    }
    requestAnimationFrame(() => tick(id))
  }

  const start = async () => {
    if (running) return
    running = true
    const id = ++loopId

    await loadSound()
    await audioContext.resume()
    if (id !== loopId) return

    song = null
    degree = null
    nextNoteTime = audioContext.currentTime + 0.1 * beatSeconds()
    if (settings.countIn) {
      for (let i = 0; i < 4; i++) {
        playNoteAtTime('click', nextNoteTime)
        nextNoteTime += beatSeconds()
      }
    }
    tick(id)
  }

  const stop = () => {
    running = false
    loopId++
    activeSources.forEach(source => source.stop())
    activeSources.clear()
  }

  const toggle = () => (running ? stop() : start())

  return { settings, loadSound, start, stop, toggle }
}
