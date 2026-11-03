'use client'

import React, { useEffect, useRef, useState } from 'react'

/** Measures read off rulers, like the marks on an instrument: each a scale in
 *  its real unit, ticked and numbered, with the legacy agent's reading as an
 *  open marker, the new agent's as a filled one, and a dimension line between
 *  them carrying the difference. Drawn at the figure's own pixel width, so the
 *  small type stays small on a phone rather than scaling with the drawing. */

export interface Ruler {
  label: string
  /** The difference, set at the right of the header: 47% faster. */
  change: string
  /** Signed gap written on the dimension line: −43 s. */
  gap: string
  legacy: { value: number; label: string }
  after: { value: number; label: string }
  max: number
  minor: number
  major: number
  /** Written before every scale number ($), and after the last one only (S). */
  prefix?: string
  suffix?: string
}

const ROW = 124
const HEAD = 12
const DIM = 36
// the legacy reading's marker sits a line above the new one's, so their tags never meet
const MARK_OLD = 52
const MARK_NEW = 66
const BASE = 88
const PAD = 4
// the closest two scale numbers may sit; nearer than this, every other one goes
const SPACING = 34

export function Rulers({ rulers, label }: { rulers: Ruler[]; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(600)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const height = rulers.length * ROW
  return (
    <div ref={ref} className="rulers">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
        {rulers.map((r, i) => {
          const x = (v: number) => PAD + (v / r.max) * (width - 2 * PAD)
          const ticks = Array.from({ length: Math.round(r.max / r.minor) + 1 }, (_, k) => k * r.minor)
          const isMajor = (v: number) => Math.abs(v / r.major - Math.round(v / r.major)) < 1e-6
          const every = Math.ceil(SPACING / (x(r.major) - x(0)))
          const numbered = ticks.filter(isMajor).filter((_, k) => k % every === 0)
          const xNew = x(r.after.value)
          const xOld = x(r.legacy.value)
          const scale = (v: number) => `${r.prefix ?? ''}${v}${v === r.max && r.suffix ? ` ${r.suffix}` : ''}`
          return (
            <g key={r.label} transform={`translate(0 ${i * ROW})`}>
              <text x={PAD} y={HEAD} className="rulers-index">{String(i + 1).padStart(2, '0')}</text>
              <text x={PAD + 26} y={HEAD} className="rulers-head">{r.label.toUpperCase()}</text>
              <text x={width - PAD} y={HEAD} textAnchor="end" className="rulers-head">{r.change.toUpperCase()}</text>

              {/* the dimension line between the two readings */}
              <line x1={xNew} x2={xOld} y1={DIM} y2={DIM} className="rulers-line" />
              <line x1={xNew} x2={xNew} y1={DIM - 4} y2={DIM + 4} className="rulers-line" />
              <line x1={xOld} x2={xOld} y1={DIM - 4} y2={DIM + 4} className="rulers-line" />
              <text x={(xNew + xOld) / 2} y={DIM - 5} textAnchor="middle" className="rulers-value">{r.gap}</text>

              {/* the readings: stems from the scale up to their markers */}
              <line x1={xOld} x2={xOld} y1={MARK_OLD} y2={BASE} className="rulers-line" />
              <rect x={xOld - 3} y={MARK_OLD - 3} width={6} height={6} className="rulers-open" />
              <text x={xOld - 8} y={MARK_OLD + 3.5} textAnchor="end" className="rulers-tag">LEGACY {r.legacy.label}</text>
              <line x1={xNew} x2={xNew} y1={MARK_NEW} y2={BASE} className="rulers-line" />
              <rect x={xNew - 3} y={MARK_NEW - 3} width={6} height={6} className="rulers-shut" />
              <text x={xNew + 8} y={MARK_NEW + 3.5} className="rulers-tag rulers-tag-new">NEW {r.after.label}</text>

              {/* the scale */}
              <line x1={x(0)} x2={x(r.max)} y1={BASE} y2={BASE} className="rulers-line" />
              {ticks.map(v => (
                <line
                  key={v}
                  x1={x(v)} x2={x(v)} y1={BASE} y2={BASE + (isMajor(v) ? 7 : 3)}
                  className={isMajor(v) ? 'rulers-line' : 'rulers-minor'}
                />
              ))}
              {numbered.map(v => (
                <text
                  key={v}
                  x={x(v)} y={BASE + 19}
                  textAnchor={v === 0 ? 'start' : v === r.max ? 'end' : 'middle'}
                  className="rulers-scale"
                >
                  {scale(v)}
                </text>
              ))}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
