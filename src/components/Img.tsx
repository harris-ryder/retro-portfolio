'use client'
import { useState } from 'react'
import { GooBorder } from '@/components/GooBorder'

type Props = {
  src: string
  alt: string
  width: number
  height: number
  wrapperStyle?: React.CSSProperties
  /** false when a parent (e.g. GooRow) draws a shared goo border instead */
  goo?: boolean
}

export function Img({ src, alt, width, height, wrapperStyle, goo = true }: Props) {
  const [loaded, setLoaded] = useState(false)
  return (
    <span className="goo-media" style={{ aspectRatio: `${width} / ${height}`, ...wrapperStyle }}>
      {goo && <GooBorder />}
      <span className={`media-wrapper${loaded ? '' : ' media-skeleton'}`}>
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
    </span>
  )
}
