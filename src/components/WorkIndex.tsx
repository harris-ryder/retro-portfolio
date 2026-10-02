'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ProjectList } from '@/components/ProjectList'
import type { WorkItem } from '@/data/links'

// The Work list. Pointing at (or focusing) a row shows that entry's
// picture or clip in the middle of the window, and a clip plays while it
// shows. See .work-peek in globals.css.
export function WorkIndex({ items }: { items: WorkItem[] }) {
  const [active, setActive] = useState<number | null>(null)

  // a row has to be pointed at for a moment before its asset shows, so
  // passing over the list on the way elsewhere doesn't flick through them
  // all; and leaving a row waits a little longer, so crossing to the next
  // one doesn't blank the middle in between
  const timer = useRef<number | undefined>(undefined)
  const hover = useCallback((index: number | null) => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setActive(index), index === null ? 200 : 80)
  }, [])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <>
      <ProjectList items={items} onHover={hover} />
      <Peek items={items} active={active} />
    </>
  )
}

// All the assets sit in the one spot, only the active one visible, so a
// clip is ready the moment its row is pointed at
function Peek({ items, active }: { items: WorkItem[]; active: number | null }) {
  const ref = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const peek = ref.current
    if (!peek) return
    Array.from(peek.children).forEach((slot, i) => {
      const video = slot.querySelector('video')
      if (!video) return
      if (i === active) void video.play().catch(() => {})
      else video.pause()
    })
  }, [active])

  return (
    <ul ref={ref} className="work-peek" aria-hidden="true">
      {items.map((item, i) => {
        const { src, video, width, height } = item.media
        return (
          <li key={item.href} data-open={i === active || undefined}>
            {video ? (
              <video
                src={video}
                poster={src}
                width={width}
                height={height}
                preload="metadata"
                muted
                loop
                playsInline
                disablePictureInPicture
                // React leaves the muted attribute out of the server HTML, and
                // an unmuted video may not be played without a gesture
                ref={el => {
                  if (el) el.muted = true
                }}
              />
            ) : (
              <img src={src} alt="" width={width} height={height} draggable={false} />
            )}
          </li>
        )
      })}
    </ul>
  )
}
