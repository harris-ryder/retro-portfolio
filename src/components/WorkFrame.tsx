'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import { ProjectList } from '@/components/ProjectList'
import type { Project, Section } from '@/data/projects'
import type { WorkItem } from '@/data/links'

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

type List = { items: WorkItem[]; projects: Project[] }

// The Work section's one frame, kept up by its layout across the list
// and the articles, so the two share their elements. Which article is
// open comes from the route segment under /work. One not in the list (an
// old project kept reachable by URL) is left to its page, which draws its
// own Frame.
export function WorkFrame({ items, projects, children }: { items: WorkItem[]; projects: Project[]; children?: React.ReactNode }) {
  const slug = useSelectedLayoutSegment()
  const project = useMemo(() => projects.find(p => p.slug === slug) ?? null, [projects, slug])
  if (slug && !project) return <>{children}</>
  return <Frame project={project} list={{ items, projects }} />
}

const none: Section[] = []

// A side column that stays put and one scrolling column of media (see
// .frame-article in globals.css).
//
// With the list (no project): the side column is the "Harris / Work"
// line and the rows, and pointing at (or focusing) a row shows that
// article's opening media at the top of the media column, just where the
// article has it, with its clip playing. Opening an article swaps the side
// column for a back arrow, the project's Company, Year, Overview and
// Contribution, and at the bottom the text of whichever section is in
// the frame (nearest the middle of the window); the column fills with
// the sections. The opening media is the same element in the same place
// (same key, same parent), so it stays put and a clip keeps playing, and
// going back to the list leaves it up until another row is pointed at.
//
// A section with no media shows its text in the column instead, and the
// bottom text steps aside while it is in the frame. A section marked
// keepText has nothing of its own to say: the text before it stays up.
// On narrow screens the side column sits above the media, each section's
// text follows its media, and the list shows no media (pointer-only).
//
// A section's text is rendered in one place only, the side column or
// under its media, never both, and the side column's text is swapped in
// place rather than remounted: the React DevTools extension trips over
// the same elements mounted twice ("The children should not have changed
// if we pass in the same set").
export function Frame({ project, list }: { project: Project | null; list?: List }) {
  const sections = project?.sections ?? none
  const column = useRef<HTMLOListElement>(null)
  const caption = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)
  const wide = useWide()

  // the list: which row's article is pointed at. A row has to be pointed
  // at for a moment before its media shows, so passing over the list on
  // the way elsewhere doesn't flick through them all; and leaving a row
  // waits a little longer, so crossing to the next one doesn't blank the
  // column in between
  const [hovered, setHovered] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const hover = useCallback((index: number | null) => {
    window.clearTimeout(timer.current)
    const slug = index === null ? null : list?.items[index]?.slug ?? null
    timer.current = window.setTimeout(() => setHovered(slug), index === null ? 200 : 80)
  }, [list])
  useEffect(() => () => window.clearTimeout(timer.current), [])
  // an open article counts as pointed at (and a pending hover is dropped),
  // so going back to the list keeps its media up
  useEffect(() => {
    if (!project) return
    window.clearTimeout(timer.current)
    setHovered(project.slug)
  }, [project])

  // the article whose opening media the list shows
  const peek = !project && wide && hovered ? list?.projects.find(p => p.slug === hovered) : undefined

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
  // text of its own. Leaving an article for the list (or a shorter
  // article) can leave `current` past the end until the next scroll
  // update, so it is clamped here
  const textIndex = useMemo(() => {
    let i = Math.min(current, sections.length - 1)
    while (i > 0 && sections[i].keepText && !sections[i].body) i--
    return i
  }, [current, sections])
  const text = sections[textIndex]?.body

  // the side column's text fades in each time it changes
  useEffect(() => {
    caption.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease' })
  }, [textIndex])

  const section = sections[Math.min(current, sections.length - 1)]

  return (
    <main className="frame-article type-home">
      <aside className="frame-side">
        {/* keyed, so the list and an article's details fade in as they swap */}
        <div key={project?.slug ?? 'list'} className="frame-side-top flex flex-col gap-[1.6em]">
          {project ? (
            <>
              {/* a back arrow in place of a breadcrumb */}
              <p>
                <Link
                  href="/work"
                  aria-label="Back to Work"
                  className="-ml-[3px] inline-flex text-neutral-500 no-underline transition-colors hover:text-neutral-900"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M19 12H5M11 6l-6 6 6 6" />
                  </svg>
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
            </>
          ) : (
            <>
              <p>
                <Link href="/" className="text-neutral-400 no-underline transition-colors hover:text-neutral-800">Harris</Link>
                <span className="text-neutral-400">{' / '}</span>
                Work
              </p>
              {list && <ProjectList items={list.items} onHover={hover} />}
            </>
          )}
        </div>
        {wide && project && section?.media && text && (
          <div ref={caption} className="frame-caption section-body">
            {text}
          </div>
        )}
      </aside>

      <ol ref={column} className="frame-column">
        {project
          ? sections.map((s, i) => (
              <li key={`${project.slug}/${i}`} id={ids[i]} className="frame-item">
                {s.media ?? <div className="frame-text section-body">{s.body}</div>}
                {!wide && s.media && s.body && <div className="frame-item-body section-body">{s.body}</div>}
              </li>
            ))
          : peek && (
              <li key={`${peek.slug}/0`} className="frame-item" aria-hidden="true">
                {peek.sections[0]?.media}
              </li>
            )}
      </ol>

      {project?.extras}
    </main>
  )
}
