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
      style={{ aspectRatio: `${width} / ${height}`, ...wrapperStyle }}
    >
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        onCanPlay={() => setReady(true)}
        style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.25s' }}
      />
    </span>
  )
}
