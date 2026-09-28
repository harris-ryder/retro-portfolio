'use client'

import { createContext, useContext, useMemo, useRef, type ReactNode } from 'react'

// The videos in one row play in turn: the first starts, holds its last
// frame when it ends, then the next plays, and so on round the row. Only
// one plays at a time, so playing one by hand pauses the rest, and the
// round carries on from whichever ends. A row with a single video simply
// starts it again.
type Sequence = { register: (video: HTMLVideoElement) => () => void }

const SequenceContext = createContext<Sequence | null>(null)

export const useVideoSequence = () => useContext(SequenceContext)

export function VideoSequence({ children }: { children: ReactNode }) {
  const videos = useRef<HTMLVideoElement[]>([])
  const started = useRef(false)

  const value = useMemo<Sequence>(() => ({
    register(video) {
      videos.current = [...videos.current, video].sort((a, b) =>
        a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      )
      const onEnded = () => {
        const list = videos.current
        const next = list[(list.indexOf(video) + 1) % list.length]
        if (!next) return
        next.currentTime = 0
        void next.play().catch(() => {})
      }
      const onPlay = () => {
        for (const other of videos.current) if (other !== video && !other.paused) other.pause()
      }
      video.addEventListener('ended', onEnded)
      video.addEventListener('play', onPlay)
      // the first to register (document order) opens the round
      if (!started.current) {
        started.current = true
        void video.play().catch(() => {})
      }
      return () => {
        video.removeEventListener('ended', onEnded)
        video.removeEventListener('play', onPlay)
        videos.current = videos.current.filter(v => v !== video)
      }
    },
  }), [])

  return <SequenceContext.Provider value={value}>{children}</SequenceContext.Provider>
}
