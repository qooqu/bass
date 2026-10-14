// Drawn rather than typed: the app's fonts have no ♭ or ♯, and fallback fonts look out of place
// Drawn in an 11×20 box; keep every point plus half the stroke width inside it
const paths = {
  flat: 'M2.5 1v18c4-1.6 6.6-4.2 6.6-6.6 0-2.7-3.3-3.3-6.6-.4',
  sharp: 'M3.5 2.5v16.5M6.5 1v16.5M1 9l8-2M1 14l8-2',
}

const Accidental = ({ type }) => (
  <>
    <svg
      viewBox="0 0 11 20"
      className="inline-block h-[0.75em] w-[0.4125em] align-baseline"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[type]} />
    </svg>
    <span className="sr-only">{type === 'flat' ? '♭' : '♯'}</span>
  </>
)

export default Accidental
