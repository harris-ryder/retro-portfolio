'use client'

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { onceFullyInView } from '@/components/inView'
import { PlaybackBar } from '@/components/PlaybackBar'

// The videos in one row play together on one clock: they start as one once
// the longest is fully on screen, a shorter one holds its last frame while
// the longest plays on, and when that ends they all start again. One bar
// under the row drives the longest (the lead); the others follow it through
// its play, pause and seeks, and are nudged back into step if they drift.
export type Together = {
  register: (video: HTMLVideoElement) => () => void
  has: (video: HTMLVideoElement) => boolean
  toggle: () => void
}

// A Video inside a provider of this context neither autoplays, loops nor
// draws a bar of its own (see also VideoSequence, where a row plays in turn).
export const TogetherContext = createContext<Together | null>(null)

export const useVideoTogether = () => useContext(TogetherContext)

// how far a follower may fall out of step before it is moved
const DRIFT = 0.3

export function VideoTogether({ children }: { children: ReactNode }) {
  const videos = useRef<HTMLVideoElement[]>([])
  const [lead, setLead] = useState<HTMLVideoElement | null>(null)
  // handed to the bar, which drives whatever it points at
  const leadRef = useRef<HTMLVideoElement | null>(null)
  leadRef.current = lead

  // the lead is the longest, once durations are known; document order until then
  const pick = () => {
    const list = videos.current
    if (list.length === 0) return setLead(null)
    let best = list[0]
    for (const v of list) if ((v.duration || 0) > (best.duration || 0)) best = v
    setLead(best)
  }

  const value = useMemo<Together>(() => ({
    register(video) {
      videos.current = [...videos.current, video].sort((a, b) =>
        a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      )
      video.addEventListener('loadedmetadata', pick)
      pick()
      return () => {
        video.removeEventListener('loadedmetadata', pick)
        videos.current = videos.current.filter(v => v !== video)
        pick()
      }
    },
    has: video => videos.current.includes(video),
    toggle() {
      const v = leadRef.current
      if (!v) return
      if (v.paused) void v.play()
      else v.pause()
    },
  }), [])

  // the followers take the lead's play, pause and seeks, and its clock
  useEffect(() => {
    if (!lead) return
    const others = () => videos.current.filter(v => v !== lead)
    const follow = (v: HTMLVideoElement) => {
      // past its own end a follower holds its last frame
      if (!v.duration) return
      const at = Math.min(lead.currentTime, v.duration)
      if (Math.abs(v.currentTime - at) > DRIFT) v.currentTime = at
      if (!lead.paused && at < v.duration && v.paused) void v.play().catch(() => {})
      if (lead.paused && !v.paused) v.pause()
    }
    const sync = () => others().forEach(follow)
    const restart = () => {
      for (const v of videos.current) v.currentTime = 0
      for (const v of videos.current) void v.play().catch(() => {})
    }
    lead.addEventListener('play', sync)
    lead.addEventListener('pause', sync)
    lead.addEventListener('seeked', sync)
    lead.addEventListener('timeupdate', sync)
    lead.addEventListener('ended', restart)
    // the round opens once the lead is fully on screen
    const stop = onceFullyInView(lead, () => void lead.play().catch(() => {}))
    return () => {
      stop()
      lead.removeEventListener('play', sync)
      lead.removeEventListener('pause', sync)
      lead.removeEventListener('seeked', sync)
      lead.removeEventListener('timeupdate', sync)
      lead.removeEventListener('ended', restart)
    }
  }, [lead])

  return (
    <TogetherContext.Provider value={value}>
      {children}
      {/* keyed on the lead, so the bar attaches to it once it is known */}
      {lead && <PlaybackBar key={lead.currentSrc || 'lead'} video={leadRef} />}
    </TogetherContext.Provider>
  )
}
