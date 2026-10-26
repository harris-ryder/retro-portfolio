'use client'
import { useState } from 'react'
import type { Frame } from '@/components/Video'

type Props = {
  src: string
  alt: string
  width: number
  height: number
  // display no wider than this (CSS px), e.g. to keep a soft capture crisp
  maxWidth?: number
  // a phone render to sit the image inside, as a screen capture (see Video)
  frame?: Frame
  wrapperStyle?: React.CSSProperties
}

export function Img({ src, alt, width, height, maxWidth, frame, wrapperStyle }: Props) {
  const [loaded, setLoaded] = useState(false)
  const card = (
    <span
      className={`media-wrapper${loaded ? '' : ' media-skeleton'}`}
      style={{ aspectRatio: `${width} / ${height}`, '--ar': width / height, maxWidth, ...wrapperStyle } as React.CSSProperties}
    >
      {!loaded && (
        <span className="media-loading" aria-hidden="true">
          loading<span className="media-loading-dots">...</span>
        </span>
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        draggable={false}
        // a cached image can finish before hydration attaches onLoad, so
        // check completeness when the ref lands too
        ref={el => {
          if (el?.complete && el.naturalWidth > 0) setLoaded(true)
        }}
        onLoad={() => setLoaded(true)}
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.25s' }}
      />
    </span>
  )
  if (!frame) return card
  // in a frame, the image sits in the render's screen hole, under it,
  // laid out exactly as Video does it
  const pct = (n: number, of: number) => `${(100 * n) / of}%`
  const bleed = 6
  return (
    <span className="phone-frame" style={{ '--ar': frame.width / frame.height } as React.CSSProperties}>
      <span
        className="phone-frame-screen"
        style={{
          left: pct(frame.screen.x - bleed, frame.width),
          top: pct(frame.screen.y - bleed, frame.height),
          width: pct(frame.screen.width + 2 * bleed, frame.width),
          height: pct(frame.screen.height + 2 * bleed, frame.height),
          ...(frame.screen.radius ? { borderRadius: `${pct(frame.screen.radius + bleed, frame.screen.width + 2 * bleed)} / ${pct(frame.screen.radius + bleed, frame.screen.height + 2 * bleed)}`, overflow: 'hidden' } : {}),
        }}
      >
        {card}
      </span>
      <img className="phone-frame-render" src={frame.src} alt="" width={frame.width} height={frame.height} draggable={false} />
    </span>
  )
}
