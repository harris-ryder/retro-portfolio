'use client'
import { useState } from 'react'

type Props = {
  src: string
  width: number
  height: number
  wrapperStyle?: React.CSSProperties
}

export function Video({ src, width, height, wrapperStyle }: Props) {
  const [ready, setReady] = useState(false)
  return (
    <span
      className={`media-wrapper${ready ? '' : ' media-skeleton'}`}
      style={{ aspectRatio: `${width} / ${height}`, '--ar': width / height, ...wrapperStyle } as React.CSSProperties}
    >
      {!ready && (
        <span className="media-loading" aria-hidden="true">
          loading<span className="media-loading-dots">...</span>
        </span>
      )}
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        // a cached video can be ready before hydration attaches onCanPlay
        ref={el => {
          if (el && el.readyState >= 3) setReady(true)
        }}
        onCanPlay={() => setReady(true)}
        style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.25s' }}
      />
    </span>
  )
}
