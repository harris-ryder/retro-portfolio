'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/** CSS px per dither block */
const CELL = 12
/** Dissolve length; the opening audio runs 3.4s so the reveal lands inside it */
const REVEAL_MS = 2400
const REVEAL_MS_REDUCED = 600
/** How long a single block spends fading, in progress units */
const FADE = 0.1
/** Palette steps per second while the field shimmers */
const COLOR_CYCLE = 2.4

/** Ordered-dither matrix — gives the dissolve its crunchy pixel texture */
const BAYER8 = [
  [ 0, 32,  8, 40,  2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44,  4, 36, 14, 46,  6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [ 3, 35, 11, 43,  1, 33,  9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47,  7, 39, 13, 45,  5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
]

/** Ends where it starts, so stepping through it never jumps hue */
const PALETTE: readonly (readonly [number, number, number])[] = [
  [15, 34, 84],
  [22, 61, 140],
  [37, 110, 190],
  [96, 165, 220],
  [167, 232, 198],
  [78, 199, 154],
  [45, 122, 198],
]
/** Blocks flash this on their way out */
const EDGE: readonly [number, number, number] = [214, 245, 226]

function hash(x: number, y: number) {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}

/** Smoothed value noise over the block grid */
function noise(x: number, y: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const a = hash(xi, yi)
  const b = hash(xi + 1, yi)
  const c = hash(xi, yi + 1)
  const d = hash(xi + 1, yi + 1)
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v
}

type Grid = {
  cols: number
  rows: number
  /** Progress value at which each block finishes clearing */
  thresholds: Float32Array
  colors: Uint8Array
  phases: Float32Array
  buf: ImageData
  off: HTMLCanvasElement
  offCtx: CanvasRenderingContext2D
}

function makeGrid(cols: number, rows: number): Grid | null {
  const off = document.createElement('canvas')
  off.width = cols
  off.height = rows
  const offCtx = off.getContext('2d')
  if (!offCtx) return null

  const n = cols * rows
  const thresholds = new Float32Array(n)
  const colors = new Uint8Array(n)
  const hues = new Float32Array(n)
  const phases = new Float32Array(n)
  const cx = (cols - 1) / 2
  const cy = (rows - 1) / 2
  const maxR = Math.hypot(cx, cy) || 1

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col
      // Soft blobs plus a finer octave: the shape the dissolve follows
      const blob =
        0.66 * noise(col * 0.045, row * 0.045) +
        0.34 * noise(col * 0.13 + 31.7, row * 0.13 + 11.3)
      // Centre-out bias, so the site opens from the middle of the screen
      const radial = Math.hypot(col - cx, row - cy) / maxR
      const ordered = BAYER8[row & 7][col & 7] / 64
      thresholds[i] = 0.38 * blob + 0.46 * radial + 0.12 * ordered + 0.04 * hash(col + 7, row + 13)
      // Colour drawn from its own coarse noise, so hues sit in regions
      hues[i] = noise(col * 0.028 + 101.5, row * 0.028 + 57.2)
      phases[i] = hash(col + 301, row + 503)
    }
  }

  // Rank the blocks and spread them evenly across the progress range. The field
  // above is bell-shaped, so using it raw would stall the dissolve at both ends
  // and dump most of the reveal into one instant; ranking keeps the pattern
  // identical but clears blocks at a steady rate.
  const order = new Uint32Array(n)
  for (let i = 0; i < n; i++) order[i] = i
  order.sort((a, b) => thresholds[a] - thresholds[b])
  for (let rank = 0; rank < n; rank++) {
    thresholds[order[rank]] = 0.02 + 0.98 * (rank / Math.max(n - 1, 1))
  }

  // Same trick for hue: give every palette entry an equal share of the screen.
  // The shimmer rotates all blocks through the palette together, so equal shares
  // keep overall brightness constant instead of pulsing the whole screen.
  order.sort((a, b) => hues[a] - hues[b])
  for (let rank = 0; rank < n; rank++) {
    colors[order[rank]] = Math.min(PALETTE.length - 1, Math.floor((rank / n) * PALETTE.length))
  }

  return { cols, rows, thresholds, colors, phases, buf: offCtx.createImageData(cols, rows), off, offCtx }
}

