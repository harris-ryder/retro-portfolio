import React from 'react'
import { VideoSequence } from '@/components/VideoSequence'

type Props = {
  children: React.ReactNode
  // caption under each child, e.g. ['Before', 'After']
  labels?: string[]
  // narrow screens: stack the pair instead of squeezing it side by side
  stack?: boolean
}

// Side-by-side media. Each child (Img/Video) sits in its own cell, which
// carries the child's aspect ratio as --ar so CSS can size a pair to one
// shared height. The row's videos play in turn (see VideoSequence).
export function MediaRow({ children, labels, stack }: Props) {
  return (
    <div className={`media-row${stack ? ' media-row--stack' : ''}`}>
      <VideoSequence>
        {React.Children.map(children, (child, i) => {
          const props = React.isValidElement<{ width?: number; height?: number }>(child) ? child.props : {}
          const ar = props.width && props.height ? props.width / props.height : undefined
          return (
            <figure className="media-cell" style={ar ? ({ '--ar': ar } as React.CSSProperties) : undefined}>
              {child}
              {labels?.[i] && <figcaption>{labels[i]}</figcaption>}
            </figure>
          )
        })}
      </VideoSequence>
    </div>
  )
}
