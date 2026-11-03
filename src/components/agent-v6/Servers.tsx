import React from 'react'

/** Work split across servers, left to right: each server a box holding its
 *  steps in order, a hairline from one server to the next, and under them a
 *  dashed return line for the feedback that never comes back. Drawn with
 *  Turn's frame, type and hairlines (see .turn in globals.css); on a narrow
 *  column the servers stack and their steps wrap. */

export interface Server {
  name: string
  line: string
  /** each step's name, then what it does */
  steps: [string, string][]
}

export function Servers({ servers, back, label }: { servers: Server[]; back: string; label: string }) {
  return (
    <div className="turn" role="img" aria-label={label}>
      <div className="sv-row">
        {servers.map((server, i) => (
          <React.Fragment key={server.name}>
            {i > 0 && <div className="sv-link" />}
            <div className="turn-box sv-server">
              <div className="turn-head"><span className="turn-name">{server.name}</span></div>
              <div className="turn-line">{server.line}</div>
              <div className="sv-steps">
                {server.steps.map(([name, what], j) => (
                  <React.Fragment key={j}>
                    {j > 0 && <div className="sv-step-link" />}
                    <div className="mp-file sv-step" data-picked>
                      <div>{name}</div>
                      <div className="sv-what">{what}</div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
      <div className="sv-back"><span>{back}</span></div>
    </div>
  )
}
