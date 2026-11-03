'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { Project } from '@/data/projects'

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// A plain article: one centred column read top to bottom. Chapters are the
// level-1 sections, each with its sub-chapters (level 2) under it; the text
// comes first, then the figure in a card with its caption. A back arrow sits
// at the top of the column and, on wide screens, the chapter list sits down
// the left edge, centred vertically, marking the chapter in view.
export function ArticleFrame({ project }: { project: Project }) {
  // ids are unique per chapter: a sub-chapter carries its parent's slug
  const ids: string[] = []
  let parent = ''
  for (const s of project.sections) {
    const own = slugify(s.title)
    if ((s.level ?? 1) === 1) { parent = own; ids.push(own) } else ids.push(`${parent}-${own}`)
  }
  const [current, setCurrent] = useState(ids[0])
  const main = useRef<HTMLElement>(null)

  // the chapter nearest the top third of the window is the current one
  useEffect(() => {
    const root = main.current
    if (!root) return
    const chapters = Array.from(root.querySelectorAll<HTMLElement>('[data-chapter]'))
    const pick = () => {
      const line = window.innerHeight * 0.35
      let best = chapters[0], dist = Infinity
      for (const c of chapters) {
        const r = c.getBoundingClientRect()
        const d = r.top > line ? r.top - line : r.bottom < line ? line - r.bottom : 0
        if (d < dist) { dist = d; best = c }
      }
      if (best) setCurrent(best.dataset.chapter!)
    }
    pick()
    window.addEventListener('scroll', pick, { passive: true })
    window.addEventListener('resize', pick)
    return () => { window.removeEventListener('scroll', pick); window.removeEventListener('resize', pick) }
  }, [])

  // the chapter list: level-1 entries with their level-2 entries nested
  const tree: { id: string; title: string; subs: { id: string; title: string }[] }[] = []
  project.sections.forEach((s, i) => {
    if ((s.level ?? 1) === 1) tree.push({ id: ids[i], title: s.title, subs: [] })
    else tree[tree.length - 1]?.subs.push({ id: ids[i], title: s.title })
  })
  return (
    <div className="article">
      <nav aria-label="Chapters" className="article-chapters">
        <ol>
          {tree.map(t => (
            <li key={t.id}>
              <a href={`#${t.id}`} data-current={t.id === current || undefined}>{t.title}</a>
              {t.subs.length > 0 && (
                <ol>
                  {t.subs.map(s => (
                    <li key={s.id}><a href={`#${s.id}`} data-current={s.id === current || undefined}>{s.title}</a></li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <main ref={main} className="article-main">
        {/* the Work frame's back arrow, in its place */}
        <Link href="/work" aria-label="Back to Work" className="article-back inline-flex text-muted no-underline transition-colors hover:text-body">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
        </Link>
        <header className="article-head">
          <h1>{project.tagline}</h1>
        </header>
        {project.sections.map((s, i) => {
          const sub = (s.level ?? 1) === 2
          return (
            <section key={ids[i]} id={ids[i]} data-chapter={ids[i]} className={sub ? 'article-sub' : 'article-chapter'}>
              {sub ? <h3>{s.title}</h3> : <h2>{s.title}</h2>}
              {s.body && <div className="article-body">{s.body}</div>}
              {s.media && (
                <figure className={`article-figure${s.bare ? ' article-figure--bare' : ''}`}>
                  {s.bare ? s.media : <div className="article-card">{s.media}</div>}
                  {s.caption && <figcaption>{s.caption}</figcaption>}
                </figure>
              )}
            </section>
          )
        })}
      </main>
    </div>
  )
}
