'use client'

import { useEffect, useRef } from 'react'

// Gooey liquid-chrome border for article media. A canvas sits behind the
// media card; ink balls anchored along its edges merge with a base rim into
// one wavy liquid frame, shaded with the same Y2K chrome model as the
// home-page goo: a small density field is treated as a height map and shaded
// per pixel — white rim at the silhouette, dark mirror band inside it,
// silver core, sky/ground tilt, specular glint and fresnel edge. The cursor
// pulls nearby balls toward it like glue — the rim stretches, follows, and
// snaps back with a wobble. The simulation and shading only run while the
// pointer is near (and while settling), so idle images cost nothing.

/** Canvas margin around the media — must cover the max glue stretch plus
 *  the biggest ball and the blur bleed, or the goo clips at the edge */
const M = 56
/** How far the continuous base rim extends beyond the media edge */
const RIM = 3
/** Perimeter ball spacing; anchors sit right on the media edge */
const SPACING = 24
/** Ball radius range (deterministic per index, so no hydration jitter) */
const R_MIN = 7
const R_VAR = 3
/** Spring back to the anchor, and velocity damping — soft enough that the
 *  glue pull visibly wins while the cursor is near */
const K_ANCHOR = 30
const DAMP = 4.5
/** Glue pull toward the cursor: range, strength, and max stretch */
const RANGE = 130
const ATTRACT = 1500
const MAX_STRETCH = 34

/** Shading constants — these mirror the chrome model in BlobField. The
 *  field runs at device resolution, 1:1 with the canvas backing store, so
 *  nothing is ever upscaled; the shade loop skips the region hidden under
 *  the media card, so only the thin border band pays for it. */
const FIELD_SAT = 0.55
/** Steeper than BlobField's because gradients here are per device pixel */
const FIELD_STEEP = 9
const HALF_X = -0.3586
const HALF_Y = -0.3586
const HALF_Z = 0.8619
const SHINE_P = 36
const SPEC = 1.4
const CHROME_RIM = 0.87
const CHROME_DARK = 0.05
const CHROME_CORE = 0.84
const CHROME_SETTLE = 0.6
const SHINE_MAX = 0.9
const CHROME_X0 = 0.28
const CHROME_XW = 0.4
const TILT_FLOOR = 0.38
const TILT_W = 0.5
const FRESNEL = 0.18

type BorderBall = { ax: number; ay: number; x: number; y: number; vx: number; vy: number; r: number }
type Rect = { x: number; y: number; w: number; h: number }

/**
 * `targets`: optional CSS selector for the cards to border, measured within
 * the host. Without it the host's own box is the single card. With it (e.g.
 * a side-by-side row targeting its `.media-wrapper`s) every card renders
 * into ONE shared field, so the facing rims of adjacent cards fuse into a
 * single liquid seam.
 */
