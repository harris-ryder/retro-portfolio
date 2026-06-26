'use client'
import { useState } from 'react'

type Props = {
  src: string
  alt: string
  width: number
  height: number
  wrapperStyle?: React.CSSProperties
}

export function Img({ src, alt, width, height, wrapperStyle }: Props) {
  const [loaded, setLoaded] = useState(false)
  return (
    <span
      className={`media-wrapper${loaded ? '' : ' media-skeleton'}`}
      style={{ aspectRatio: `${width} / ${height}`, ...wrapperStyle }}
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        draggable={false}
        onLoad={() => setLoaded(true)}
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.25s' }}
      />
    </span>
  )
}
