'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { GooBlob } from '@/components/GooBlob'

// A filmstrip for article media. The strip breaks out of the text column to
// the full viewport width; cards sit side by side and the one nearest the
// column's centre is the "active" one, while its neighbours dim a little and
// peek in from the edges. Native horizontal scrolling with centre snapping
// does the heavy lifting (touch/trackpad swipes, momentum, accessibility);
// a mouse drag, a click on a neighbour, the arrow keys and the chevrons at
// the screen edges all just scroll the strip. Cards have fixed dimensions
// from their aspect ratio, so the space is reserved before any media loads.
//
// Arrow keys act on the "armed" reel: the one nearest the middle of the
// viewport, or the one the pointer is over. Its chevrons light up; the
// others' stay greyed, so it is always clear which strip the keys move.

export type MediaItem = {
  src: string
  width: number
  height: number
  alt?: string
  /** a short label; the canvas view draws it above the item */
  caption?: React.ReactNode
  /** render as a looping muted video instead of an image */
  video?: boolean
}

export type ReelItem = MediaItem

type Props = {
  items: ReelItem[]
  /** card height in px; cards shrink on narrow viewports (see --w in CSS) */
  height?: number
  /** index of the card centred on first paint */
  initial?: number
  /** show the media bare, without the card's background, border and shadow */
  raw?: boolean
  label?: string
}

/* ---- arming: one reel at a time owns the arrow keys ---- */

type Handle = {
  el: HTMLElement
  step: (dir: 1 | -1) => void
  setArmed: (armed: boolean) => void
}

const handles = new Set<Handle>()
let armed: Handle | null = null
let pickRaf = 0

function arm(h: Handle | null) {
  if (h === armed) return
  armed?.setArmed(false)
  armed = h
  h?.setArmed(true)
}

/** The reel whose strip is nearest the middle of the viewport, if any is on screen. */
function pickNearest() {
  const mid = window.innerHeight / 2
  let best: Handle | null = null
  let bestD = Infinity
  for (const h of handles) {
    const r = h.el.getBoundingClientRect()
    if (r.bottom < 0 || r.top > window.innerHeight) continue
    const d = Math.abs((r.top + r.bottom) / 2 - mid)
    if (d < bestD) {
      bestD = d
      best = h
    }
  }
  arm(best)
}

function schedulePick() {
  if (!pickRaf) {
    pickRaf = requestAnimationFrame(() => {
      pickRaf = 0
      pickNearest()
    })
  }
}

