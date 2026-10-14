import { BEATS_PER_BAR, scales, songs } from '../lib/music'
import Accidental from './Accidental'

// Scales are mixolydian, so degree 7 is the flat seven
const nashville = degree =>
  degree === 7 ? (
    <>
      <Accidental type="flat" />7
    </>
  ) : (
    degree
  )

// Note names are spelled like 'Bb' or 'F#'
const noteName = name => (
  <>
    {name[0]}
    {name[1] && <Accidental type={name[1] === 'b' ? 'flat' : 'sharp'} />}
  </>
)

// Group a bar's beats into chords, so a split bar has two
const chordsInBar = (degrees, firstBeat) => {
  const chords = []
  degrees.slice(firstBeat, firstBeat + BEATS_PER_BAR).forEach((degree, i) => {
    if (chords.at(-1)?.degree === degree) {
      chords.at(-1).beats.push(firstBeat + i)
    } else {
      chords.push({ degree, beats: [firstBeat + i] })
    }
  })
  return chords
}

const barClass = {
  current: 'bg-accent text-white',
  played: 'bg-well text-muted',
  upcoming: 'border border-line bg-paper text-ink',
}

const SongChart = ({ song, musicKey, position }) => {
  const { pattern } = songs[song]
  const current = position?.song === song ? position : null
  const currentSection = current && pattern[current.patternIndex]
  const chordName = degree => noteName(scales[musicKey][degree - 1])

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-2">
        <h2 className="eyebrow">Form</h2>
        <ol
          className="grid gap-1 rounded-xl bg-well p-1"
          style={{ gridTemplateColumns: `repeat(${pattern.length}, minmax(0, 1fr))` }}
        >
          {pattern.map((section, i) => (
            <li
              key={i}
              className={`flex h-11 items-center justify-center rounded-[9px] text-[17px] ${
                i === current?.patternIndex ? 'bg-accent font-semibold text-white' : 'text-ink-soft'
              }`}
            >
              {section}
            </li>
          ))}
        </ol>
      </section>

      {[...new Set(pattern)].map(section => {
        const degrees = songs[song][section]
        const firstBeats = degrees.map((_, beat) => beat).filter(beat => beat % BEATS_PER_BAR === 0)
        const beat = section === currentSection ? current.chordIndex : null

        return (
          <section key={section} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <h2 className="eyebrow">{section}</h2>
              <span className="font-mono text-xs text-muted">{firstBeats.length} bars</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {firstBeats.map(firstBeat => {
                const chords = chordsInBar(degrees, firstBeat)
                const split = chords.length > 1
                const state =
                  beat === null || beat < firstBeat
                    ? 'upcoming'
                    : beat < firstBeat + BEATS_PER_BAR
                      ? 'current'
                      : 'played'

                return (
                  <div
                    key={firstBeat}
                    className={`flex h-14 flex-col items-center justify-center rounded-lg ${barClass[state]}`}
                  >
                    {/* Nashville convention: underline a split bar */}
                    <div className={`flex ${split ? 'border-b-2 border-current' : ''}`}>
                      {chords.map(({ degree, beats }) => (
                        <span
                          key={beats[0]}
                          className={`w-8 rounded text-center font-mono text-2xl/7 font-medium ${
                            // In a split bar, mark which half is sounding
                            split && state === 'current' && beats.includes(beat) ? 'bg-white text-accent' : ''
                          }`}
                        >
                          {nashville(degree)}
                        </span>
                      ))}
                    </div>
                    <div className="flex">
                      {chords.map(({ degree, beats }) => (
                        <span key={beats[0]} className="w-8 text-center text-xs/4">
                          {chordName(degree)}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default SongChart
