'use client'
import { useEffect, useRef, useState } from 'react'
import { PlaybackBar } from '@/components/PlaybackBar'
import { useVideoSequence } from '@/components/VideoSequence'

type Props = {
  src: string
  width: number
  height: number
  wrapperStyle?: React.CSSProperties
  // a play/pause and scrub bar under the video (on by default); clicking
  // the video toggles it too
  controls?: boolean
  // show at this height (CSS px) whatever the budget, so an article's
  // phone recordings all match, scaling down with the budget when that
  // doesn't fit (see naturalWidth in pairColumn.ts)
  displayHeight?: number
  // drawn at the right end of the scrub bar (e.g. a Before / After switch)
  bar?: React.ReactNode
}

export function Video({ src, width, height, wrapperStyle, controls = true, displayHeight, bar }: Props) {
  const [ready, setReady] = useState(false)
  const ref = useRef<HTMLVideoElement | null>(null)
  const ar = width / height
  // a fixed size is a width the wrapper (or the block, with controls) keeps
  const fixed: React.CSSProperties = displayHeight ? { width: `min(100%, ${Math.round(displayHeight * ar)}px)` } : {}

  // in a row, the videos take turns rather than each looping on its own
  const sequence = useVideoSequence()
  useEffect(() => {
    if (!sequence || !ref.current) return
    return sequence.register(ref.current)
  }, [sequence])

  const toggle = () => {
    const v = ref.current
    if (!v) return
    if (v.paused) void v.play()
    else v.pause()
  }

  const card = (
    <span
      className={`media-wrapper${ready ? '' : ' media-skeleton'}`}
      style={{ aspectRatio: `${width} / ${height}`, '--ar': ar, ...(controls ? {} : fixed), ...wrapperStyle } as React.CSSProperties}
    >
      {!ready && (
        <span className="media-loading" aria-hidden="true">
          loading<span className="media-loading-dots">...</span>
        </span>
      )}
      <video
        src={src}
        autoPlay={!sequence}
        loop={!sequence}
        muted
        playsInline
        // a waiting video shows its first frame rather than the skeleton
        preload="auto"
        // a cached video can be ready before hydration attaches onCanPlay
        ref={el => {
          ref.current = el
          if (el && el.readyState >= 3) setReady(true)
        }}
        onCanPlay={() => setReady(true)}
        onClick={controls ? toggle : undefined}
        style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.25s', cursor: controls ? 'pointer' : undefined }}
      />
    </span>
  )
  if (!controls) return card

  // the video and its bar share one block, which takes the video's width
  return (
    <div className="video-block" style={{ '--ar': ar, ...fixed } as React.CSSProperties}>
      {card}
      <PlaybackBar video={ref}>{bar}</PlaybackBar>
    </div>
  )
}
