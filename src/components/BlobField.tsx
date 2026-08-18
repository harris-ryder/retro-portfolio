'use client'

import { useEffect, useRef } from 'react'

// Gooey metaball background. One fixed canvas draws soft white balls on black;
// CSS blur + extreme contrast thresholds them into merging liquid blobs, and
// mix-blend-mode: difference inverts whatever sits beneath a blob — the white
// page turns black (the blob) and dark text on top turns white — while the
// black areas of the canvas leave the page untouched.
//
// Motion is a pure N-body simulation — no scripted targets or random moves.
// Balls attract each other with gentle short-range gravity, repel when they
// overlap too far (so a merged mass packs like a liquid instead of collapsing
// to a point), and feel a very weak pull toward the global centre of mass so
// separated islands always drift together. Left alone, everything ends as one
// large blob; the mouse is the only thing that breaks it apart.

/** Canvas extends past the viewport so the blur never fades at screen edges */
const BLEED = 48
/** Balls smaller than ~1.3× the blur radius get thresholded out of existence */
const MIN_R = 8

/** Pairwise gravity acts inside this range (also the spatial-grid cell size) */
const GRAV_R = 150
const G = 9000
const SOFT = 40
/** Cap on per-pair pull so close approaches stay gentle */
const PULL_CAP = 120
/**
 * Cap on each ball's TOTAL gravity. Without it, hundreds of neighbours sum to
 * a crush no contact force can resist and the mass collapses to a point —
 * clamping the sum (but never the overlap repulsion) makes packing win.
 */
const A_MAX = 200
/** Balls push apart when closer than this fraction of touching distance;
 *  deeper overlap packs the surface denser, so merged masses read smooth */
const PACK = 0.8
const K_SEP = 90
/** Weak global pull toward the centre of mass — how lone islands find the rest */
const COM_PULL = 30
const DAMP = 2.2
const V_MAX = 400
/** Stiff walls at the visible screen edges — blobs squish against them */
const WALL = 50

const REPEL_R = 160
const REPEL = 3500

type Ball = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  m: number
  /** Gravity accumulator for the frame, clamped to A_MAX before integrating */
  ax: number
  ay: number
}

