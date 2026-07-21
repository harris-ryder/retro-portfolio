/* Coordinates the inline demos as the page scrolls: the demo whose
   centre is closest to the viewport centre (and is meaningfully on
   screen) becomes "active" — it gets keyboard focus so you can just
   start typing, and is told so it can surface its hint. Focus is only
   moved between registered demos, never stolen from elsewhere. */
type Entry = { el: HTMLElement; onActive: (active: boolean) => void }

const entries = new Set<Entry>()
let frame = 0
let started = false

function pick() {
  frame = 0
  if (entries.size === 0) return

  const vh = window.innerHeight
  const mid = vh / 2
  const visible: { entry: Entry; dist: number }[] = []

  entries.forEach((entry) => {
    const r = entry.el.getBoundingClientRect()
    const onScreen = Math.min(r.bottom, vh) - Math.max(r.top, 0)
    if (onScreen < Math.min(r.height, vh) * 0.5) return
    visible.push({ entry, dist: Math.abs(r.top + r.height / 2 - mid) })
  })

  if (visible.length === 0) {
    entries.forEach((e) => e.onActive(false))
    return
  }

  const best = visible.reduce((a, b) => (b.dist < a.dist ? b : a)).entry

  const active = document.activeElement as HTMLElement | null
  const ownedByDemo =
    !active ||
    active === document.body ||
    [...entries].some((e) => e.el === active || e.el.contains(active))
  if (ownedByDemo && best.el !== active && !best.el.contains(active)) {
    best.el.focus({ preventScroll: true })
  }

  entries.forEach((e) => e.onActive(e === best))
}

function schedule() {
  if (frame) return
  frame = requestAnimationFrame(pick)
}

export function registerDemo(
  el: HTMLElement,
  onActive: (active: boolean) => void,
) {
  const entry: Entry = { el, onActive }
  entries.add(entry)
  if (!started) {
    started = true
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
  }
  schedule()
  return () => {
    entries.delete(entry)
  }
}
