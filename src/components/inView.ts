// Calls back once, the first time the element is wholly inside the
// viewport, then stops watching. Returns a function that stops watching
// early (for an effect's cleanup). The article's videos use this to hold
// their first frame until they are fully on screen, rather than starting
// as soon as an edge of them appears.
//
// The root is widened by a pixel so an element whose edge sits exactly on
// the viewport's edge still counts as whole: a fractional edge can leave
// the measured ratio a hair under one and a threshold of one unreached.
export function onceFullyInView(el: Element, cb: () => void): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    cb()
    return () => {}
  }
  const io = new IntersectionObserver(
    entries => {
      if (!entries.some(e => e.isIntersecting)) return
      io.disconnect()
      cb()
    },
    { threshold: 1, rootMargin: '1px' },
  )
  io.observe(el)
  return () => io.disconnect()
}
