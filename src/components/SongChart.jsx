import { BEATS_PER_BAR, songs } from '../lib/music'

// Scales are mixolydian, so degree 7 is the flat seven
const nashville = degree => (degree === 7 ? '♭7' : degree)

// Shared by the form row and the bars so they match
const gridClass = 'grid grid-cols-4 pt-px pl-px'
const cellClass = '-mt-px -ml-px flex justify-center border border-gray-300 bg-white py-2'
const labelClass = 'mb-1 text-muted'
const pillClass = isCurrent => `rounded px-2 ${isCurrent ? 'bg-secondary text-white' : ''}`

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
      <section>
        <h2 className={labelClass}>Form</h2>
        <ol className={gridClass}>
          {pattern.map((section, i) => (
            // Smaller on phones so section names like "chorus" fit
            <li key={i} className={`${cellClass} text-xl sm:text-2xl`}>
              <span className={pillClass(i === current?.patternIndex)}>{section}</span>
            </li>
          ))}
        </ol>
      </section>

      {[...new Set(pattern)].map(section => {
        const degrees = songs[song][section]
        const firstBeats = degrees.map((_, beat) => beat).filter(beat => beat % BEATS_PER_BAR === 0)

        return (
          <section key={section}>
            <h2 className={labelClass}>{section}</h2>
            <div className={gridClass}>
              {firstBeats.map(firstBeat => {
                const chords = chordsInBar(degrees, firstBeat)
                return (
                  <div key={firstBeat} className={`${cellClass} text-2xl`}>
                    {/* Nashville convention: underline a split bar */}
                    <div className={`flex gap-1 ${chords.length > 1 ? 'border-b-2 border-current' : ''}`}>
                      {chords.map(({ degree, beats }) => (
                        <span
                          key={beats[0]}
                          className={pillClass(
                            section === currentSection && beats.includes(current.chordIndex),
                          )}
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
