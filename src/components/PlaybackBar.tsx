'use client'

import { useEffect, useRef, useState } from 'react'
import { GooBlob } from '@/components/GooBlob'

// Play/pause and a scrub track for a <video>, as a white pill under the
// media card. The knob is a tall oval that spins as it travels the rail, and
// the play and pause glyphs are built from the same oval, so the whole bar
// reads as one family of shapes. The bar drives the video through the ref
// it is handed and listens to the element for state, so it stays correct
// however the video is paused (a click on it, the bar, or the browser).

type Props = {
  video: React.RefObject<HTMLVideoElement | null>
}

export function PlaybackBar({ video }: Props) {
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
    // for the knob to move smoothly
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
      <GooBlob />
      <button type="button" className="pb-toggle" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
        <span className="pb-icon" data-show={!playing}>
          <PlayIcon />
        </span>
        <span className="pb-icon" data-show={playing}>
          <PauseIcon />
        </span>
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
        <OvalIcon className="pb-knob" style={{ left: `calc(${fraction * 100}% - 12px)`, transform: `rotate(${fraction * 1080}deg)` }} />
      </div>
    </div>
  )
}

function OvalIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} style={style}>
      <ellipse cx="12.5" cy="12" rx="4.5" ry="9" fill="currentColor" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="17.5" cy="12" rx="4.5" ry="9" fill="currentColor" />
      <ellipse cx="6.5" cy="12" rx="4.5" ry="9" fill="currentColor" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* a rounded triangle: the round-join stroke rounds the corners, so
          the core triangle is scaled to 75% and the stroke widened to keep
          the same footprint */}
      <path
        d="M12 4 A16 16 0 0 1 20 17.86 A16 16 0 0 1 4 17.86 A16 16 0 0 1 12 4Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={32 / 3}
        strokeLinejoin="round"
        transform="rotate(90 12 12) translate(3 3) scale(0.75)"
      />
    </svg>
  )
}
