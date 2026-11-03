import React from 'react'
import { VideoSequence } from '@/components/VideoSequence'
import { VideoTogether } from '@/components/VideoTogether'
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
  // the row's videos play at the same time on one bar under the row,
  // rather than in turn (see VideoTogether)
  together?: boolean
}

// Side-by-side media. Each child (Img/Video) sits in its own cell, which
// carries the child's aspect ratio as --ar so CSS can size a pair to one
// shared height. The row's videos play in turn (see VideoSequence), or as
// one when `together`. A labelled pair is a Before / After instead: one
// slot that flips.
export function MediaRow({ children, labels, captions, stack, together }: Props) {
  if (labels) return <Flip labels={labels}>{children}</Flip>
  const cells = React.Children.map(children, (child, i) => {
    const props = React.isValidElement<{ width?: number; height?: number; frame?: Frame }>(child) ? child.props : {}
    // a framed video takes its render's shape (see Video)
    const box = props.frame ?? props
    const ar = box.width && box.height ? box.width / box.height : undefined
    return (
      <figure className="media-cell" style={ar ? ({ '--ar': ar } as React.CSSProperties) : undefined}>
        {child}
        {!together && captions?.[i] && <figcaption>{captions[i]}</figcaption>}
      </figure>
    )
  })
  const rowClass = `media-row${stack ? ' media-row--stack' : ''}`
  // together: the one bar sits under the whole row, so the captions
  // follow it in a row of their own
  if (together) return (
    <div className="media-together">
      <VideoTogether>
        <div className={rowClass}>{cells}</div>
      </VideoTogether>
      {captions && (
        <div className="media-captions">
          {captions.map((c, i) => <div key={i} className="media-caption">{c}</div>)}
        </div>
      )}
    </div>
  )
  return (
    <div className={rowClass}>
      <VideoSequence>{cells}</VideoSequence>
    </div>
  )
}
