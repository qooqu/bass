import { sampleNames, scales, rootFifthMap, noteMap, songs } from './music'

// Web Audio playback engine. `settings` can be changed at any time and takes effect on the next beat.
// `onPosition` is called with { song, patternIndex, chordIndex } as each note sounds, and null on stop.
export const createPlayer = ({ onPosition }) => {
  const settings = { key: 'Bb', song: 'old home place', tempo: 110, countIn: true }

  let audioContext = null
  let loading = null
  const buffers = {}
  // Each run plays through its own output node, so stopping just disconnects it, silencing
  // anything already scheduled. Null while stopped; a stale loop exits once it's been replaced.
  let output = null

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
      gainNode.gain.setValueAtTime(1, time)
      gainNode.gain.linearRampToValueAtTime(0, time + 0.99 * beatSeconds())
    }
    source.connect(gainNode).connect(output)
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
    return noteMap[playRoot ? root : rootFifthMap[root]]
  }

  // Schedule each note half a beat before it sounds
  const tick = runOutput => {
    if (runOutput !== output) return
    if (nextNoteTime - audioContext.currentTime <= beatSeconds() / 2) {
      playNoteAtTime(nextNote(), nextNoteTime)
      const position = { song, patternIndex, chordIndex }
      setTimeout(
        () => runOutput === output && onPosition(position),
        (nextNoteTime - audioContext.currentTime) * 1000,
      )
      nextNoteTime += beatSeconds()
    }
    requestAnimationFrame(() => tick(runOutput))
  }

  const start = async () => {
    if (output) return
    const loaded = loadSound()
    const runOutput = (output = audioContext.createGain())
    runOutput.connect(audioContext.destination)

    await loaded
    await audioContext.resume()
    if (runOutput !== output) return

    song = null
    degree = null
    nextNoteTime = audioContext.currentTime + 0.1 * beatSeconds()
    if (settings.countIn) {
      for (let i = 0; i < 4; i++) {
        playNoteAtTime('click', nextNoteTime)
        nextNoteTime += beatSeconds()
      }
    }
    tick(runOutput)
  }

  const stop = () => {
    output?.disconnect()
    output = null
    onPosition(null)
  }

  const toggle = () => (output ? stop() : start())

  return { settings, loadSound, start, stop, toggle }
}
