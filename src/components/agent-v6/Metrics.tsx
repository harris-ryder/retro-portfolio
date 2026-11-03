import React from 'react'

/** A square of four tiles, after an infographic survey card: a note in the
 *  tall tile top left, then three measures, each with its label at the top and
 *  the new figure large at the bottom, the old one small beside it. The columns
 *  are staggered, short over tall on the right, tall over short on the left.
 *  Black, white and the site's one grey; the last measure is the dark tile. */

export interface Metric {
  label: string
  value: string
  was: string
}

export function Metrics({ title, note, metrics }: {
  title: string
  note: string
  metrics: [Metric, Metric, Metric]
}) {
  return (
    <div className="metrics">
      <div className="metrics-tile metrics-note">
        <p className="metrics-title">{title}</p>
        <p className="metrics-text">{note}</p>
      </div>
      {metrics.map((m, i) => (
        <div key={m.label} className={`metrics-tile metrics-${i + 1}`}>
          <p className="metrics-label">{m.label}</p>
          <p className="metrics-figure">
            <span className="metrics-was">was {m.was}</span>
            <span className="metrics-value">{m.value}</span>
          </p>
        </div>
      ))}
    </div>
  )
}
