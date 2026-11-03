import React from 'react'

/** Three measures side by side in one ruled frame, each over a grid of a
 *  hundred squares: the empty squares are the legacy agent's amount, the
 *  filled ones what the new agent still takes of it, filled from the top left.
 *  Under the grid, the change large and the figures behind it in small print.
 *  Black lines on white; on a narrow screen the three stack. */

export interface Metric {
  label: string
  /** Of the legacy agent's 100, how many the new agent still takes. */
  filled: number
  change: string
  /** The word after the change: faster, cheaper, fewer. */
  direction: string
  detail: string
}

export function Metrics({ metrics, label }: { metrics: Metric[]; label: string }) {
  return (
    <div className="metrics-wrap">
      <div className="metrics" role="img" aria-label={label}>
        {metrics.map(m => (
          <div key={m.label} className="metrics-tile">
            <p className="metrics-label">{m.label}</p>
            <div className="metrics-grid" aria-hidden="true">
              {Array.from({ length: 100 }, (_, i) => (
                <span key={i} className={i < m.filled ? 'metrics-on' : undefined} />
              ))}
            </div>
            <div>
              <p className="metrics-change">
                {m.change}<span className="metrics-direction">{m.direction}</span>
              </p>
              <p className="metrics-detail">{m.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
