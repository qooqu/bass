import { songs } from '../lib/music'

// Each entry in a section is one beat, two beats to the bar
const BEATS_PER_BAR = 2

// Scales are mixolydian, so degree 7 is the flat seven
const nashville = degree => (degree === 7 ? '♭7' : degree)

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

const SongChart = ({ song, position }) => {
  const { pattern } = songs[song]
  const current = position?.song === song ? position : null
  const currentSection = current && pattern[current.patternIndex]

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <ol className="flex flex-wrap justify-center gap-2">
        {pattern.map((section, i) => (
          <li
            key={i}
            className={`rounded border px-3 py-1 ${
              i === current?.patternIndex
                ? 'border-secondary bg-secondary text-white'
                : 'border-gray-300 bg-white'
            }`}
          >
            {section}
          </li>
        ))}
      </ol>

      {[...new Set(pattern)].map(section => {
        const degrees = songs[song][section]
        const firstBeats = degrees.map((_, beat) => beat).filter(beat => beat % BEATS_PER_BAR === 0)

        return (
          <section key={section}>
            <h2 className="mb-1 text-muted">{section}</h2>
            <div className="grid grid-cols-4 pt-px pl-px">
              {firstBeats.map(firstBeat => {
                const chords = chordsInBar(degrees, firstBeat)
                return (
                  <div
                    key={firstBeat}
                    className="-mt-px -ml-px flex justify-center border border-gray-300 bg-white py-2 text-2xl"
                  >
                    {/* Nashville convention: underline a split bar */}
                    <div className={`flex gap-1 ${chords.length > 1 ? 'border-b-2 border-current' : ''}`}>
                      {chords.map(({ degree, beats }) => (
                        <span
                          key={beats[0]}
                          className={`rounded px-2 ${
                            section === currentSection && beats.includes(current.chordIndex)
                              ? 'bg-secondary text-white'
                              : ''
                          }`}
                        >
                          {nashville(degree)}
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
