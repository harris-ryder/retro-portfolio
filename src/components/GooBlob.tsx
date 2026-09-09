'use client'

import { useEffect, useRef } from 'react'
import { shadeChrome, toHeights } from '@/lib/goo'

// A slime button surface: a blob of liquid chrome filling its host element,
// drawn on a canvas behind the host's own content. The host's box becomes a
// rounded slab (a circle or a pill, whichever its proportions make), with
// ink balls anchored around its edge so the outline wobbles, and the whole
// thing is shaded with the home-page goo's chrome model. A nearby cursor
// pulls the edge balls toward it like glue, so the button reaches for the
// pointer and snaps back with a wobble. The pointer is watched on the window
// (the reach extends past the host's box, which stays the only click target)
// and the simulation only runs while it is near or the goo is settling, so an
// idle button costs nothing. The host needs position: relative and its
// content a z-index above 0.

/** Canvas margin around the host — max glue stretch plus a ball plus the blur bleed */
const M = 40
/** How far the slab extends past the host's edge */
const RIM = 2
/** Edge ball spacing and radius range (deterministic per index) */
const SPACING = 9
const R_MIN = 4.5
const R_VAR = 1.5
/** Spring back to the anchor, and velocity damping */
const K_ANCHOR = 34
const DAMP = 4.5
/** Glue pull toward the cursor: range, strength, and max stretch */
const RANGE = 110
const ATTRACT = 1400
const MAX_STRETCH = 18

type Ball = { ax: number; ay: number; x: number; y: number; vx: number; vy: number; r: number }

/** Points about `spacing` apart around a w×h rounded rectangle of corner radius rr. */
function perimeter(w: number, h: number, rr: number, spacing: number): [number, number][] {
  // trace the outline as a fine polyline (the straight edges are the runs
  // between consecutive corner arcs), then resample it by arc length
  const pts: [number, number][] = []
  const arc = (cx: number, cy: number, a0: number, a1: number) => {
    const steps = 12
    for (let i = 0; i <= steps; i++) {
      const a = a0 + ((a1 - a0) * i) / steps
      pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)])
    }
  }
  arc(w - rr, rr, -Math.PI / 2, 0)
  arc(w - rr, h - rr, 0, Math.PI / 2)
  arc(rr, h - rr, Math.PI / 2, Math.PI)
  arc(rr, rr, Math.PI, Math.PI * 1.5)
  pts.push(pts[0])
  const seg: number[] = []
  let total = 0
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
    seg.push(d)
    total += d
  }
  const n = Math.max(4, Math.round(total / spacing))
  const out: [number, number][] = []
  let acc = 0
  let i = 1
  for (let k = 0; k < n; k++) {
    const target = (total * k) / n
    while (i < seg.length && acc + seg[i - 1] < target) {
      acc += seg[i - 1]
      i++
    }
    const t = seg[i - 1] > 0 ? (target - acc) / seg[i - 1] : 0
    out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t])
  }
  return out
}

