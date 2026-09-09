// The Y2K liquid-chrome shading shared by the goo pieces: the border around
// article media (GooBorder) and the slime buttons (GooBlob). A density field
// of white shapes is blurred and read as a height map; each pixel is then
// shaded from the height and its gradient with the same model as the
// home-page goo — a white rim at the silhouette, a dark mirror band just
// inside it, a silver core, a sky/ground tilt, a specular glint and a
// fresnel edge. The output is a grayscale luminance with an alpha mask that
// fades in just inside the visible silhouette.

/** Density scale before compression — how fast the surface rises */
export const FIELD_SAT = 0.55
/** How steeply the height gradient tilts the surface normal (per device pixel) */
export const FIELD_STEEP = 9
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

/** A device-pixel rectangle the shading may skip (hidden under a card). */
export type Skip = { x0: number; x1: number; y0: number; y1: number }

/** Reads the alpha of a blurred density image into compressed heights. */
export function toHeights(src: Uint8ClampedArray, hbuf: Float32Array) {
  for (let i = 0, m = hbuf.length; i < m; i++) {
    const v = src[i * 4 + 3] / (255 * FIELD_SAT)
    hbuf[i] = v / (1.4 + v)
  }
}

/** Shades the height field into `od` (RGBA, grayscale + mask), skipping `skips`. */
export function shadeChrome(hbuf: Float32Array, od: Uint8ClampedArray, fw: number, fh: number, skips: Skip[] = []) {
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
}
