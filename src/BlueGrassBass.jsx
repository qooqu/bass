import { useState, useEffect, useRef, useCallback } from 'react'
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  TextField,
  Select,
  MenuItem,
} from '@mui/material'

const theme = createTheme({
  palette: {
    primary: {
      main: '#03a9f4', // Light Blue
    },
    secondary: {
      main: '#0d47a1', // Dark Blue
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
})

import C from '/C.mp3'
import Db from '/Db.mp3'
import D from '/D.mp3'
import Eb from '/Eb.mp3'
import E from '/E.mp3'
import F from '/F.mp3'
import Fsh from '/Fsh.mp3'
import G from '/G.mp3'
import Ab from '/Ab.mp3'
import A from '/A.mp3'
import Bb from '/Bb.mp3'
import B from '/B.mp3'
import click from '/click.mp3'

const audioFiles = { C, Db, D, Eb, E, F, Fsh, G, Ab, A, Bb, B, click }

// const notes = [ 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Fsh', 'G', 'Ab', 'A', 'Bb', 'B', 'click', ]

const scales = {
  C: ['C', 'D', 'E', 'F', 'G', 'A', 'Bb'],
  Db: ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'Cb'],
  D: ['D', 'E', 'F#', 'G', 'A', 'B', 'C'],
  Eb: ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'Db'],
  E: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D'],
  F: ['F', 'G', 'A', 'Bb', 'C', 'D', 'Eb'],
  'F#': ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E'],
  G: ['G', 'A', 'B', 'C', 'D', 'E', 'F'],
  Ab: ['Ab', 'Bb', 'C', 'D', 'E', 'F', 'Gb'],
  A: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G'],
  Bb: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'Ab'],
  B: ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A'],
}

const rootFifthMap = {
  Cb: 'Gb',
  C: 'G',
  'C#': 'G#',
  Db: 'Ab',
  D: 'A',
  'D#': 'A#',
  Eb: 'Bb',
  E: 'B',
  'E#': 'B#',
  Fb: 'Cb',
  F: 'C',
  'F#': 'C#',
  Gb: 'Db',
  G: 'D',
  'G#': 'D#',
  Ab: 'Eb',
  A: 'E',
  'A#': 'E#',
  Bb: 'F',
  B: 'F#',
  'B#': 'F##',
}

const noteMap = {
  Cb: 'B',
  C: 'C',
  'C#': 'Db',
  Db: 'Db',
  D: 'D',
  'D#': 'Eb',
  Eb: 'Eb',
  E: 'E',
  'E#': 'F',
  Fb: 'E',
  F: 'F',
  'F#': 'Fsh',
  'F##': 'G',
  Gb: 'Fsh',
  G: 'G',
  'G#': 'Ab',
  Ab: 'Ab',
  A: 'A',
  'A#': 'Bb',
  Bb: 'Bb',
  B: 'B',
  'B#': 'C',
}

const songs = {
  'old home place': [
    1, 1, 3, 3, 4, 4, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 1, 1, 3, 3, 4, 4, 1, 1, 1,
    1, 5, 5, 1, 1, 1, 1, 5, 5, 5, 5, 1, 1, 1, 1, 2, 2, 2, 2, 5, 5, 5, 5, 1, 1,
    3, 3, 4, 4, 1, 1, 1, 1, 5, 5, 1, 1, 1, 1,
  ],
  'new river train': [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 1, 1, 1, 1, 4, 4, 4, 4, 5,
    5, 5, 5, 1, 1, 1, 1,
  ],
  'more pretty girls than one': [
    1, 1, 5, 5, 1, 1, 1, 1, 4, 4, 4, 4, 1, 1, 1, 1, 4, 4, 4, 4, 1, 1, 1, 1, 1,
    1, 5, 5, 1, 1, 1, 1,
  ],
  'cherokee shuffle': [
    1, 1, 1, 1, 1, 1, 6, 6, 4, 4, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 6, 6, 4,
    4, 1, 1, 1, 5, 1, 1, 4, 4, 1, 1, 4, 4, 1, 1, 4, 4, 1, 1, 1, 1, 6, 6, 4, 5,
    1, 1, 4, 4, 1, 1, 4, 4, 1, 1, 4, 4, 1, 1, 1, 1, 6, 6, 4, 5, 1, 1,
  ],
  'st anns reel': [
    1, 1, 1, 1, 4, 4, 1, 1, 1, 1, 1, 1, 4, 5, 1, 1, 1, 1, 1, 1, 4, 4, 1, 1, 1,
    1, 1, 1, 4, 5, 1, 1, 1, 1, 2, 2, 5, 5, 1, 1, 6, 6, 4, 4, 5, 5, 1, 1, 1, 1,
    2, 2, 5, 5, 1, 1, 6, 6, 4, 4, 5, 5, 1, 1,
  ],
  '99 years': [
    1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 1,
    1, 5, 5, 1, 1, 1, 1,
  ],
  'blue night': [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 1, 1, 4, 4, 1, 1, 1, 1, 5,
    5, 5, 5, 1, 1, 1, 1,
  ],
  'dark hollow': [
    1, 1, 5, 5, 1, 1, 1, 1, 1, 1, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 1,
    1, 5, 5, 1, 1, 1, 1,
  ],
  'someday you will change your mind': [
    1, 1, 7, 7, 4, 4, 4, 4, 5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 7, 7, 4, 4, 4, 4, 5,
    5, 5, 5, 1, 1, 1, 1, 5, 5, 5, 5, 1, 1, 1, 1, 2, 2, 2, 2, 5, 5, 5, 5, 1, 1,
    7, 7, 4, 4, 4, 4, 5, 5, 5, 5, 1, 1, 1, 1,
  ],
}