export function GooBlob() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    const ctx = canvas?.getContext('2d')
    if (!canvas || !host || !ctx) return

    const field = document.createElement('canvas')
    const fctx = field.getContext('2d')
    const fieldBlur = document.createElement('canvas')
    const fbctx = fieldBlur.getContext('2d', { willReadFrequently: true })
    if (!fctx || !fbctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let balls: Ball[] = []
    let W = 0
    let H = 0
    let rr = 0
    let fw = 0
    let fh = 0
    let hbuf = new Float32Array(0)
    let shadeImg: ImageData | null = null

    const build = () => {
      W = host.clientWidth
      H = host.clientHeight
      if (!W || !H) return
      rr = Math.min(W, H) / 2
      const cw = W + 2 * M
      const ch = H + 2 * M
      canvas.width = cw * dpr
      canvas.height = ch * dpr
      fw = Math.max(4, Math.round(cw * dpr))
      fh = Math.max(4, Math.round(ch * dpr))
      field.width = fw
      field.height = fh
      fieldBlur.width = fw
      fieldBlur.height = fh
      hbuf = new Float32Array(fw * fh)
      shadeImg = fbctx.createImageData(fw, fh)
      const seed = (i: number) => (((i + 1) * 2654435761) >>> 16) % 1000 / 1000
      balls = perimeter(W, H, rr, SPACING).map(([x, y], i) => ({ ax: x, ay: y, x, y, vx: 0, vy: 0, r: R_MIN + R_VAR * seed(i) }))
      draw()
    }

    const draw = () => {
      if (!shadeImg) return
      // 1. density: the slab, denser along its middle so the surface domes,
      //    plus the edge balls; the blur fuses them into one silhouette
      fctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      fctx.clearRect(0, 0, fw / dpr, fh / dpr)
      const dome = fctx.createLinearGradient(0, M, 0, M + H)
      dome.addColorStop(0, 'rgba(255,255,255,0.7)')
      dome.addColorStop(0.5, 'rgba(255,255,255,1)')
      dome.addColorStop(1, 'rgba(255,255,255,0.7)')
      fctx.fillStyle = dome
      fctx.beginPath()
      fctx.roundRect(M - RIM, M - RIM, W + 2 * RIM, H + 2 * RIM, rr + RIM)
      fctx.fill()
      fctx.fillStyle = '#fff'
      fctx.beginPath()
      for (const b of balls) {
        fctx.moveTo(M + b.x + b.r, M + b.y)
        fctx.arc(M + b.x, M + b.y, b.r, 0, Math.PI * 2)
      }
      fctx.fill()
      fbctx.clearRect(0, 0, fw, fh)
      fbctx.filter = `blur(${3.2 * dpr}px)`
      fbctx.drawImage(field, 0, 0)
      fbctx.filter = 'none'
      // 2. shade the whole blob as a height field with the chrome model
      const src = fbctx.getImageData(0, 0, fw, fh).data
      toHeights(src, hbuf)
      shadeChrome(hbuf, shadeImg.data, fw, fh)
      fbctx.putImageData(shadeImg, 0, 0)
      // 3. onto the visible canvas
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(fieldBlur, 0, 0, fw, fh, 0, 0, canvas.width, canvas.height)
    }

    const pointer = { x: 0, y: 0, active: false }
    let raf = 0
    let prev = 0
    let running = false

    const step = (dt: number) => {
      let settled = !pointer.active
      for (const b of balls) {
        if (pointer.active) {
          const dx = pointer.x - b.x
          const dy = pointer.y - b.y
          const d = Math.hypot(dx, dy)
          if (d < RANGE && d > 0.001) {
            const f = (ATTRACT * (1 - d / RANGE) * dt) / d
            b.vx += dx * f
            b.vy += dy * f
          }
        }
        b.vx += (b.ax - b.x) * K_ANCHOR * dt
        b.vy += (b.ay - b.y) * K_ANCHOR * dt
        const damp = Math.exp(-DAMP * dt)
        b.vx *= damp
        b.vy *= damp
        b.x += b.vx * dt
        b.y += b.vy * dt
        const ox = b.x - b.ax
        const oy = b.y - b.ay
        const od = Math.hypot(ox, oy)
        if (od > MAX_STRETCH) {
          b.x = b.ax + (ox / od) * MAX_STRETCH
          b.y = b.ay + (oy / od) * MAX_STRETCH
        }
        if (od > 0.4 || Math.abs(b.vx) + Math.abs(b.vy) > 2) settled = false
      }
      return settled
    }

    const frame = (now: number) => {
      const dt = Math.min((now - prev) / 1000 || 0.016, 0.05)
      prev = now
      const settled = step(dt)
      draw()
      if (settled) {
        running = false
        return
      }
      raf = requestAnimationFrame(frame)
    }

    const wake = () => {
      if (running || reduced) return
      running = true
      prev = performance.now()
      raf = requestAnimationFrame(frame)
    }

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      const near = x > -RANGE && y > -RANGE && x < r.width + RANGE && y < r.height + RANGE
      if (near) {
        pointer.x = x
        pointer.y = y
        pointer.active = true
        wake()
      } else if (pointer.active) {
        pointer.active = false
        wake()
      }
    }
    const onLeave = () => {
      if (pointer.active) {
        pointer.active = false
        wake()
      }
    }

    const ro = new ResizeObserver(build)
    ro.observe(host)
    build()
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <canvas
      aria-hidden="true"
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: -M,
        left: -M,
        width: `calc(100% + ${M * 2}px)`,
        height: `calc(100% + ${M * 2}px)`,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
