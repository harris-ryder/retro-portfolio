'use client'

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import type { Project } from '@/data/projects'

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// whether the window is wide enough for the side column (the server
// assumes so; a narrow screen switches once it has hydrated)
const wideQuery = '(min-width: 1024px)'
const useWide = () => useSyncExternalStore(
  onChange => {
    const media = window.matchMedia(wideQuery)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  },
  () => window.matchMedia(wideQuery).matches,
  () => true,
)

// An article as one scrolling column of its sections' media, with a side
// column that stays put: a back arrow and the project's Company, Year,
// Overview and Contribution at the top, and at the bottom the text of
// whichever section is in the frame (nearest the middle of the window).
// A section with no media shows its text in the column instead, and the
// bottom text steps aside while it is in the frame. A section marked
// keepText has nothing of its own to say: the text before it stays up.
// On narrow screens the side column sits above the media and each
// section's text follows its media. See .frame-article in globals.css.
//
// A section's text is rendered in one place only, the side column or
// under its media, never both, and the side column's text is swapped in
// place rather than remounted: the React DevTools extension trips over
// the same elements mounted twice ("The children should not have changed
// if we pass in the same set").
export function FrameArticle({ project }: { project: Project }) {
  const { sections } = project
  const column = useRef<HTMLOListElement>(null)
  const caption = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)
  const wide = useWide()

  // ids for the hash; repeated titles (a run of design boards) get a suffix
  const ids = useMemo(() => {
    const seen = new Map<string, number>()
    return sections.map(s => {
      const base = slugify(s.title)
      const n = (seen.get(base) ?? 0) + 1
      seen.set(base, n)
      return n === 1 ? base : `${base}-${n}`
    })
  }, [sections])

  // on scroll and resize, the section whose media is nearest the middle
  // of the window is the one in the frame
  useEffect(() => {
    const list = column.current
    if (!list) return
    let scheduled = false
    const update = () => {
      scheduled = false
      const middle = window.innerHeight / 2
      let nearest = 0
      let nearestBy = Infinity
      Array.from(list.children).forEach((item, i) => {
        const r = item.getBoundingClientRect()
        const by = Math.abs((r.top + r.bottom) / 2 - middle)
        if (by < nearestBy) {
          nearestBy = by
          nearest = i
        }
      })
      setCurrent(nearest)
    }
    const schedule = () => {
      if (scheduled) return
      scheduled = true
      requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [sections])

  // the section whose text the side column shows: the one in the frame,
  // or, through a run of keepText sections, the nearest before it with
  // text of its own
  const textIndex = useMemo(() => {
    let i = current
    while (i > 0 && sections[i].keepText && !sections[i].body) i--
    return i
  }, [current, sections])
  const text = sections[textIndex]?.body

  // the side column's text fades in each time it changes
  useEffect(() => {
    caption.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease' })
  }, [textIndex])

  const section = sections[current]

  return (
    <main className="frame-article type-home">
      <aside className="frame-side">
        <div className="flex flex-col gap-[1.6em]">
          {/* a back arrow in place of a breadcrumb */}
          <p>
            <Link
              href="/work"
              aria-label="Back to Work"
              className="text-neutral-400 no-underline transition-colors hover:text-neutral-800"
            >
              ←
            </Link>
          </p>
          <dl className="frame-meta">
            {project.company && (
              <div>
                <dt className="text-neutral-400">Company</dt>
                <dd>{project.company}</dd>
              </div>
            )}
            <div>
              <dt className="text-neutral-400">Year</dt>
              <dd>{project.date}</dd>
            </div>
            <div>
              <dt className="text-neutral-400">Overview</dt>
              <dd>{project.tagline}</dd>
            </div>
            {project.contribution && (
              <div>
                <dt className="text-neutral-400">Contribution</dt>
                <dd>{project.contribution}</dd>
              </div>
            )}
          </dl>
        </div>
        {wide && section?.media && text && (
          <div ref={caption} className="frame-caption section-body">
            {text}
          </div>
        )}
      </aside>

      <ol ref={column} className="frame-column">
        {sections.map((s, i) => (
          <li key={ids[i]} id={ids[i]} className="frame-item">
            {s.media ?? <div className="frame-text section-body">{s.body}</div>}
            {!wide && s.media && s.body && <div className="frame-item-body section-body">{s.body}</div>}
          </li>
        ))}
      </ol>

      {project.extras}
    </main>
  )
}
