'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { MediaItem } from '@/components/Reel'

// A Figma-style canvas for a scattered set of assets, drawn raw on the
// Figma canvas grey. Inline it is a small board that fits every item into
// view; a pinch (or ⌘/ctrl + scroll) over it zooms in place and a drag pans,
// while plain scrolling still scrolls the page. The button in its top-left
// corner grows the board to fill the screen — the same element, moved to
// position: fixed and animated from its inline rectangle to the viewport,
// while the world inside eases to a new fit — and there scrolling pans too.
// Double-click zooms in and back out; Esc or the same button shrinks the
// board back to where it was.
//
// The world transform and the fixed rectangle are written to the DOM
// directly during interaction rather than through React state, so panning
// stays at frame rate; React only tracks the mode and the zoom readout.
// Labels are sized in screen pixels via the --inv (1 / scale) custom
// property, so they hold steady at any zoom.

export type CanvasItem = MediaItem & {
  /** top-left corner and width in world units; height follows the aspect */
  x: number
  y: number
  w: number
}

type Props = {
  items: CanvasItem[]
  /** inline height at the full 640px column; the board keeps this aspect */
  height?: number
  label?: string
}

type View = { tx: number; ty: number; s: number }
type Mode = 'inline' | 'expanding' | 'expanded' | 'collapsing'

const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'
const DURATION = 520
/** zoom range, relative to the fitted scale */
const MIN_ZOOM = 0.25
const MAX_ZOOM = 8
/** fraction of the viewport kept clear around the fitted content */
const FIT_PAD = 0.08
/** how much of the content must stay on screen when panning, in px */
const KEEP = 96

type Bounds = { minX: number; minY: number; maxX: number; maxY: number }

/** Axis-aligned bounds of the items. */
function boundsOf(items: CanvasItem[]): Bounds {
  const b: Bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  for (const it of items) {
    const h = (it.w * it.height) / it.width
    b.minX = Math.min(b.minX, it.x)
    b.minY = Math.min(b.minY, it.y)
    b.maxX = Math.max(b.maxX, it.x + it.w)
    b.maxY = Math.max(b.maxY, it.y + h)
  }
  return b
}

function fitView(b: Bounds, vw: number, vh: number): View {
  const bw = b.maxX - b.minX
  const bh = b.maxY - b.minY
  const s = Math.min((vw * (1 - 2 * FIT_PAD)) / bw, (vh * (1 - 2 * FIT_PAD)) / bh)
  return { s, tx: (vw - bw * s) / 2 - b.minX * s, ty: (vh - bh * s) / 2 - b.minY * s }
}

/** Keeps at least KEEP px of the content on screen in each axis. */
function clampView(v: View, b: Bounds, vw: number, vh: number): View {
  const minTx = KEEP - b.maxX * v.s
  const maxTx = vw - KEEP - b.minX * v.s
  const minTy = KEEP - b.maxY * v.s
  const maxTy = vh - KEEP - b.minY * v.s
  return {
    s: v.s,
    tx: Math.min(Math.max(v.tx, Math.min(minTx, maxTx)), Math.max(minTx, maxTx)),
    ty: Math.min(Math.max(v.ty, Math.min(minTy, maxTy)), Math.max(minTy, maxTy)),
  }
}