function render(grid: Grid, ctx: CanvasRenderingContext2D, p: number, time: number) {
  const { cols, rows, thresholds, colors, phases, buf } = grid
  const data = buf.data
  const n = cols * rows

  for (let i = 0; i < n; i++) {
    const o = i * 4
    const d = thresholds[i] - p
    if (d <= 0) {
      data[o + 3] = 0
      continue
    }
    const step = Math.floor(time * COLOR_CYCLE + phases[i] * 1.5)
    const c = PALETTE[(colors[i] + step) % PALETTE.length]
    let r = c[0]
    let g = c[1]
    let b = c[2]
    let a = 255
    if (d < FADE) {
      // On the way out a block flashes bright, then fades — a glowing edge
      const k = 1 - d / FADE
      r += (EDGE[0] - r) * k
      g += (EDGE[1] - g) * k
      b += (EDGE[2] - b) * k
      a = 255 * (1 - k * k)
    }
    data[o] = r
    data[o + 1] = g
    data[o + 2] = b
    data[o + 3] = a
  }

  grid.offCtx.putImageData(buf, 0, 0)
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(grid.off, 0, 0, cols, rows, 0, 0, ctx.canvas.width, ctx.canvas.height)
}

type Phase = 'idle' | 'revealing' | 'done'

export function EnterOverlay() {
  const [phase, setPhase] = useState<Phase>('idle')
  const phaseRef = useRef<Phase>('idle')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Preload so the audio starts on the same beat as the dissolve
  useEffect(() => {
    const audio = new Audio('/audio/opening.mp3')
    audio.preload = 'auto'
    audioRef.current = audio
    return () => {
      audio.pause()
      audioRef.current = null
    }
  }, [])

  // Nothing below the overlay should scroll until it has cleared
  useEffect(() => {
    if (phase === 'done') return
    const root = document.documentElement
    const prev = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = prev
    }
  }, [phase])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) {
      setPhase('done')
      return
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const revealMs = reduced ? REVEAL_MS_REDUCED : REVEAL_MS
    let grid: Grid | null = null
    let raf: number | null = null
    let start: number | null = null
    let mounted: number | null = null

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const cols = Math.ceil(window.innerWidth / CELL)
      const rows = Math.ceil(window.innerHeight / CELL)
      canvas.style.width = `${cols * CELL}px`
      canvas.style.height = `${rows * CELL}px`
      canvas.width = Math.round(cols * CELL * dpr)
      canvas.height = Math.round(rows * CELL * dpr)
      // Thresholds are a pure function of (col, row), so a rebuild keeps the pattern
      if (!grid || grid.cols !== cols || grid.rows !== rows) grid = makeGrid(cols, rows)
    }

    const frame = (now: number) => {
      if (mounted === null) mounted = now
      if (!grid) {
        setPhase('done')
        return
      }
      const time = reduced ? 0 : (now - mounted) / 1000

      if (phaseRef.current === 'idle') {
        render(grid, ctx, -FADE, time)
        raf = requestAnimationFrame(frame)
        return
      }

      if (start === null) start = now
      const t = Math.min((now - start) / revealMs, 1)
      const eased = t * t * (3 - 2 * t)
      render(grid, ctx, -FADE + (1 + FADE) * eased, time)
      if (t < 1) raf = requestAnimationFrame(frame)
      else setPhase('done')
    }

    size()
    window.addEventListener('resize', size)
    raf = requestAnimationFrame(frame)

    return () => {
      window.removeEventListener('resize', size)
      if (raf !== null) cancelAnimationFrame(raf)
    }
  }, [])

  const enter = useCallback(() => {
    if (phaseRef.current !== 'idle') return
    phaseRef.current = 'revealing'
    setPhase('revealing')
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    audio.play().catch(() => {})
  }, [])

  if (phase === 'done') return null

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden"
      style={{ background: `rgb(${PALETTE[0].join(',')})` }}
    >
      <canvas ref={canvasRef} className="absolute left-0 top-0 block" aria-hidden="true" />
      <button
        type="button"
        onClick={enter}
        // Keyboard visitors land on the gate rather than on links they can't see
        autoFocus
        aria-label="Enter site"
        className={`absolute inset-0 flex flex-col items-center justify-center gap-2 border-none bg-transparent text-[15px] text-white transition-opacity duration-200 ${
          phase === 'idle' ? 'cursor-pointer opacity-100' : 'pointer-events-none opacity-0'
        }`}
        style={{ textShadow: '0 1px 14px rgba(0, 0, 0, 0.45)' }}
      >
        <span>
          Enter<span className="cursor-blink ml-[0.4ch]">▮</span>
        </span>
        <span className="text-[13px] text-white/60">sound on</span>
      </button>
    </div>
  )
}
