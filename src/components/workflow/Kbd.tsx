import { Fragment } from 'react'

/* Renders a keyboard key (or a combo) as circle(s) with a thin black
   stroke; combos get a connecting line between each circle. Pass the
   sentinel 'shift' to render the macOS ⇧ glyph. */
export function Kbd({ keys }: { keys: string[] }) {
  return (
    <span className="wf-kbd">
      {keys.map((k, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="wf-kbd__line" aria-hidden="true" />}
          <span className="wf-kbd__k">
            {k === 'shift' ? <ShiftIcon /> : <span className="wf-kbd__t">{k}</span>}
          </span>
        </Fragment>
      ))}
    </span>
  )
}

function ShiftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-label="Shift">
      <path
        d="M12 4 3 13h5v7h8v-7h5L12 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}
