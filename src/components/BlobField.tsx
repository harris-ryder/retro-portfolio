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
// separated islands always drift together. Balls that actually touch also
// link up with sticky elastic bonds: pulling bonded goo apart stretches
// visible strands that thin out and snap. Left alone, everything ends as one
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
/** Weak global pull toward the home point in the top-left of the page —
 *  how lone islands find the rest, and where the mass finally settles */
const HOME_PULL = 30
/** Home point as a fraction of the visible viewport */
const HOME_X = 0.24
const HOME_Y = 0.26
const DAMP = 2.2
const V_MAX = 400
/** Stiff walls at the visible screen edges — blobs squish against them */
const WALL = 50

const REPEL_R = 160
const REPEL = 3500

/** Sticky elastic bonds — the stringiness. Balls that actually touch link
 *  up; a stretched link pulls back like a strand of goo and snaps past the
 *  break length. Stretched links also render as tapering capsules, so
 *  separating masses stay connected by visible strings that thin out until
 *  the goo filter erodes them away. */
const MAX_BONDS = 6
/** Link forms when a pair gets this close (× contact distance)... */
const BOND_FORM = 1.1
/** ...and snaps when stretched past this (× contact distance) */
const BOND_BREAK = 6
/** Spring pull of a stretched strand, and its cap */
const K_BOND = 30
const BOND_PULL_CAP = 260
/** Mild velocity matching across links — the syrupy coherence of a liquid */
const BOND_VISC = 1.5
/** Strand capsules start drawing at this stretch (× contact distance);
 *  below it the blur already fuses the pair */
const NECK_ON = 1.25

/**
 * Oil-slick shine. A second canvas above the goo, blended with `screen`,
 * only ever lightens dark pixels — highlights appear on the black goop and
 * vanish over the white page. Rather than stamping per-ball glints (which
 * reads blotchy), every frame renders the balls and strands into a small
 * offscreen density field, treats it as a height map — flat plateau inside
 * the mass, smooth falloff at the silhouette — and shades it per pixel:
 * the field's gradient is the surface normal, lit with Blinn-Phong plus a
 * grazing-angle fresnel term. Upscaling that small shaded image gives one
 * smooth continuous highlight that follows the merged surface, strings and
 * droplets included. Light comes from the top-left, tilted toward the
 * viewer, matching where the mass gravitates.
 */
const FIELD_SCALE = 0.25
/** Field density treated as full height — everything above is flat interior */
const FIELD_SAT = 0.55
/** How steeply the height falloff tilts the surface normal */
const FIELD_STEEP = 3
/** Blinn-Phong half-vector: normalize(normalize(-0.7, -0.7, 0.55) + (0,0,1)) */
const HALF_X = -0.3586
const HALF_Y = -0.3586
const HALF_Z = 0.8619
/** Specular exponent and strength — the tight wet band on lit slopes.
 *  Deliberately overdriven past 1 so the band's core saturates to white
 *  before the clamp, which is what makes the goo read glossy-wet. */
const SHINE_P = 32
const SPEC = 1.6
/** Broad low-exponent sheen over the whole lit slope — the smooth
 *  oil-slick gradient the tight band sits inside */
const BROAD = 0.3
/** Grazing-angle glow around every silhouette edge */
const FRESNEL = 0.18

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

/** A stretched bond, recorded during the physics step for the draw pass */
type Strand = {
  x1: number
  y1: number
  x2: number
  y2: number
  /** Capsule width — tapers toward zero as the strand nears its snap length */
  w: number
}

