'use client'
/* Stands in for the mouse cursor while a demo is active (on screen). It
   draws a replica of the system arrow pointer — so it reads as the normal
   cursor — but rotates around its tip to aim relative to the active demo.
   The tip is pinned to the real pointer position (its hotspot). Rotation
   eases smoothly (shortest path) rather than snapping. When no demo is
   active, or the pointer leaves the window, the native cursor is restored. */
import { useEffect, useRef } from 'react'
import { subscribeBadge } from './focusManager'

/* The arrow art (below) points up-and-left along its spine — the angle,
   in screen coords, from tail to tip. */
const BASE_DEG = -116
/* Aim the tip at the demo (0 = point at it, 180 = point away). */
const AIM_OFFSET = 0
/* Orientation the cursor is seeded to the instant it's swapped in —
   pointing straight up — before it eases round to aim at the demo. */
const R_UP = -90 - BASE_DEG
/* Rotation easing (also restored after the no-animation seed). */
const ARROW_TRANSITION = 'transform 0.45s cubic-bezier(0.22, 0.61, 0.36, 1)'
/* Arrow geometry in viewBox units; the tip is the hotspot pinned to the
   pointer. SCALE trims the rendered size to match the native cursor. */
const VB_W = 17
const VB_H = 24
const TIP_X = 2
const TIP_Y = 2
const SCALE = 0.9

export function TryMeCursor() {
  const rootRef = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<SVGSVGElement>(null)
  const mouse = useRef({ x: 0, y: 0, seen: false })
  const target = useRef<HTMLElement | null>(null)
  const rot = useRef(0) // last applied rotation, unwrapped so easing takes the short path
  const active = useRef(false) // is the cursor currently swapped in?

  useEffect(() => {
    const render = () => {
      const root = rootRef.current
      const arrow = arrowRef.current
      if (!root || !arrow) return

      const el = target.current
      if (!el || !mouse.current.seen) {
        root.style.opacity = '0'
        document.body.classList.remove('wf-cursor-on')
        active.current = false
        return
      }

      const { x, y } = mouse.current
      root.style.transform = `translate(${x}px, ${y}px)`
      root.style.opacity = '1'
      document.body.classList.add('wf-cursor-on')

      // Just swapped in: seed the orientation to "pointing up" with no
      // animation, so the ease below runs from there rather than snapping.
      if (!active.current) {
        active.current = true
        rot.current = R_UP
        arrow.style.transition = 'none'
        arrow.style.transform = `rotate(${R_UP}deg)`
        void arrow.getBoundingClientRect() // commit the start orientation
        arrow.style.transition = ARROW_TRANSITION
      }

      const t = el.getBoundingClientRect()
      const deg =
        (Math.atan2(t.top + t.height / 2 - y, t.left + t.width / 2 - x) * 180) /
        Math.PI
      // unwrap to the nearest equivalent of the last rotation → shortest turn
      const want = deg - BASE_DEG + AIM_OFFSET
      const prev = rot.current
      rot.current = prev + ((((want - prev) % 360) + 540) % 360) - 180
      arrow.style.transform = `rotate(${rot.current}deg)`
    }

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY, seen: true }
      render()
    }
    const onLeave = (e: MouseEvent) => {
      if (e.relatedTarget === null) {
        mouse.current.seen = false
        render()
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseout', onLeave)
    const unsub = subscribeBadge((el) => {
      target.current = el
      render()
    })

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseout', onLeave)
      unsub()
      document.body.classList.remove('wf-cursor-on')
    }
  }, [])

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[100] opacity-0"
      style={{ willChange: 'transform' }}
    >
      <svg
        ref={arrowRef}
        width={VB_W * SCALE}
        height={VB_H * SCALE}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        fill="none"
        className="absolute"
        style={{
          left: -TIP_X * SCALE,
          top: -TIP_Y * SCALE,
          transformOrigin: `${TIP_X * SCALE}px ${TIP_Y * SCALE}px`,
          transition: ARROW_TRANSITION,
          filter: 'drop-shadow(0 0.5px 1px rgba(0,0,0,0.28))',
        }}
      >
        <path
          d="M2 2 L2 20 L7 15 L10 22 L13 21 L10 14 L16 14 Z"
          fill="#000000"
          stroke="#ffffff"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
      <span className="absolute left-[16px] top-[12px] whitespace-nowrap text-[15px] font-normal leading-none text-neutral-800">
        Try me
      </span>
    </div>
  )
}
