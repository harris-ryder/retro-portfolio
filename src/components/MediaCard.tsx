'use client'

import { useEffect, useRef } from 'react'

// A grey, bordered card with the asset centred in it (see .asset-card in
// globals.css). Of all the cards on the page, the one nearest the middle
// of the window plays its clip, if it has one; the rest sit paused.
export function MediaCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = ref.current
    if (!card) return
    return watch(card)
  }, [])

  return <div ref={ref} className="asset-card">{children}</div>
}

// One listener for all the cards: on scroll and resize, find the card
// whose middle is nearest the window's, play that one and pause the rest.
const cards = new Set<HTMLElement>()
let scheduled = false

function update() {
  scheduled = false
  const middle = window.innerHeight / 2
  let nearest: HTMLElement | null = null
  let nearestBy = Infinity
  for (const card of cards) {
    const r = card.getBoundingClientRect()
    const by = Math.abs((r.top + r.bottom) / 2 - middle)
    if (by < nearestBy) {
      nearestBy = by
      nearest = card
    }
  }
  for (const card of cards) {
    const video = card.querySelector('video')
    if (!video) continue
    if (card === nearest) void video.play().catch(() => {})
    else video.pause()
  }
}

function schedule() {
  if (scheduled) return
  scheduled = true
  requestAnimationFrame(update)
}

function watch(card: HTMLElement) {
  if (cards.size === 0) {
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
  }
  cards.add(card)
  schedule()
  return () => {
    cards.delete(card)
    if (cards.size === 0) {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }
}