const BluegrassBass = () => {
  const [audioBuffers, setAudioBuffers] = useState({})
  const [trigger, setTrigger] = useState(0) // State to trigger useEffect
  const [currentChord, setCurrentChord] = useState(null)

  const audioContextRef = useRef(null)
  const isLoopRunningRef = useRef(false)
  const selectedSongRef = useRef('old home place')
  const songIndexRef = useRef(-1)
  const keyRef = useRef('C')
  const currentChordRef = useRef(null)
  const playRootRef = useRef(true)
  const nextScaleDegreeRef = useRef(null)
  const previousScaleDegreeRef = useRef(null)
  const tempoRef = useRef(110)
  const intervalRef = useRef(60000 / tempoRef.current)
  const noteDurationRef = useRef(intervalRef.current / 1000)
  const fadeOutDurationRef = useRef(noteDurationRef.current / 100)
  const startBufferRef = useRef(0.1 * (intervalRef.current / 1000))
  const previousNoteTimeRef = useRef(null)
  const nextNoteTimeRef = useRef(null)
  const countInEnabledRef = useRef(true)

  const init = () => {
    songIndexRef.current = -1
    currentChordRef.current = null
    playRootRef.current = true
    nextScaleDegreeRef.current = null
    previousScaleDegreeRef.current = null
    previousNoteTimeRef.current = null
    nextNoteTimeRef.current = null
  }

  const initializeAudioContext = () => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)()
    audioContextRef.current = audioContext
    const buffers = {}
    Object.keys(audioFiles).forEach(note => {
      fetch(audioFiles[note])
        .then(response => response.arrayBuffer())
        .then(data => audioContext.decodeAudioData(data))
        .then(buffer => {
          buffers[note] = buffer
          if (Object.keys(buffers).length === Object.keys(audioFiles).length) {
            setAudioBuffers(buffers)
          }
        })
    })
  }

  const playNoteAtTime = (note, time) => {
    const source = audioContextRef.current.createBufferSource()
    source.buffer = audioBuffers[note]
    const gainNode = audioContextRef.current.createGain()
    if (note === 'click') {
      gainNode.gain.value = 0.2
    } else {
      gainNode.gain.setValueAtTime(1, time)
      gainNode.gain.linearRampToValueAtTime(
        0,
        time + noteDurationRef.current - fadeOutDurationRef.current,
      )
    }
    source.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)
    source.start(time)
  }

  const getScaleDegreeFromSong = () => {
    previousScaleDegreeRef.current = nextScaleDegreeRef.current
    songIndexRef.current =
      (songIndexRef.current + 1) % songs[selectedSongRef.current].length
    nextScaleDegreeRef.current =
      songs[selectedSongRef.current][songIndexRef.current]
  }

  const getNoteFromScaleDegree = () => {
    const root = scales[keyRef.current][nextScaleDegreeRef.current - 1]
    const fifth = rootFifthMap[root]
    const rootNote = noteMap[root]
    const fifthNote = noteMap[fifth]

    setCurrentChord(`${nextScaleDegreeRef.current} / ${root}`)

    if (previousScaleDegreeRef.current !== nextScaleDegreeRef.current) {
      playRootRef.current = true
    } else {
      playRootRef.current = !playRootRef.current
    }

    return playRootRef.current ? rootNote : fifthNote
  }

  const getNextNoteTime = () => {
    if (previousNoteTimeRef.current && nextNoteTimeRef.current) {
      previousNoteTimeRef.current = nextNoteTimeRef.current
    } else {
      previousNoteTimeRef.current = audioContextRef.current.currentTime
    }
    nextNoteTimeRef.current =
      previousNoteTimeRef.current + intervalRef.current / 1000
  }

  const scheduleNextNote = () => {
    if (!isLoopRunningRef.current) return

    getNextNoteTime()

    if (selectedSongRef.current) {
      getScaleDegreeFromSong()
    }

    const note = getNoteFromScaleDegree()

    playNoteAtTime(note, nextNoteTimeRef.current)

    requestAnimationFrame(checkTimeAndSchedule)
  }

  const checkTimeAndSchedule = () => {
    if (!isLoopRunningRef) return

    const currentTime = audioContextRef.current.currentTime
    const delta = currentTime - nextNoteTimeRef.current
    if (delta >= 0.5 * (intervalRef.current / 1000)) {
      scheduleNextNote()
    } else {
      requestAnimationFrame(checkTimeAndSchedule)
    }
  }

  const startLoop = () => {
    console.log('Starting loop')
    if (isLoopRunningRef.current) return
    isLoopRunningRef.current = true
    audioContextRef.current.resume().then(() => {
      if (countInEnabledRef.current) {
        countIn()
      } else {
        scheduleNextNote()
      }
    })
  }

  const countIn = () => {
    const countInClicks = 4
    let count = 1
    let startTime = audioContextRef.current.currentTime + startBufferRef.current
    let clickTime = startTime

    playNoteAtTime('click', clickTime)
    while (count < countInClicks) {
      count++
      clickTime += intervalRef.current / 1000
      playNoteAtTime('click', clickTime)
    }

    previousNoteTimeRef.current = clickTime - intervalRef.current / 1000
    nextNoteTimeRef.current = clickTime

    scheduleNextNote()
  }

  const stopLoop = () => {
    isLoopRunningRef.current = false
    initializeAudioContext()
    init()
  }

  // const toggleLoop = () => {
  //   if (isLoopRunningRef) {
  //     stopLoop()
  //   } else {
  //     startLoop()
  //   }
  // }

  const toggleLoop = useCallback(() => {
    if (isLoopRunningRef.current) {
      stopLoop()
    } else {
      startLoop()
    }
  }, [])

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
  }, [toggleLoop])

  const updateKey = (event, newKey) => {
    if (newKey !== null) {
      keyRef.current = newKey
      setTrigger(trigger + 1)
    }
  }

  const setSelectedSong = song => {
    selectedSongRef.current = song
    setTrigger(trigger + 1)
  }

  const setTempo = newTempo => {
    tempoRef.current = newTempo
    intervalRef.current = 60000 / newTempo
    noteDurationRef.current = intervalRef.current / 1000
    fadeOutDurationRef.current = noteDurationRef.current / 100
    startBufferRef.current = 0.1 * (intervalRef.current / 1000)
    setTrigger(trigger + 1) // Trigger re-render
  }

  const setCountInEnabled = enabled => {
    countInEnabledRef.current = enabled
    setTrigger(trigger + 1) // Trigger re-render
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        padding="20px"
      >
        <h1>Bluegrass Bass</h1>
        <FormControl component="fieldset">
          <FormLabel component="legend">Key:</FormLabel>
          <ToggleButtonGroup
            value={keyRef.current}
            exclusive
            onChange={updateKey}
            aria-label="key"
          >
            {Object.keys(scales).map(key => (
              <ToggleButton
                key={key}
                value={key}
                aria-label={key}
                sx={{
                  color: 'white',
                  backgroundColor: 'primary.main',
                  '&.Mui-selected': {
                    backgroundColor: 'secondary.main',
                    color: 'white',
                  },
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  textTransform: 'none', // Add this line to prevent all caps
                }}
              >
                {key}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>{' '}
        </FormControl>
        <p id="currentChordRef">Current chord: {currentChord}</p>
        <div className="row">
          <FormControl>
            <FormLabel>Tempo (BPM)</FormLabel>
            <TextField
              type="number"
              value={tempoRef.current}
              inputProps={{ min: 30, max: 300 }}
              onChange={e => setTempo(parseInt(e.target.value))}
            />
          </FormControl>
        </div>
        <div className="row">
          <FormControlLabel
            control={
              <Checkbox
                checked={countInEnabledRef.current}
                onChange={e => setCountInEnabled(e.target.checked)}
              />
            }
            label="Count In"
          />
        </div>
        <div className="row">
          <FormControl>
            <FormLabel>Select Song:</FormLabel>
            <Select
              value={selectedSongRef.current}
              onChange={e => setSelectedSong(e.target.value)}
            >
              {Object.keys(songs).map(songName => (
                <MenuItem key={songName} value={songName}>
                  {songName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <Box display="flex" gap={2} mt={2}>
          <Button variant="contained" color="primary" onClick={startLoop}>
            Start
          </Button>
          <Button variant="contained" color="secondary" onClick={stopLoop}>
            Stop
          </Button>
        </Box>
        <p>
          bass samples from{' '}
          <a href="https://theremin.music.uiowa.edu/MIS-Pitches-2012/MISDoubleBass2012.html">
            here
          </a>
        </p>
      </Box>
    </ThemeProvider>
  )
}

export default BluegrassBass
