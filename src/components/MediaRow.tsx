import React from 'react'
import { VideoSequence } from '@/components/VideoSequence'
import { Flip } from '@/components/Flip'
import type { Frame } from '@/components/Video'

type Props = {
  children: React.ReactNode
  // a label per child, e.g. ['Before', 'After']: the children are then
  // shown one at a time in one slot, flipping between them (see Flip)
  labels?: string[]
  // a caption per child, shown under it, with the pair kept side by side
  captions?: string[]
  // narrow screens: stack the pair instead of squeezing it side by side
  stack?: boolean
}

// Side-by-side media. Each child (Img/Video) sits in its own cell, which
// carries the child's aspect ratio as --ar so CSS can size a pair to one
// shared height. The row's videos play in turn (see VideoSequence). A
// labelled pair is a Before / After instead: one slot that flips.
export function MediaRow({ children, labels, captions, stack }: Props) {
  if (labels) return <Flip labels={labels}>{children}</Flip>
  return (
    <div className={`media-row${stack ? ' media-row--stack' : ''}`}>
      <VideoSequence>
        {React.Children.map(children, (child, i) => {
          const props = React.isValidElement<{ width?: number; height?: number; frame?: Frame }>(child) ? child.props : {}
          // a framed video takes its render's shape (see Video)
          const box = props.frame ?? props
          const ar = box.width && box.height ? box.width / box.height : undefined
          return (
            <figure className="media-cell" style={ar ? ({ '--ar': ar } as React.CSSProperties) : undefined}>
              {child}
              {captions?.[i] && <figcaption>{captions[i]}</figcaption>}
            </figure>
          )
        })}
      </VideoSequence>
    </div>
  )
}