export function BlobField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let W = 0
    let H = 0
    const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo)

    let balls: Ball[] = []
    let heads = new Int32Array(0)
    let next = new Int32Array(0)

    const pointer = { x: -1e4, y: -1e4, active: false }

    const size = () => {
      W = canvas.clientWidth
      H = canvas.clientHeight
      canvas.width = W
      canvas.height = H
    }

    const init = () => {
      size()
      const count = Math.round(Math.min(Math.max((W * H) / 1000, 800), 2600))
      balls = Array.from({ length: count }, () => {
        let r = MIN_R + Math.pow(Math.random(), 2) * 7.5
        if (Math.random() < 0.08) r *= 1.25
        return {
          x: rand(BLEED, W - BLEED),
          y: rand(BLEED, H - BLEED),
          vx: 0,
          vy: 0,
          r,
          m: (r * r) / 64,
          ax: 0,
          ay: 0,
        }
      })
      next = new Int32Array(count)
    }

    /** Gravity + separation for one pair, each applied once per frame */
    const pair = (a: Ball, b: Ball, dt: number) => {
      let dx = b.x - a.x
      let dy = b.y - a.y
      const d2 = dx * dx + dy * dy
      if (d2 === 0 || d2 > GRAV_R * GRAV_R) return
      const d = Math.sqrt(d2)
      dx /= d
      dy /= d
      const contact = PACK * (a.r + b.r)
      if (d < contact) {
        // contact repulsion applies directly — it must always beat gravity
        const f = Math.min((contact - d) * K_SEP, 500) * dt
        a.vx -= dx * f
        a.vy -= dy * f
        b.vx += dx * f
        b.vy += dy * f
      } else {
        // gravity only accumulates; the sum is clamped before integrating
        const base = G / (d + SOFT)
        const fa = Math.min(base * b.m, PULL_CAP)
        const fb = Math.min(base * a.m, PULL_CAP)
        a.ax += dx * fa
        a.ay += dy * fa
        b.ax -= dx * fb
        b.ay -= dy * fb
      }
    }

    const step = (dt: number) => {
      const n = balls.length

      // centre of mass
      let comX = 0
      let comY = 0
      let mass = 0
      for (const b of balls) {
        comX += b.x * b.m
        comY += b.y * b.m
        mass += b.m
        b.ax = 0
        b.ay = 0
      }
      comX /= mass
      comY /= mass

      // bin into a uniform grid so gravity only scans neighbouring cells
      const cols = Math.max(1, Math.ceil(W / GRAV_R))
      const rows = Math.max(1, Math.ceil(H / GRAV_R))
      if (heads.length !== cols * rows) heads = new Int32Array(cols * rows)
      heads.fill(-1)
      for (let i = 0; i < n; i++) {
        const b = balls[i]
        const cx = Math.min(Math.max((b.x / GRAV_R) | 0, 0), cols - 1)
        const cy = Math.min(Math.max((b.y / GRAV_R) | 0, 0), rows - 1)
        const c = cy * cols + cx
        next[i] = heads[c]
        heads[c] = i
      }

      // each pair once: rest of own cell chain + the four forward neighbours
      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          for (let i = heads[cy * cols + cx]; i !== -1; i = next[i]) {
            const a = balls[i]
            for (let j = next[i]; j !== -1; j = next[j]) pair(a, balls[j], dt)
            for (let k = 0; k < 4; k++) {
              const nx = cx + (k === 1 ? -1 : k === 0 || k === 3 ? 1 : 0)
              const ny = k === 0 ? cy : cy + 1
              if (nx < 0 || nx >= cols || ny >= rows) continue
              for (let j = heads[ny * cols + nx]; j !== -1; j = next[j]) pair(a, balls[j], dt)
            }
          }
        }
      }

      const damp = Math.exp(-DAMP * dt)
      for (const b of balls) {
        // terminal gravity: however many neighbours pull, the sum stays gentle
        const am = Math.hypot(b.ax, b.ay)
        if (am > 0) {
          const k = Math.min(am, A_MAX) / am
          b.vx += b.ax * k * dt
          b.vy += b.ay * k * dt
        }

        // faint drift toward everyone else, so far-flung islands still converge
        const gx = comX - b.x
        const gy = comY - b.y
        const gd = Math.hypot(gx, gy)
        if (gd > 1) {
          const f = (COM_PULL * Math.min(gd / 300, 1) * dt) / gd
          b.vx += gx * f
          b.vy += gy * f
        }

        if (pointer.active) {
          const dx = b.x - pointer.x
          const dy = b.y - pointer.y
          const d = Math.hypot(dx, dy)
          if (d < REPEL_R && d > 0.001) {
            const f = (REPEL * (1 - d / REPEL_R) * dt) / d
            b.vx += dx * f
            b.vy += dy * f
          }
        }

        // the canvas overhangs the viewport by BLEED, so the true screen edges
        // sit at [BLEED, W - BLEED]; walls include the radius so the blob's rim
        // presses the edge instead of its centre
        const loX = BLEED + b.r
        const hiX = W - BLEED - b.r
        const loY = BLEED + b.r
        const hiY = H - BLEED - b.r
        if (b.x < loX) b.vx += (loX - b.x) * WALL * dt
        else if (b.x > hiX) b.vx -= (b.x - hiX) * WALL * dt
        if (b.y < loY) b.vy += (loY - b.y) * WALL * dt
        else if (b.y > hiY) b.vy -= (b.y - hiY) * WALL * dt

        b.vx *= damp
        b.vy *= damp
        const v = Math.hypot(b.vx, b.vy)
        if (v > V_MAX) {
          b.vx *= V_MAX / v
          b.vy *= V_MAX / v
        }
        b.x += b.vx * dt
        b.y += b.vy * dt
      }
    }

    const draw = () => {
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      for (const b of balls) {
        // slight visual padding beyond the physics radius: neighbours fuse
        // deeper and the two-pass goo filter doesn't erode lone small balls
        const r = b.r + 1.5
        ctx.moveTo(b.x + r, b.y)
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2)
      }
      ctx.fill()
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    init()

    if (reduced) {
      // No animation: paint a still frame of loosely gathered groups
      const centers = Array.from({ length: 12 }, () => ({
        x: rand(BLEED + 80, W - BLEED - 80),
        y: rand(BLEED + 80, H - BLEED - 80),
      }))
      for (const b of balls) {
        let c = centers[0]
        let best = Infinity
        for (const o of centers) {
          const d = (o.x - b.x) ** 2 + (o.y - b.y) ** 2
          if (d < best) { best = d; c = o }
        }
        const a = rand(0, Math.PI * 2)
        const d = Math.sqrt(Math.random()) * 60
        b.x = c.x + Math.cos(a) * d
        b.y = c.y + Math.sin(a) * d
      }
      draw()
      window.addEventListener('resize', size)
      return () => window.removeEventListener('resize', size)
    }

    let raf = 0
    let prev: number | null = null

    const frame = (now: number) => {
      const dt = Math.min(prev === null ? 0.016 : (now - prev) / 1000, 0.05)
      prev = now
      step(dt)
      draw()
      raf = requestAnimationFrame(frame)
    }

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX + BLEED
      pointer.y = e.clientY + BLEED
      pointer.active = true
    }
    const onLeave = () => {
      pointer.active = false
      pointer.x = -1e4
      pointer.y = -1e4
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onLeave)
    window.addEventListener('resize', size)
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
      window.removeEventListener('resize', size)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed z-30"
      style={{
        top: -BLEED,
        left: -BLEED,
        width: `calc(100vw + ${BLEED * 2}px)`,
        height: `calc(100lvh + ${BLEED * 2}px)`,
        // two goo passes: the first merges balls into masses, the second
        // re-blurs and re-thresholds the silhouette, rounding off the
        // ball-by-ball scallops on big merged blobs
        filter: 'blur(6.5px) contrast(30) blur(5px) contrast(25)',
        mixBlendMode: 'difference',
      }}
    />
  )
}
