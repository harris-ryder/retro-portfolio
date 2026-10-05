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
// clip is ready the moment its row is pointed at. Until an asset has
// loaded (a clip, buffered enough to play), its slot shows an outline of
// its size and says "loading" instead (the clips are fetched ahead of
// time where possible, see PrefetchClips).
function Peek({ items, active }: { items: WorkItem[]; active: number | null }) {
  const ref = useRef<HTMLUListElement>(null)
  const [ready, setReady] = useState<Record<number, boolean>>({})
  const markReady = (i: number) => setReady(r => (r[i] ? r : { ...r, [i]: true }))

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
          <li key={item.href} data-open={i === active || undefined} data-loading={!ready[i] || undefined}>
            {video ? (
              <>
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
                  onCanPlay={() => markReady(i)}
                  onPlaying={() => markReady(i)}
                  // React leaves the muted attribute out of the server HTML, and
                  // an unmuted video may not be played without a gesture; a
                  // cached clip can be ready before hydration attaches onCanPlay
                  ref={el => {
                    if (!el) return
                    el.muted = true
                    if (el.readyState >= 3) markReady(i)
                  }}
                  style={{ opacity: ready[i] ? 1 : 0 }}
                />
              </>
            ) : (
              <img
                src={src}
                alt=""
                width={width}
                height={height}
                draggable={false}
                onLoad={() => markReady(i)}
                // a cached picture can be complete before hydration attaches onLoad
                ref={el => {
                  if (el?.complete && el.naturalWidth > 0) markReady(i)
                }}
                style={{ opacity: ready[i] ? 1 : 0 }}
              />
            )}
            {!ready[i] && (
              <span className="media-loading">
                loading<span className="media-loading-dots">...</span>
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