export function CanvasView({ items, height = 440, label = 'Canvas' }: Props) {
  const placeholderRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const [mode, setMode] = useState<Mode>('inline')
  const modeRef = useRef<Mode>('inline')
  modeRef.current = mode
  const [zoomPct, setZoomPct] = useState(100)
  const [grabbing, setGrabbing] = useState(false)

  const bounds = useMemo(() => boundsOf(items), [items])
  const view = useRef<View>({ tx: 0, ty: 0, s: 1 })
  const fit = useRef<View>({ tx: 0, ty: 0, s: 1 })

  const apply = useCallback((v: View) => {
    view.current = v
    const world = worldRef.current
    if (world) {
      world.style.transform = `translate(${v.tx}px, ${v.ty}px) scale(${v.s})`
      world.style.setProperty('--inv', String(1 / v.s))
    }
    setZoomPct(Math.round((v.s / fit.current.s) * 100))
  }, [])

  const stageSize = () => {
    const stage = stageRef.current!
    return { vw: stage.clientWidth, vh: stage.clientHeight }
  }

  // inline: refit whenever the board's own size changes
  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const refit = () => {
      if (modeRef.current !== 'inline') return
      const f = fitView(bounds, stage.clientWidth, stage.clientHeight)
      fit.current = f
      apply(f)
    }
    const ro = new ResizeObserver(refit)
    ro.observe(stage)
    refit()
    return () => ro.disconnect()
  }, [bounds, apply])

  /** Resolves when the stage's rectangle transition ends (with a fallback). */
  const afterTransition = (stage: HTMLElement, done: () => void) => {
    let called = false
    const finish = () => {
      if (called) return
      called = true
      stage.removeEventListener('transitionend', onEnd)
      window.clearTimeout(timer)
      done()
    }
    const onEnd = (e: TransitionEvent) => {
      if (e.target === stage && e.propertyName === 'width') finish()
    }
    stage.addEventListener('transitionend', onEnd)
    const timer = window.setTimeout(finish, DURATION + 80)
  }

  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const setTransitions = (on: boolean) => {
    const stage = stageRef.current
    const world = worldRef.current
    if (!stage || !world) return
    const t = on && !reducedMotion()
    const props = ['top', 'left', 'width', 'height', 'border-radius']
    stage.style.transition = t ? props.map(p => `${p} ${DURATION}ms ${EASE}`).join(', ') : 'none'
    world.style.transition = t ? `transform ${DURATION}ms ${EASE}` : 'none'
  }

  const expand = () => {
    const stage = stageRef.current
    if (!stage || modeRef.current !== 'inline') return
    const r = stage.getBoundingClientRect()
    setMode('expanding')
    // pin the board where it is, then let it grow to the viewport
    setTransitions(false)
    Object.assign(stage.style, {
      position: 'fixed',
      top: `${r.top}px`,
      left: `${r.left}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
      zIndex: '1000',
    })
    void stage.offsetWidth
    requestAnimationFrame(() => {
      setTransitions(true)
      const vw = window.innerWidth
      const vh = window.innerHeight
      Object.assign(stage.style, { top: '0px', left: '0px', width: `${vw}px`, height: `${vh}px`, borderRadius: '0px' })
      const f = fitView(bounds, vw, vh)
      fit.current = f
      apply(f)
      document.documentElement.style.overflowY = 'hidden'
      afterTransition(stage, () => {
        setTransitions(false)
        setMode('expanded')
        stage.focus({ preventScroll: true })
      })
    })
  }

  const collapse = () => {
    const stage = stageRef.current
    const ph = placeholderRef.current
    if (!stage || !ph || modeRef.current !== 'expanded') return
    setMode('collapsing')
    const r = ph.getBoundingClientRect()
    setTransitions(true)
    Object.assign(stage.style, { top: `${r.top}px`, left: `${r.left}px`, width: `${r.width}px`, height: `${r.height}px`, borderRadius: '' })
    const f = fitView(bounds, r.width, r.height)
    fit.current = f
    apply(f)
    document.documentElement.style.overflowY = ''
    afterTransition(stage, () => {
      // back into the flow
      stage.style.cssText = ''
      worldRef.current?.style.removeProperty('transition')
      setMode('inline')
      toggleRef.current?.focus({ preventScroll: true })
    })
  }

  // never leave the page locked if the board unmounts mid-expand
  useEffect(() => () => {
    document.documentElement.style.overflowY = ''
  }, [])

  /* ---- pan and zoom, expanded only ---- */

  const zoomAt = (px: number, py: number, factor: number, animate = false) => {
    const v = view.current
    const { vw, vh } = stageSize()
    const s = Math.min(fit.current.s * MAX_ZOOM, Math.max(fit.current.s * MIN_ZOOM, v.s * factor))
    const k = s / v.s
    const next = clampView({ s, tx: px - (px - v.tx) * k, ty: py - (py - v.ty) * k }, bounds, vw, vh)
    if (animate) animateTo(next)
    else apply(next)
  }

  const panBy = (dx: number, dy: number) => {
    const v = view.current
    const { vw, vh } = stageSize()
    apply(clampView({ s: v.s, tx: v.tx + dx, ty: v.ty + dy }, bounds, vw, vh))
  }

  const animateTo = (next: View) => {
    const world = worldRef.current
    if (!world) return
    if (reducedMotion()) {
      apply(next)
      return
    }
    world.style.transition = `transform ${DURATION * 0.6}ms ${EASE}`
    apply(next)
    window.setTimeout(() => {
      world.style.transition = 'none'
    }, DURATION * 0.6 + 40)
  }

  // wheel: a pinch (ctrl/⌘ + wheel in Chrome and Firefox) zooms about the
  // cursor in either mode; plain scrolling pans only once expanded, so the
  // inline board never hijacks the page scroll
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const onWheel = (e: WheelEvent) => {
      const pinch = e.ctrlKey || e.metaKey
      const m = modeRef.current
      if (m !== 'expanded' && !(m === 'inline' && pinch)) return
      e.preventDefault()
      const r = stage.getBoundingClientRect()
      if (pinch) {
        // a trackpad pinch arrives as many small deltas, a mouse notch as ±100;
        // clamping keeps one notch to about 1.4x instead of leaping to the limit
        const d = Math.max(-35, Math.min(35, e.deltaY))
        zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-d * 0.01))
      } else {
        const k = e.deltaMode === 1 ? 16 : 1
        panBy(-e.deltaX * k, -e.deltaY * k)
      }
    }
    // Safari's pinch: gesturechange carries the scale since gesturestart
    type Gesture = Event & { scale: number; clientX: number; clientY: number }
    let last = 1
    const onGestureStart = (e: Event) => {
      if (modeRef.current !== 'inline' && modeRef.current !== 'expanded') return
      e.preventDefault()
      last = 1
    }
    const onGestureChange = (e: Event) => {
      if (modeRef.current !== 'inline' && modeRef.current !== 'expanded') return
      e.preventDefault()
      const g = e as Gesture
      const r = stage.getBoundingClientRect()
      zoomAt(g.clientX - r.left, g.clientY - r.top, g.scale / last)
      last = g.scale
    }
    stage.addEventListener('wheel', onWheel, { passive: false })
    stage.addEventListener('gesturestart', onGestureStart, { passive: false })
    stage.addEventListener('gesturechange', onGestureChange, { passive: false })
    return () => {
      stage.removeEventListener('wheel', onWheel)
      stage.removeEventListener('gesturestart', onGestureStart)
      stage.removeEventListener('gesturechange', onGestureChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // pointers: one pans, two pinch-zoom about their midpoint
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef<{ dist: number; mid: { x: number; y: number } } | null>(null)
  const moved = useRef(false)

  const localPoint = (e: React.PointerEvent) => {
    const r = stageRef.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const m = modeRef.current
    if ((m !== 'expanded' && m !== 'inline') || e.button !== 0) return
    if ((e.target as HTMLElement).closest('button')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, localPoint(e))
    moved.current = false
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } }
    }
    setGrabbing(true)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const prev = pointers.current.get(e.pointerId)
    if (!prev) return
    const p = localPoint(e)
    pointers.current.set(e.pointerId, p)
    if (pointers.current.size >= 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()]
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      if (pinch.current.dist > 0) zoomAt(mid.x, mid.y, dist / pinch.current.dist)
      panBy(mid.x - pinch.current.mid.x, mid.y - pinch.current.mid.y)
      pinch.current = { dist, mid }
    } else if (pointers.current.size === 1) {
      const dx = p.x - prev.x
      const dy = p.y - prev.y
      if (Math.abs(dx) + Math.abs(dy) > 0) moved.current = true
      panBy(dx, dy)
    }
  }
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinch.current = null
    if (pointers.current.size === 0) setGrabbing(false)
  }

  const onDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const m = modeRef.current
    if ((m !== 'expanded' && m !== 'inline') || (e.target as HTMLElement).closest('button')) return
    const r = stageRef.current!.getBoundingClientRect()
    const px = e.clientX - r.left
    const py = e.clientY - r.top
    // in and out again: past 1.5× fit, a double-click returns to the fit
    if (view.current.s > fit.current.s * 1.5) animateTo(fit.current)
    else zoomAt(px, py, (fit.current.s * 2.5) / view.current.s, true)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (modeRef.current !== 'expanded') return
    if (e.key === 'Escape') {
      e.preventDefault()
      collapse()
    } else if (e.key === '0') {
      animateTo(fit.current)
    } else if (e.key === '=' || e.key === '+') {
      const { vw, vh } = stageSize()
      zoomAt(vw / 2, vh / 2, 1.25, true)
    } else if (e.key === '-') {
      const { vw, vh } = stageSize()
      zoomAt(vw / 2, vh / 2, 0.8, true)
    }
  }

  const expanded = mode === 'expanded'
  const open = mode === 'expanding' || mode === 'expanded'

  return (
    <>
      <div ref={placeholderRef} className="cv" style={{ aspectRatio: `640 / ${height}` }}>
        <div
          ref={stageRef}
          className="cv-stage"
          data-mode={mode}
          data-grabbing={grabbing}
          role="group"
          aria-label={label}
          tabIndex={-1}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onDoubleClick={onDoubleClick}
        >
          <div ref={worldRef} className="cv-world">
            {items.map(it => (
              <Item key={it.src} item={it} />
            ))}
          </div>
          <button
            ref={toggleRef}
            type="button"
            className="cv-toggle"
            aria-label={open ? 'Close canvas' : 'Expand canvas'}
            onClick={() => (modeRef.current === 'inline' ? expand() : collapse())}
          >
            <span className="cv-toggle-icon" data-show={!open}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
              </svg>
            </span>
            <span className="cv-toggle-icon" data-show={open}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" />
              </svg>
            </span>
          </button>
          <button
            type="button"
            className="cv-zoom tabular-nums"
            aria-label="Fit to screen"
            tabIndex={expanded ? 0 : -1}
            onClick={() => animateTo(fit.current)}
          >
            {zoomPct}%
          </button>
        </div>
      </div>
      <div className="cv-backdrop" data-on={open} aria-hidden="true" />
    </>
  )
}

function Item({ item }: { item: CanvasItem }) {
  const [loaded, setLoaded] = useState(false)
  const h = (item.w * item.height) / item.width
  return (
    <figure className="cv-item" style={{ left: item.x, top: item.y, width: item.w, height: h }}>
      <span className={`media-wrapper${loaded ? '' : ' media-skeleton'}`}>
        {item.video ? (
          <video
            src={item.src}
            width={item.width}
            height={item.height}
            autoPlay
            muted
            loop
            playsInline
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
      {item.caption && <figcaption className="cv-label">{item.caption}</figcaption>}
    </figure>
  )
}
