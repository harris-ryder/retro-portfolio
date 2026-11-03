import React from 'react'

/** Paired columns in the manner of an old annual report's highlights page:
 *  outlined bars that overlap, the before in a light line with its value small
 *  at the top, the after in a heavy line with its value large. Each chart is
 *  scaled on its own so the before column stands full height; an after column
 *  too short to hold its value carries it just above, and one at zero is a
 *  line on the base. Values are haloed in the page colour so a line passing
 *  behind them breaks. The site's greys only. */

export interface Column {
  /** Two short lines under the chart, set in capitals. */
  caption: [string, string?]
  before: { value: number; label: string }
  after: { value: number; label: string }
}

const W = 600
const H = 372
const TOP = 72
const BASE = 300
const BAR = 84
// how far the after bar sits right of the before bar; the rest overlaps
const STEP = 60
const SLOT = BAR + STEP
const BIG = 22
const SMALL = 12

export function Columns({ charts, names, title, label }: {
  charts: Column[]
  names: [string, string]
  title: string
  label: string
}) {
  const gap = (W - charts.length * SLOT) / (charts.length - 1)
  return (
    <svg className="columns" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      <text x={0} y={14} className="columns-title">{title}</text>
      <line x1={0} x2={title.length * 8.84} y1={22} y2={22} className="columns-rule" />

      {charts.map((c, i) => {
        const x = i * (SLOT + gap)
        const height = (v: number) => (v / c.before.value) * (BASE - TOP)
        const before = height(c.before.value)
        const after = height(c.after.value)
        // the after value sits inside its bar when the bar has room for it
        const inside = after > BIG + 14
        return (
          <g key={c.caption[0]}>
            <rect x={x} y={BASE - before} width={BAR} height={before} className="columns-before" />
            <text x={x + 8} y={BASE - before + 8 + SMALL} className="columns-small">{c.before.label}</text>

            {after > 0
              ? <rect x={x + STEP} y={BASE - after} width={BAR} height={after} className="columns-after" />
              : <line x1={x + STEP} x2={x + STEP + BAR} y1={BASE} y2={BASE} className="columns-after" />}
            <text
              x={x + STEP + 6}
              y={inside ? BASE - after + 6 + BIG * 0.8 : BASE - after - 8}
              className="columns-big"
            >
              {c.after.label}
            </text>

            <text x={x + 8} y={BASE + 16} className="columns-name">{names[0]}</text>
            <text x={x + STEP + BAR - 6} y={BASE + 16} textAnchor="end" className="columns-name">{names[1]}</text>

            {c.caption.map((line, j) => line && (
              <text key={j} x={x} y={BASE + 44 + j * 15} className="columns-caption">{line.toUpperCase()}</text>
            ))}
          </g>
        )
      })}
    </svg>
  )
}
