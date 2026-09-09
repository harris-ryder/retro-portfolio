'use client'
import { useEffect, useRef, useState } from 'react'
import { GooBorder } from '@/components/GooBorder'
import { PlaybackBar } from '@/components/PlaybackBar'

type Props = {
  src: string
  width: number
  height: number
  wrapperStyle?: React.CSSProperties
  /** false when a parent (e.g. GooRow) draws a shared goo border instead */
  goo?: boolean
  /** show a play/pause and scrub bar under the video; clicking the video toggles it too */
  controls?: boolean
  /** cap the rendered height (px); the width follows the aspect and the card centres */
  maxHeight?: number
}

export function Video({ src, width, height, wrapperStyle, goo = true, controls = false, maxHeight }: Props) {
  const [ready, setReady] = useState(false)
  const ref = useRef<HTMLVideoElement>(null)

  // a cached video can be ready before hydration attaches the listeners
  useEffect(() => {
    const v = ref.current
    if (v && v.readyState >= 2) setReady(true)
  }, [])

  const toggle = () => {
    const v = ref.current
    if (!v) return
    if (v.paused) void v.play()
    else v.pause()
  }

  // a height cap becomes a width cap through the aspect ratio, so the card
  // keeps its shape; on short viewports it also yields to the screen height
  const cap: React.CSSProperties = maxHeight
    ? { maxWidth: `calc(min(${maxHeight}px, 72vh) * ${width / height})`, marginLeft: 'auto', marginRight: 'auto' }
    : {}
  const outer: React.CSSProperties = { ...cap, ...wrapperStyle }

  const card = (
    <span
      className="goo-media"
      style={{ aspectRatio: `${width} / ${height}`, ...(controls ? { marginTop: 0, marginBottom: 0 } : outer) }}
    >
      {goo && <GooBorder />}
      <span className={`media-wrapper${ready ? '' : ' media-skeleton'}`}>
        {!ready && (
          <span className="media-loading" aria-hidden="true">
            loading<span className="media-loading-dots">...</span>
          </span>
        )}
        <video
          ref={ref}
          src={src}
          autoPlay
          muted
          loop
          playsInline
          onCanPlay={() => setReady(true)}
          onLoadedData={() => setReady(true)}
          onPlaying={() => setReady(true)}
          onClick={controls ? toggle : undefined}
          style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.25s', cursor: controls ? 'pointer' : undefined }}
        />
      </span>
    </span>
  )

  if (!controls) return card

  // with controls the card and its bar share one block, which takes over the
  // media margins (and any width the article sets) so the pair moves as one
  return (
    <div className="video-block" style={outer}>
      {card}
      <PlaybackBar video={ref} />
    </div>
  )
}
