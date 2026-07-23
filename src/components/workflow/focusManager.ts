/* Coordinates the inline demos as the page scrolls: the demo whose
   centre is closest to the viewport centre (and is meaningfully on
   screen) becomes active. It gets keyboard focus so you can just start
   typing, and is broadcast to badge subscribers (the "Try me" pointer)
   every frame so they can aim at it. Focus is only moved between
   registered demos, never stolen from elsewhere. */
const els = new Set<HTMLElement>()
const badgeListeners = new Set<(el: HTMLElement | null) => void>()
let frame = 0
let started = false

function pick() {
  frame = 0
  const vh = window.innerHeight
  const mid = vh / 2
  let best: HTMLElement | null = null

  if (els.size > 0) {
    const visible: { el: HTMLElement; dist: number }[] = []
    els.forEach((el) => {
      const r = el.getBoundingClientRect()
      const onScreen = Math.min(r.bottom, vh) - Math.max(r.top, 0)
      if (onScreen < Math.min(r.height, vh) * 0.5) return
      visible.push({ el, dist: Math.abs(r.top + r.height / 2 - mid) })
    })
    if (visible.length > 0) {
      best = visible.reduce((a, b) => (b.dist < a.dist ? b : a)).el
    }
  }

  if (best) {
    const active = document.activeElement as HTMLElement | null
    const ownedByDemo =
      !active ||
      active === document.body ||
      [...els].some((e) => e === active || e.contains(active))
    if (ownedByDemo && best !== active && !best.contains(active)) {
      best.focus({ preventScroll: true })
    }
  }

  badgeListeners.forEach((l) => l(best))
}

function schedule() {
  if (frame) return
  frame = requestAnimationFrame(pick)
}

function ensureStarted() {
  if (started) return
  started = true
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule, { passive: true })
}

export function registerDemo(el: HTMLElement) {
  els.add(el)
  ensureStarted()
  schedule()
  return () => {
    els.delete(el)
  }
}

export function subscribeBadge(fn: (el: HTMLElement | null) => void) {
  badgeListeners.add(fn)
  ensureStarted()
  schedule()
  return () => {
    badgeListeners.delete(fn)
  }
}
