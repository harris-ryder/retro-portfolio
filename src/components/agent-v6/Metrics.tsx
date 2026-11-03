import React from 'react'

/** Three measures in one ruled square: the first takes the full height on the
 *  left, the other two stack on the right, short over tall. Each has its label
 *  at the top, the change large at the bottom with a word after it, and the
 *  figures behind the change in small print under that. Black lines on white. */

export interface Metric {
  label: string
  change: string
  /** The word after the change: faster, cheaper, fewer. */
  direction: string
  detail: string
}

export function Metrics({ metrics }: { metrics: [Metric, Metric, Metric] }) {
  return (
    <div className="metrics">
      {metrics.map((m, i) => (
        <div key={m.label} className={`metrics-tile metrics-${i + 1}`}>
          <p className="metrics-label">{m.label}</p>
          <div>
            <p className="metrics-change">
              {m.change}<span className="metrics-direction">{m.direction}</span>
            </p>
            <p className="metrics-detail">{m.detail}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
