import React from 'react'
import { VideoSequence } from '@/components/VideoSequence'
import { Flip } from '@/components/Flip'

type Props = {
  children: React.ReactNode
  // a label per child, e.g. ['Before', 'After']: the children are then
  // shown one at a time in one slot, flipping between them (see Flip)
  labels?: string[]
  // narrow screens: stack the pair instead of squeezing it side by side
  stack?: boolean
}

// Side-by-side media. Each child (Img/Video) sits in its own cell, which
// carries the child's aspect ratio as --ar so CSS can size a pair to one
// shared height. The row's videos play in turn (see VideoSequence). A
// labelled pair is a Before / After instead: one slot that flips.
export function MediaRow({ children, labels, stack }: Props) {
  if (labels) return <Flip labels={labels}>{children}</Flip>
  return (
    <div className={`media-row${stack ? ' media-row--stack' : ''}`}>
      <VideoSequence>
        {React.Children.map(children, child => {
          const props = React.isValidElement<{ width?: number; height?: number }>(child) ? child.props : {}
          const ar = props.width && props.height ? props.width / props.height : undefined
          return (
            <figure className="media-cell" style={ar ? ({ '--ar': ar } as React.CSSProperties) : undefined}>
              {child}
            </figure>
          )
        })}
      </VideoSequence>
    </div>
  )
}
