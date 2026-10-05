'use client'

import { useEffect, useRef, useState } from 'react'
import { PauseIcon, PlayIcon } from '@radix-ui/react-icons'

// Play/pause and a scrub track for a <video>, flat under the media like
// a pair's captions. Radix's outlined triangle or two thin bars at the
// left, then a hairline rail with the played part drawn dark and a short
// tick at the playhead, in the hairline voice of the media outlines
// (the icons are 1px strokes on a 15px canvas). The bar drives
// the video through the ref it is handed and listens to the element for
// state, so it stays correct however the video is paused (a click on it,
// the bar, or the browser).

type Props = {
  video: React.RefObject<HTMLVideoElement | null>
  // drawn at the right end of the bar, after the track (e.g. a Before / After switch)
  children?: React.ReactNode
}

export function PlaybackBar({ video, children }: Props) {
  const [playing, setPlaying] = useState(true)
  const [fraction, setFraction] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const v = video.current
    if (!v) return
    let raf = 0
    const read = () => {
      if (v.duration) setFraction(v.currentTime / v.duration)
    }
    // read the clock every frame while playing; timeupdate is too coarse
    // for the playhead to move smoothly
    const tick = () => {
      read()
      raf = requestAnimationFrame(tick)
    }
    const start = () => {
      setPlaying(true)
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(tick)
    }
    const stop = () => {
      setPlaying(false)
      cancelAnimationFrame(raf)
      read()
    }
    v.addEventListener('play', start)
    v.addEventListener('pause', stop)
    v.addEventListener('seeked', read)
    v.addEventListener('loadedmetadata', read)
    if (!v.paused) start()
    else stop()
    return () => {
      cancelAnimationFrame(raf)
      v.removeEventListener('play', start)
      v.removeEventListener('pause', stop)
      v.removeEventListener('seeked', read)
      v.removeEventListener('loadedmetadata', read)
    }
  }, [video])

  const toggle = () => {
    const v = video.current
    if (!v) return
    if (v.paused) void v.play()
    else v.pause()
  }

  const seekTo = (f: number) => {
    const v = video.current
    if (!v || !v.duration) return
    const clamped = Math.min(1, Math.max(0, f))
    v.currentTime = clamped * v.duration
    setFraction(clamped)
  }

  const fractionAt = (clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect()
    return (clientX - rect.left) / rect.width
  }

  return (
    <div className="pb">
      <button type="button" className="pb-toggle" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
        {playing ? <PauseIcon aria-hidden="true" /> : <PlayIcon aria-hidden="true" />}
      </button>
      <div
        ref={trackRef}
        className="pb-track"
        role="slider"
        tabIndex={0}
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(fraction * 100)}
        onPointerDown={e => {
          e.currentTarget.setPointerCapture(e.pointerId)
          seekTo(fractionAt(e.clientX))
        }}
        onPointerMove={e => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) seekTo(fractionAt(e.clientX))
        }}
        onKeyDown={e => {
          const v = video.current
          if (!v || !v.duration) return
          const step = (e.shiftKey ? 5 : 1) / v.duration
          if (e.key === 'ArrowLeft') {
            e.preventDefault()
            seekTo(fraction - step)
          } else if (e.key === 'ArrowRight') {
            e.preventDefault()
            seekTo(fraction + step)
          } else if (e.key === ' ') {
            e.preventDefault()
            toggle()
          }
        }}
      >
        <span className="pb-rail" />
        <span className="pb-fill" style={{ width: `${fraction * 100}%` }} />
        <span className="pb-head" style={{ left: `${fraction * 100}%` }} />
      </div>
      {children}
    </div>
  )
}
