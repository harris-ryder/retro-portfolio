import React from 'react'

/** One turn of an agent as a column of boxes joined by hairlines, the last
 *  box holding the tools it calls, if any, in a ruled grid. A tag (a small grey chip)
 *  marks a box or tool that is a model call of its own. Plain HTML, so the
 *  rules and text line up on any width and wrap rather than overflow. */

export interface TurnBox {
  name: string
  tag?: string
  lines: string[]
}

function Box({ box, className }: { box: TurnBox; className: string }) {
  return (
    <div className={className}>
      <div className="turn-head">
        <span className="turn-name">{box.name}</span>
        {box.tag && <span className="turn-tag">{box.tag}</span>}
      </div>
      {box.lines.map(line => <div key={line} className="turn-line">{line}</div>)}
    </div>
  )
}

export function Turn({ steps, tools = [], label }: { steps: TurnBox[]; tools?: TurnBox[]; label: string }) {
  const last = tools.length ? steps.length - 1 : steps.length
  return (
    <div className="turn" role="img" aria-label={label}>
      {steps.map((step, i) => (
        <React.Fragment key={step.name}>
          {i > 0 && <div className="turn-link" />}
          {i < last ? (
            <Box box={step} className="turn-box" />
          ) : (
            <div className="turn-box">
              <Box box={step} className="turn-main" />
              <div className="turn-tools">
                {tools.map(tool => <Box key={tool.name} box={tool} className="turn-tool" />)}
              </div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