export function BlobField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shineRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const shine = shineRef.current
    const sctx = shine?.getContext('2d')
    if (!canvas || !ctx || !shine || !sctx) return

    // one radial sprite with a smooth gaussian-ish falloff — summed per ball
    // into the shine's density field, far cheaper than per-frame gradients
    const fieldSprite = document.createElement('canvas')
    fieldSprite.width = fieldSprite.height = 64
    const fsctx = fieldSprite.getContext('2d')
    if (fsctx) {
      const g = fsctx.createRadialGradient(32, 32, 0, 32, 32, 32)
      const stops: readonly (readonly [number, number])[] = [
        [0, 1],
        [0.3, 0.8],
        [0.6, 0.35],
        [0.85, 0.08],
        [1, 0],
      ]
      for (const [at, a] of stops) g.addColorStop(at, `rgba(255,255,255,${a})`)
      fsctx.fillStyle = g
      fsctx.fillRect(0, 0, 64, 64)
    }

    // small offscreen pair for the shine: `field` accumulates the density
    // map, `fieldBlur` holds its softened copy for readback and receives
    // the shaded result to upscale onto the shine canvas
    const field = document.createElement('canvas')
    const fctx = field.getContext('2d')
    const fieldBlur = document.createElement('canvas')
    const fbctx = fieldBlur.getContext('2d', { willReadFrequently: true })
    if (!fctx || !fbctx) return

    let W = 0
    let H = 0
    const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo)

    let balls: Ball[] = []
    let heads = new Int32Array(0)
    let next = new Int32Array(0)
    /** Per-ball bond partners, flat n × MAX_BONDS, gated by bondCount */
    let bondTo = new Int32Array(0)
    let bondCount = new Uint8Array(0)
    const strands: Strand[] = []

    /** Shine height-field buffers, allocated per canvas size */
    let fw = 0
    let fh = 0
    let hbuf = new Float32Array(0)
    let shadeImg: ImageData | null = null

    const pointer = { x: -1e4, y: -1e4, active: false }

    const size = () => {
      W = canvas.clientWidth
      H = canvas.clientHeight
      canvas.width = W
      canvas.height = H
      shine.width = W
      shine.height = H
      fw = Math.max(4, Math.ceil(W * FIELD_SCALE))
      fh = Math.max(4, Math.ceil(H * FIELD_SCALE))
      field.width = fw
      field.height = fh
      fieldBlur.width = fw
      fieldBlur.height = fh
      hbuf = new Float32Array(fw * fh)
      shadeImg = fbctx.createImageData(fw, fh)
      // shade pass only ever touches alpha; colour stays solid white
      const od = shadeImg.data
      for (let i = 0; i < od.length; i += 4) {
        od[i] = od[i + 1] = od[i + 2] = 255
      }
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
      bondTo = new Int32Array(count * MAX_BONDS)
      bondCount = new Uint8Array(count)
      strands.length = 0
    }

    /** Drop one side of a bond (the caller removes the mirror entry) */
    const unlink = (i: number, j: number) => {
      const base = i * MAX_BONDS
      for (let s = bondCount[i] - 1; s >= 0; s--) {
        if (bondTo[base + s] === j) {
          bondTo[base + s] = bondTo[base + --bondCount[i]]
          return
        }
      }
    }

    /** Gravity + separation for one pair, each applied once per frame */
    const pair = (i: number, j: number, dt: number) => {
      const a = balls[i]
      const b = balls[j]
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
      // touching pairs link up — the sticky bonds that carry the stringiness
      if (d < contact * BOND_FORM && bondCount[i] < MAX_BONDS && bondCount[j] < MAX_BONDS) {
        const base = i * MAX_BONDS
        let known = false
        for (let s = 0; s < bondCount[i]; s++) {
          if (bondTo[base + s] === j) {
            known = true
            break
          }
        }
        if (!known) {
          bondTo[base + bondCount[i]++] = j
          bondTo[j * MAX_BONDS + bondCount[j]++] = i
        }
      }
    }

    const step = (dt: number) => {
      const n = balls.length

      const homeX = BLEED + (W - 2 * BLEED) * HOME_X
      const homeY = BLEED + (H - 2 * BLEED) * HOME_Y
      for (const b of balls) {
        b.ax = 0
        b.ay = 0
      }

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
            for (let j = next[i]; j !== -1; j = next[j]) pair(i, j, dt)
            for (let k = 0; k < 4; k++) {
              const nx = cx + (k === 1 ? -1 : k === 0 || k === 3 ? 1 : 0)
              const ny = k === 0 ? cy : cy + 1
              if (nx < 0 || nx >= cols || ny >= rows) continue
              for (let j = heads[ny * cols + nx]; j !== -1; j = next[j]) pair(i, j, dt)
            }
          }
        }
      }

      // sticky bonds: stretched links pull back like elastic, badly
      // stretched links snap, and anything in between is recorded as a
      // visible strand of goo for the draw pass
      strands.length = 0
      for (let i = 0; i < n; i++) {
        const base = i * MAX_BONDS
        for (let s = 0; s < bondCount[i]; s++) {
          const j = bondTo[base + s]
          if (j < i) continue // each bond handled once, from the lower index
          const a = balls[i]
          const b = balls[j]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const d = Math.hypot(dx, dy)
          const contact = PACK * (a.r + b.r)
          if (d > contact * BOND_BREAK) {
            unlink(j, i)
            bondTo[base + s] = bondTo[base + --bondCount[i]]
            s--
            continue
          }
          if (d < 0.001) continue
          const ux = dx / d
          const uy = dy / d
          // velocity matching keeps linked goo moving as one syrupy body
          const kv = Math.min(BOND_VISC * dt, 0.2) * 0.5
          const mx = (b.vx - a.vx) * kv
          const my = (b.vy - a.vy) * kv
          a.vx += mx
          a.vy += my
          b.vx -= mx
          b.vy -= my
          if (d > contact) {
            // elastic pull of the stretched strand
            const f = Math.min(K_BOND * (d - contact), BOND_PULL_CAP) * dt
            a.vx += ux * f
            a.vy += uy * f
            b.vx -= ux * f
            b.vy -= uy * f
          }
          const neck = contact * NECK_ON
          if (d > neck) {
            // tapering capsule: full goo width at the neck, hairline near
            // the snap — the threshold filter erodes it away before it breaks
            const t = (d - neck) / (contact * BOND_BREAK - neck)
            const w = 1.8 * Math.min(a.r, b.r) * Math.pow(1 - t, 0.7)
            if (w > 3) strands.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, w })
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

        // faint drift toward home in the top-left, so far-flung islands
        // still converge and the settled mass sits up there
        const gx = homeX - b.x
        const gy = homeY - b.y
        const gd = Math.hypot(gx, gy)
        if (gd > 1) {
          const f = (HOME_PULL * Math.min(gd / 300, 1) * dt) / gd
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

      // stretched bonds render as strings of goo between separating masses
      ctx.strokeStyle = '#fff'
      ctx.lineCap = 'round'
      for (const st of strands) {
        ctx.lineWidth = st.w
        ctx.beginPath()
        ctx.moveTo(st.x1, st.y1)
        ctx.lineTo(st.x2, st.y2)
        ctx.stroke()
      }

      // ---- shine: shade the goo as a height field --------------------
      if (!shadeImg) return
      // 1. accumulate the density map at low resolution — soft sprite per
      //    ball plus the strand capsules, summed with `lighter`
      fctx.setTransform(1, 0, 0, 1, 0, 0)
      fctx.clearRect(0, 0, fw, fh)
      fctx.globalCompositeOperation = 'lighter'
      fctx.setTransform(FIELD_SCALE, 0, 0, FIELD_SCALE, 0, 0)
      for (const b of balls) {
        const R = b.r * 1.5
        fctx.drawImage(fieldSprite, b.x - R, b.y - R, R * 2, R * 2)
      }
      fctx.strokeStyle = 'rgba(255,255,255,0.65)'
      fctx.lineCap = 'round'
      for (const st of strands) {
        fctx.lineWidth = st.w
        fctx.beginPath()
        fctx.moveTo(st.x1, st.y1)
        fctx.lineTo(st.x2, st.y2)
        fctx.stroke()
      }
      // 2. soften, so the gradient (and therefore the highlight) is smooth
      fbctx.clearRect(0, 0, fw, fh)
      fbctx.filter = 'blur(3px)'
      fbctx.drawImage(field, 0, 0)
      fbctx.filter = 'none'
      // 3. shade per pixel: height = clamped density, normal from its
      //    gradient, Blinn-Phong band plus grazing-angle fresnel
      const src = fbctx.getImageData(0, 0, fw, fh).data
      for (let i = 0, m = fw * fh; i < m; i++) {
        const v = src[i * 4 + 3] / (255 * FIELD_SAT)
        hbuf[i] = v > 1 ? 1 : v
      }
      const od = shadeImg.data
      for (let y = 1; y < fh - 1; y++) {
        for (let x = 1; x < fw - 1; x++) {
          const i = y * fw + x
          const c = hbuf[i]
          let alpha = 0
          if (c > 0.1) {
            const gx = (hbuf[i + 1] - hbuf[i - 1]) * FIELD_STEEP
            const gy = (hbuf[i + fw] - hbuf[i - fw]) * FIELD_STEEP
            const inv = 1 / Math.sqrt(gx * gx + gy * gy + 1)
            const dotH = (-gx * HALF_X - gy * HALF_Y + HALF_Z) * inv
            const g = 1 - inv // 0 on the flat top, → 1 on steep rims
            alpha = g * g * FRESNEL
            if (dotH > 0) {
              // tight wet band where the slope mirrors the light...
              alpha += Math.pow(dotH, SHINE_P) * SPEC
              // ...inside a broad smooth gradient over the whole lit slope,
              // gated to slopes so the flat interior stays matte black
              const d2 = dotH * dotH
              const gk = g * 3
              alpha += d2 * d2 * dotH * BROAD * (gk > 1 ? 1 : gk)
            }
            if (alpha > 1) alpha = 1
            // fade in from the silhouette so nothing halos outside the goo
            const fade = (c - 0.1) / 0.15
            if (fade < 1) alpha *= fade
          }
          od[i * 4 + 3] = alpha * 255
        }
      }
      // 4. upscale the shaded field onto the shine canvas — bilinear
      //    smoothing turns the small image into one continuous sheen
      fbctx.putImageData(shadeImg, 0, 0)
      sctx.clearRect(0, 0, W, H)
      sctx.drawImage(fieldBlur, 0, 0, fw, fh, 0, 0, fw / FIELD_SCALE, fh / FIELD_SCALE)
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

  const frame: React.CSSProperties = {
    top: -BLEED,
    left: -BLEED,
    width: `calc(100vw + ${BLEED * 2}px)`,
    height: `calc(100lvh + ${BLEED * 2}px)`,
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed z-30"
        style={{
          ...frame,
          // two goo passes: the first merges balls into masses, the second
          // re-blurs and re-thresholds the silhouette, rounding off the
          // ball-by-ball scallops on big merged blobs; slightly soft
          // contrast keeps thinning strands alive longer before they snap
          filter: 'blur(7px) contrast(26) blur(5px) contrast(22)',
          mixBlendMode: 'difference',
        }}
      />
      <canvas
        ref={shineRef}
        aria-hidden="true"
        className="pointer-events-none fixed z-30"
        style={{
          ...frame,
          // screen-blend: lightens the black goop, invisible on the white
          // page; a whisper of blur hides the height-field's upscaling
          filter: 'blur(1px)',
          mixBlendMode: 'screen',
        }}
      />
    </>
  )
}
