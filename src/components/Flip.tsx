'use client'

import { Children, isValidElement, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { SequenceContext, type Sequence } from '@/components/VideoSequence'

type Props = {
  children: ReactNode
  // one label per child, drawn in the bottom right corner of the asset
  labels: string[]
  // how long a still is shown before the flip, in ms
  hold?: number
}

// A Before / After pair (or longer run) shown one asset at a time in one
// slot, with its label in the bottom right corner. A video flips to the
// next asset when it ends; a still flips after a hold; the last flips
// back to the first. Assets crossfade, and only the one on show can be
// pointed at. The slot is as wide as the widest asset at the height
// budget (see naturalWidth in pairColumn.ts); narrower ones sit centred.
export function Flip({ children, labels, hold = 4000 }: Props) {
  const items = Children.toArray(children)
  const [index, setIndex] = useState(0)
  const slotRef = useRef<HTMLDivElement>(null)

  // videos inside neither autoplay nor loop; this component plays them
  const sequence = useMemo<Sequence>(() => ({ register: () => () => {} }), [])

  useEffect(() => {
    const slot = slotRef.current
    if (!slot) return
    const next = () => setIndex(i => (i + 1) % items.length)
    const videos = Array.from(slot.children).map(item => item.querySelector('video'))
    videos.forEach((video, i) => {
      if (video && i !== index) video.pause()
    })
    const video = videos[index]
    if (video) {
      video.currentTime = 0
      void video.play().catch(() => {})
      video.addEventListener('ended', next)
      return () => video.removeEventListener('ended', next)
    }
    const timer = window.setTimeout(next, hold)
    return () => window.clearTimeout(timer)
  }, [index, items.length, hold])

  return (
    <SequenceContext.Provider value={sequence}>
      <div ref={slotRef} className="flip">
        {items.map((item, i) => {
          const props = isValidElement<{ width?: number; height?: number }>(item) ? item.props : {}
          const ar = props.width && props.height ? props.width / props.height : undefined
          return (
            <div key={i} className="flip-item" data-on={i === index} aria-hidden={i !== index}>
              <div className="flip-asset" style={ar ? ({ '--ar': ar } as React.CSSProperties) : undefined}>
                {item}
                {labels[i] && <span className="flip-label">{labels[i]}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </SequenceContext.Provider>
  )
}