function onKey(e: KeyboardEvent) {
  if (!armed || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
  const t = e.target as HTMLElement | null
  if (t && (t.isContentEditable || t.matches('input, textarea, select, [role="slider"]'))) return
  e.preventDefault()
  armed.step(e.key === 'ArrowRight' ? 1 : -1)
}

function register(h: Handle) {
  if (handles.size === 0) {
    window.addEventListener('scroll', schedulePick, { passive: true })
    window.addEventListener('resize', schedulePick)
    window.addEventListener('keydown', onKey)
  }
  handles.add(h)
  schedulePick()
  return () => {
    handles.delete(h)
    if (armed === h) arm(null)
    if (handles.size === 0) {
      window.removeEventListener('scroll', schedulePick)
      window.removeEventListener('resize', schedulePick)
      window.removeEventListener('keydown', onKey)
      cancelAnimationFrame(pickRaf)
      pickRaf = 0
    }
  }
}

/* ---- the reel ---- */

export function Reel({ items, height = 560, initial = 0, raw = false, label = 'Image reel' }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  /** nearest card to the centre, updated live while scrolling */
  const [active, setActive] = useState(initial)
  const activeRef = useRef(initial)
  activeRef.current = active
  const [isArmed, setIsArmed] = useState(false)
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null)
  const suppressClick = useRef(false)

  const cards = () => Array.from(trackRef.current?.querySelectorAll<HTMLElement>('.reel-card') ?? [])

  const nearest = useCallback(() => {
    const track = trackRef.current
    if (!track) return initial
    const mid = track.scrollLeft + track.clientWidth / 2
    let best = 0
    let bestD = Infinity
    cards().forEach((c, i) => {
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid)
      if (d < bestD) {
        bestD = d
        best = i
      }
    })
    return best
  }, [initial])

  const scrollToIndex = useCallback((i: number, smooth = true) => {
    const track = trackRef.current
    const card = cards()[Math.max(0, Math.min(items.length - 1, i))]
    if (!track || !card) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    track.scrollTo({
      left: card.offsetLeft + card.offsetWidth / 2 - track.clientWidth / 2,
      behavior: smooth && !reduced ? 'smooth' : 'auto',
    })
  }, [items.length])

  // the spacers let card 0 sit centred at scrollLeft 0, so only a non-zero
  // initial card needs placing, and it happens before first paint
  useLayoutEffect(() => {
    if (initial) scrollToIndex(initial, false)
  }, [initial, scrollToIndex])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let raf = 0
    const onScroll = () => {
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0
          setActive(nearest())
        })
      }
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      track.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [nearest])

  // take part in arming
  const handleRef = useRef<Handle | null>(null)
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const h: Handle = {
      el,
      step: dir => scrollToIndex(activeRef.current + dir),
      setArmed: setIsArmed,
    }
    handleRef.current = h
    return register(h)
  }, [scrollToIndex])
  const armSelf = () => {
    if (handleRef.current) arm(handleRef.current)
  }

  // mouse drag scrolls the strip; touch and trackpad already scroll natively.
  // Snapping is switched off for the duration (it fights a live scrollLeft)
  // and the nearest card is snapped to on release.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    const track = trackRef.current
    if (!track) return
    drag.current = { x: e.clientX, left: track.scrollLeft, moved: false }
    track.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    const track = trackRef.current
    if (!d || !track) return
    const dx = e.clientX - d.x
    if (!d.moved && Math.abs(dx) > 4) {
      d.moved = true
      track.classList.add('is-dragging')
    }
    if (d.moved) track.scrollLeft = d.left - dx
  }
  const endDrag = () => {
    const d = drag.current
    const track = trackRef.current
    drag.current = null
    if (!d || !track) return
    if (d.moved) {
      track.classList.remove('is-dragging')
      scrollToIndex(nearest())
      // the click that follows this pointerup belongs to the drag, not a card
      suppressClick.current = true
      window.setTimeout(() => {
        suppressClick.current = false
      }, 0)
    }
  }

  const n = items.length
  const first = items[0]
  const last = items[n - 1]

  return (
    <div
      ref={rootRef}
      className="reel"
      data-armed={isArmed}
      data-raw={raw}
      style={{ '--reel-h': `${height}px` } as React.CSSProperties}
      onPointerEnter={armSelf}
    >
      <div className="reel-strip">
        <div
          ref={trackRef}
          className="reel-track"
          role="group"
          aria-roledescription="carousel"
          aria-label={label}
          tabIndex={0}
          onFocus={armSelf}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
        >
          <span className="reel-spacer" aria-hidden="true" style={{ '--ar': first.width / first.height } as React.CSSProperties} />
          {items.map((item, i) => (
            <Card
              key={item.src}
              item={item}
              index={i}
              count={n}
              active={i === active}
              eager={Math.abs(i - initial) <= 2}
              onSelect={() => {
                if (suppressClick.current) return
                if (i !== active) scrollToIndex(i)
              }}
            />
          ))}
          <span className="reel-spacer" aria-hidden="true" style={{ '--ar': last.width / last.height } as React.CSSProperties} />
        </div>
        <button
          type="button"
          className="reel-chev reel-chev-l"
          aria-label="Previous"
          disabled={active === 0}
          onClick={() => scrollToIndex(active - 1)}
        >
          <GooBlob />
          <Chevron dir={-1} />
        </button>
        <button
          type="button"
          className="reel-chev reel-chev-r"
          aria-label="Next"
          disabled={active === n - 1}
          onClick={() => scrollToIndex(active + 1)}
        >
          <GooBlob />
          <Chevron dir={1} />
        </button>
      </div>
    </div>
  )
}

function Chevron({ dir }: { dir: 1 | -1 }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dir < 0 ? <path d="M15 6l-6 6 6 6" /> : <path d="M9 6l6 6-6 6" />}
    </svg>
  )
}

function Card({
  item,
  index,
  count,
  active,
  eager,
  onSelect,
}: {
  item: ReelItem
  index: number
  count: number
  active: boolean
  eager: boolean
  onSelect: () => void
}) {
  const [loaded, setLoaded] = useState(false)
  return (
    <figure
      className="reel-card"
      data-active={active}
      style={{ '--ar': item.width / item.height } as React.CSSProperties}
      onClick={onSelect}
      aria-label={`${index + 1} of ${count}`}
    >
      <span className={`media-wrapper${loaded ? '' : ' media-skeleton'}`}>
        {!loaded && (
          <span className="media-loading" aria-hidden="true">
            loading<span className="media-loading-dots">...</span>
          </span>
        )}
        {item.video ? (
          <video
            src={item.src}
            width={item.width}
            height={item.height}
            autoPlay
            muted
            loop
            playsInline
            preload={eager ? 'auto' : 'metadata'}
            ref={el => {
              if (el && el.readyState >= 3) setLoaded(true)
            }}
            onCanPlay={() => setLoaded(true)}
            style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.25s' }}
          />
        ) : (
          <img
            src={item.src}
            alt={item.alt ?? ''}
            width={item.width}
            height={item.height}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            draggable={false}
            ref={el => {
              if (el?.complete && el.naturalWidth > 0) setLoaded(true)
            }}
            onLoad={() => setLoaded(true)}
            style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.25s' }}
          />
        )}
      </span>
    </figure>
  )
}
