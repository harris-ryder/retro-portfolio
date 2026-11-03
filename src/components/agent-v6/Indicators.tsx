'use client'

import React, { useEffect, useRef, useState } from 'react'

/** One bar for the legacy agent, 100% of each measure, with a diamond inside
 *  it for each where the new agent lands: time at half, cost and failures near
 *  nothing. A hairline rises from each diamond to its label, each label on a
 *  row of its own so labels that sit close along the bar never meet. Drawn at the
 *  figure's own pixel width so the small type stays small on a phone. */

export interface Indicator {
  /** The new agent's share of the legacy agent's amount, 0 to 1. */
  share: number
  change: string
  detail: string
  /** The label's row, 0 at the top. */
  level: 0 | 1 | 2
  tone: 'light' | 'mid' | 'dark'
}

const LEVELS = [14, 56, 98]
const BAR_TOP = 132
const BAR = 56
const D = 14
// the bar's 0% and 100% sit this far in, so a diamond at either end stays inside
const INSET = 22

export function Indicators({ indicators, label }: { indicators: Indicator[]; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(600)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const x = (share: number) => INSET + share * (width - 2 * INSET)
  const mid = BAR_TOP + BAR / 2
  const height = BAR_TOP + BAR + 28
  return (
    <div ref={ref} className="indicators">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
        <rect x={0.5} y={BAR_TOP + 0.5} width={width - 1} height={BAR - 1} className="indicators-bar" />

        {indicators.map(ind => {
          const cx = x(ind.share)
          const top = LEVELS[ind.level]
          return (
            <g key={ind.change}>
              <line x1={cx} x2={cx} y1={top - 10} y2={mid - D} className="indicators-lead" />
              <text x={cx + 7} y={top} className="indicators-change">{ind.change.toUpperCase()}</text>
              <text x={cx + 7} y={top + 15} className="indicators-detail">{ind.detail.toUpperCase()}</text>
              <rect
                x={cx - D / Math.SQRT2} y={mid - D / Math.SQRT2}
                width={D * Math.SQRT2} height={D * Math.SQRT2}
                transform={`rotate(45 ${cx} ${mid})`}
                className={`indicators-mark indicators-${ind.tone}`}
              />
            </g>
          )
        })}

        <text x={x(0)} y={height - 6} textAnchor="middle" className="indicators-scale">0%</text>
        <text x={width} y={height - 6} textAnchor="end" className="indicators-scale">100% = LEGACY AGENT</text>
      </svg>
    </div>
  )
}
