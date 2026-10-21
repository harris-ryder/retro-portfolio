'use client'
import { useEffect, useRef, useState } from 'react'
import { PlaybackBar } from '@/components/PlaybackBar'
import { useVideoSequence } from '@/components/VideoSequence'
import { onceFullyInView } from '@/components/inView'

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
  // a device render laid over the video, which fills its screen hole; the
  // block then takes the render's size, with displayHeight still the
  // screen's (see src/data/phone.ts)
  frame?: Frame
  // in a frame: a recording of a web page, shown whole between a drawn
  // mobile browser's bars (status and address above, toolbar below) in
  // this theme rather than cropped to fill the screen
  browser?: { theme: 'light' | 'dark'; url: string }
}

export type Frame = {
  src: string
  width: number
  height: number
  // the transparent hole in the render, in its pixels
  screen: { x: number; y: number; width: number; height: number; radius?: number }
}

// every Video on the page: one plays at a time, so when one starts (on
// coming fully into view, or by hand) whichever was playing pauses
const all = new Set<HTMLVideoElement>()

export function Video({ src, width, height, wrapperStyle, controls = true, displayHeight, bar, frame, browser }: Props) {
  const [ready, setReady] = useState(false)
  const ref = useRef<HTMLVideoElement | null>(null)
  const ar = width / height
  // what the block is sized by: the render when there is one, else the video
  const boxAr = frame ? frame.width / frame.height : ar
  const boxHeight = displayHeight && frame ? displayHeight * (frame.height / frame.screen.height) : displayHeight
  // a fixed size is a width the wrapper (or the block, with controls) keeps
  const fixed: React.CSSProperties = boxHeight ? { width: `min(100%, ${Math.round(boxHeight * boxAr)}px)` } : {}

  useEffect(() => {
    const v = ref.current
    if (!v) return
    all.add(v)
    const onPlay = () => {
      for (const other of all) if (other !== v && !other.paused) other.pause()
    }
    v.addEventListener('play', onPlay)
    return () => {
      v.removeEventListener('play', onPlay)
      all.delete(v)
    }
  }, [])

  // in a row, the videos take turns rather than each looping on its own
  const sequence = useVideoSequence()
  useEffect(() => {
    if (!sequence || !ref.current) return
    return sequence.register(ref.current)
  }, [sequence])

  // on its own, the video loops, but holds its first frame until it is
  // fully on screen (a row's provider does the same for its first video)
  useEffect(() => {
    const v = ref.current
    if (sequence || !v) return
    return onceFullyInView(v, () => void v.play().catch(() => {}))
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
      style={{ aspectRatio: `${width} / ${height}`, '--ar': ar, ...(controls || frame ? {} : fixed), ...wrapperStyle } as React.CSSProperties}
    >
      {!ready && (
        <span className="media-loading" aria-hidden="true">
          loading<span className="media-loading-dots">...</span>
        </span>
      )}
      <video
        src={src}
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
  // in a frame, the video sits in the render's screen hole, under it
  const pct = (n: number, of: number) => `${(100 * n) / of}%`
  // the screen runs a few render pixels under the bezel all round, so no
  // sliver of the page shows where the two edges land between pixels
  const bleed = 6
  const shown = frame ? (
    <span className="phone-frame" style={{ '--ar': boxAr, ...(controls ? {} : fixed) } as React.CSSProperties}>
      <span
        className={`phone-frame-screen${browser ? ` phone-browser phone-browser--${browser.theme}` : ''}`}
        style={{
          left: pct(frame.screen.x - bleed, frame.width),
          top: pct(frame.screen.y - bleed, frame.height),
          width: pct(frame.screen.width + 2 * bleed, frame.width),
          height: pct(frame.screen.height + 2 * bleed, frame.height),
          // the hole's own corners, so the screen's never show past the
          // render's rounded outline
          ...(frame.screen.radius ? { borderRadius: `${pct(frame.screen.radius + bleed, frame.screen.width + 2 * bleed)} / ${pct(frame.screen.radius + bleed, frame.screen.height + 2 * bleed)}`, overflow: 'hidden' } : {}),
        }}
      >
        {browser && <BrowserTop url={browser.url} />}
        {card}
        {browser && <BrowserBottom />}
      </span>
      <img className="phone-frame-render" src={frame.src} alt="" width={frame.width} height={frame.height} draggable={false} />
    </span>
  ) : card
  if (!controls) return shown

  // the video and its bar share one block, which takes the video's width
  return (
    <div className="video-block" style={{ '--ar': boxAr, ...fixed } as React.CSSProperties}>
      {shown}
      <PlaybackBar video={ref}>{bar}</PlaybackBar>
    </div>
  )
}

// a drawn mobile browser's bars, in the screen's em (see .phone-browser)
const icon = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
)

function BrowserTop({ url }: { url: string }) {
  return (
    <span className="phone-browser-top" aria-hidden>
      <span className="phone-browser-status">
        <span>9:41</span>
        <span className="phone-browser-status-icons">
          {icon('M2 20h2M7 20v-4M12 20V11M17 20V7M22 20V3')}
          {icon('M3 7h16v10H3zM21 10v4')}
        </span>
      </span>
      <span className="phone-browser-address">
        {icon('M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z')}
        <span>{url}</span>
      </span>
    </span>
  )
}

function BrowserBottom() {
  return (
    <span className="phone-browser-bottom" aria-hidden>
      {icon('M15 5l-7 7 7 7')}
      {icon('M9 5l7 7-7 7')}
      {icon('M12 5v14M5 12h14')}
      {icon('M5 5h14v14H5z')}
      {icon('M12 5.5v.5M12 11.75v.5M12 18v.5')}
    </span>
  )
}