export function GooBorder({ targets }: { targets?: string }) {
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

    let balls: BorderBall[] = []
    let rects: Rect[] = []
    let W = 0
    let H = 0
    let fw = 0
    let fh = 0
    let hbuf = new Float32Array(0)
    let shadeImg: ImageData | null = null

    const measure = (): Rect[] => {
      if (!targets) return [{ x: 0, y: 0, w: host.clientWidth, h: host.clientHeight }]
      const hb = host.getBoundingClientRect()
      return Array.from(host.querySelectorAll(targets)).map(el => {
        const b = (el as HTMLElement).getBoundingClientRect()
        return { x: b.left - hb.left, y: b.top - hb.top, w: b.width, h: b.height }
      })
    }

    const build = () => {
      W = host.clientWidth
      H = host.clientHeight
      rects = measure()
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
      // anchors along each card's perimeter, right on its edge
      balls = []
      const seed = (i: number) => (((i + 1) * 2654435761) >>> 16) % 1000 / 1000
      const add = (x: number, y: number) => {
        const i = balls.length
        balls.push({ ax: x, ay: y, x, y, vx: 0, vy: 0, r: R_MIN + R_VAR * seed(i) })
      }
      for (const r of rects) {
        const nx = Math.max(2, Math.round(r.w / SPACING))
        const ny = Math.max(2, Math.round(r.h / SPACING))
        for (let i = 0; i <= nx; i++) {
          add(r.x + (r.w * i) / nx, r.y)
          add(r.x + (r.w * i) / nx, r.y + r.h)
        }
        for (let i = 1; i < ny; i++) {
          add(r.x, r.y + (r.h * i) / ny)
          add(r.x + r.w, r.y + (r.h * i) / ny)
        }
      }
      draw()
    }

    const draw = () => {
      if (!shadeImg) return
      // 1. density: base rim slab + balls, then softened — the blur is what
      //    fuses them into one liquid silhouette
      fctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      fctx.clearRect(0, 0, fw / dpr, fh / dpr)
      fctx.fillStyle = '#fff'
      fctx.beginPath()
      for (const r of rects) {
        fctx.roundRect(M + r.x - RIM, M + r.y - RIM, r.w + 2 * RIM, r.h + 2 * RIM, 16)
      }
      // bridge narrow gaps between neighbouring cards so the shared seam
      // reads as one solid strip of goo, not two rims with pockets between
      for (let a = 0; a < rects.length; a++) {
        for (let b2 = a + 1; b2 < rects.length; b2++) {
          const A = rects[a].x <= rects[b2].x ? rects[a] : rects[b2]
          const B = rects[a].x <= rects[b2].x ? rects[b2] : rects[a]
          const gap = B.x - (A.x + A.w)
          const y0 = Math.max(A.y, B.y)
          const y1 = Math.min(A.y + A.h, B.y + B.h)
          if (gap > 0 && gap < 30 && y1 > y0) {
            fctx.rect(M + A.x + A.w - 4, M + y0 + 2, gap + 8, y1 - y0 - 4)
          }
        }
      }
      for (const b of balls) {
        fctx.moveTo(M + b.x + b.r, M + b.y)
        fctx.arc(M + b.x, M + b.y, b.r, 0, Math.PI * 2)
      }
      fctx.fill()
      fbctx.clearRect(0, 0, fw, fh)
      fbctx.filter = `blur(${2.5 * dpr}px)`
      fbctx.drawImage(field, 0, 0)
      fbctx.filter = 'none'
      // 2. shade as a height field with the home goo's chrome model,
      //    skipping the regions hidden under the media cards
      const skips = rects.map(r => ({
        x0: (M + r.x + 12) * dpr,
        x1: (M + r.x + r.w - 12) * dpr,
        y0: (M + r.y + 12) * dpr,
        y1: (M + r.y + r.h - 12) * dpr,
      }))
      const src = fbctx.getImageData(0, 0, fw, fh).data
      for (let i = 0, m = fw * fh; i < m; i++) {
        const v = src[i * 4 + 3] / (255 * FIELD_SAT)
        hbuf[i] = v / (1.4 + v)
      }
      const od = shadeImg.data
      for (let y = 1; y < fh - 1; y++) {
        for (let x = 1; x < fw - 1; x++) {
          let hidden = false
          for (let k = 0; k < skips.length; k++) {
            const s = skips[k]
            if (x > s.x0 && x < s.x1 && y > s.y0 && y < s.y1) {
              x = Math.floor(s.x1) // fast-forward across the hidden interior
              hidden = true
              break
            }
          }
          if (hidden) continue
          const i = y * fw + x
          const c = hbuf[i]
          let lum = 0
          let mask = 0
          if (c > 0.15) {
            const gx = (hbuf[i + 1] - hbuf[i - 1]) * FIELD_STEEP
            const gy = (hbuf[i + fw] - hbuf[i - fw]) * FIELD_STEEP
            const inv = 1 / Math.sqrt(gx * gx + gy * gy + 1)
            const ny2 = -gy * inv
            const nz = inv
            const cx = (c - CHROME_X0) / CHROME_XW
            let band
            if (cx < 0.14) {
              let t = cx < 0 ? 0 : cx / 0.14
              t = t * t * (3 - 2 * t)
              band = CHROME_RIM - (CHROME_RIM - CHROME_DARK) * t
            } else if (cx < 0.5) {
              let t = (cx - 0.14) / 0.36
              t = t * t * (3 - 2 * t)
              band = CHROME_DARK + (CHROME_CORE - CHROME_DARK) * t
            } else {
              let t = (cx - 0.5) / 0.5
              if (t > 1) t = 1
              t = t * t * (3 - 2 * t)
              band = CHROME_CORE - (CHROME_CORE - CHROME_SETTLE) * t
            }
            const s = -2 * nz * ny2
            let tilt = (s + 0.25) / TILT_W
            if (tilt < 0) tilt = 0
            else if (tilt > 1) tilt = 1
            tilt = tilt * tilt * (3 - 2 * tilt)
            lum = band * (TILT_FLOOR + (1 - TILT_FLOOR) * tilt)
            const dotH = (-gx * HALF_X - gy * HALF_Y + HALF_Z) * inv
            if (dotH > 0) lum += Math.pow(dotH, SHINE_P) * SPEC
            const g = 1 - nz
            lum += g * g * FRESNEL
            if (lum > SHINE_MAX) lum = SHINE_MAX
            mask = (c - 0.26) / 0.04
            if (mask < 0) mask = 0
            else if (mask > 1) mask = 1
            mask = mask * mask * (3 - 2 * mask)
          }
          const l = lum * 255
          od[i * 4] = l
          od[i * 4 + 1] = l
          od[i * 4 + 2] = l
          od[i * 4 + 3] = mask * 255
        }
      }
      fbctx.putImageData(shadeImg, 0, 0)
      // 3. upscale onto the visible canvas
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
        // glue stretches only so far before it lets go
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
      const rect = host.getBoundingClientRect()
      pointer.x = e.clientX - rect.left
      pointer.y = e.clientY - rect.top
      pointer.active = true
      wake()
    }
    const onLeave = () => {
      pointer.active = false
      wake()
    }

    const ro = new ResizeObserver(build)
    ro.observe(host)
    build()
    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [targets])

  return (
    <>
      {/* invisible hit area extending past the card, so the pointer keeps
          driving the goo where the pull is actually visible — outside the
          edge; as a child it just widens the host's event region */}
      <span aria-hidden="true" style={{ position: 'absolute', inset: -M, zIndex: 0 }} />
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
        }}
      />
    </>
  )
}
