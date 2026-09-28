'use client'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import type { Section } from '@/data/projects'
import type { PairColumn } from '@/components/pairColumn'

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const number = (i: number) => String(i + 1).padStart(2, '0')

type Props = {
  title: string
  // pair: measured on the server for sections whose media is a MediaRow;
  // natural: the media's width when the height budget is the limit;
  // fixed: a demo's height, which doesn't scale to the budget;
  // wide: a grid, which may run right up to the index rather than 1000px
  sections: (Section & { pair?: PairColumn | null; natural?: string; fixed?: number; wide?: boolean })[]
  // rendered once, outside the sections (e.g. the Try-me cursor overlay)
  extras?: React.ReactNode
}

// One section at a time. The section's text sits in the header row beside
// the breadcrumb, its media is centred on the page, and a numbered index
// on the left (also centred) picks the section: numbers up to and
// including the current one are dark, the rest grey, so it doubles as a
// progress rail. The arrow keys and the URL hash step through sections
// too, and Next sits in the footer band. On narrow screens everything
// simply flows top to bottom.
export function SectionedArticle({ title, sections, extras }: Props) {
  const [index, setIndex] = useState(0)
  const mainRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLElement>(null)

  // hash ids; repeated titles (a run of design boards) get a suffix
  const ids = useMemo(() => {
    const seen = new Map<string, number>()
    return sections.map(s => {
      const base = slugify(s.title)
      const n = (seen.get(base) ?? 0) + 1
      seen.set(base, n)
      return n === 1 ? base : `${base}-${n}`
    })
  }, [sections])

  // Back / Next is a hint: it fades in whenever the section changes (a
  // click or an arrow key) and fades away again shortly after
  const [hint, setHint] = useState(false)
  const hintTimer = useRef<number | undefined>(undefined)
  const showHint = useCallback(() => {
    setHint(true)
    window.clearTimeout(hintTimer.current)
    hintTimer.current = window.setTimeout(() => setHint(false), 1600)
  }, [])
  useEffect(() => () => window.clearTimeout(hintTimer.current), [])

  const go = useCallback((i: number) => {
    const next = Math.max(0, Math.min(sections.length - 1, i))
    setIndex(next)
    history.replaceState(null, '', `#${ids[next]}`)
    window.scrollTo({ top: 0 })
    showHint()
  }, [sections.length, ids, showHint])

  useEffect(() => {
    const sync = () => {
      const i = ids.indexOf(location.hash.slice(1))
      if (i >= 0) setIndex(i)
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [ids])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      // leave the arrows alone inside text inputs (the demos take focus
      // but don't use them) and on a video's scrub bar, which seeks with them
      if ((e.target as HTMLElement | null)?.closest('input, textarea, [contenteditable], [role="slider"]')) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(index + 1)
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(index - 1)
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, index])

  // the media's height budget keeps clear of the header row (breadcrumb
  // and text), whose height depends on the section: publish where it ends.
  // When the centred band that leaves would be under 240px (long text on
  // a short window), or too short for a fixed-size demo, the media flows
  // below the text instead.
  const [flows, setFlows] = useState(false)
  useLayoutEffect(() => {
    const header = headerRef.current
    const main = mainRef.current
    if (!header || !main) return
    const publish = () => {
      const bottom = header.getBoundingClientRect().bottom - main.getBoundingClientRect().top
      main.style.setProperty('--top-block', `${Math.round(bottom)}px`)
      const available = window.innerHeight - 2 * (bottom + 24) - 40
      setFlows(available < Math.max(240, sections[index].fixed ?? 0))
    }
    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(header)
    window.addEventListener('resize', publish)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', publish)
    }
  }, [index, sections])

  const section = sections[index]
  const natural = { '--natural': section.natural } as React.CSSProperties

  return (
    <main ref={mainRef} className={`sectioned-article type-body relative flex min-h-dvh flex-col ${flows ? 'media-flows' : ''}`}>
      {/* breadcrumb on the index's left edge; the section's text beside
          it, centred on the page and top-aligned with it */}
      <header ref={headerRef} className="relative flex-none px-4 pt-[26px] lg:px-0">
        <p className="lg:absolute lg:top-[26px] lg:left-[57px]">
          <Link href="/" className="text-neutral-400 no-underline transition-colors hover:text-neutral-800">Work</Link>
          <span className="text-neutral-400"> / </span>
          {title}
        </p>
        <div className="section-text mt-6 max-w-[629px] lg:mt-0 lg:text-right">
          {section.body && (
            <div key={ids[index]} className="section-body section-in">
              {section.body}
            </div>
          )}
          {/* Back / Next, in the voice of the home page's Work / Playground */}
          <p
            className={`section-hint hidden [&_button]:cursor-pointer [&_button]:outline-none [&_button:disabled]:cursor-default [&_button:disabled]:text-neutral-400 lg:block ${section.body ? 'mt-6' : ''}`}
            style={{ '--hint': hint ? 1 : 0, '--hint-ms': hint ? '200ms' : '1200ms' } as React.CSSProperties}
          >
            <button type="button" onClick={() => go(index - 1)} disabled={index === 0}>Back</button>
            <span className="text-neutral-400"> / </span>
            <button type="button" onClick={() => go(index + 1)} disabled={index === sections.length - 1}>Next</button>
          </p>
        </div>
      </header>

      {/* desktop: vertical index on the left edge, centred on the page */}
      <nav aria-label="Sections" className="absolute top-1/2 left-[57px] hidden -translate-y-1/2 lg:block">
        <ol className="section-index type-tight flex flex-col" style={{ '--n': sections.length } as React.CSSProperties}>
          {sections.map((s, i) => (
            <li key={ids[i]}>
              <button
                type="button"
                // drop focus after a click, or the title would stay revealed
                // once the arrow keys put the browser in keyboard mode
                onClick={e => { e.currentTarget.blur(); go(i) }}
                aria-current={i === index ? 'step' : undefined}
                className={`group flex h-[1em] cursor-pointer items-baseline gap-[10px] text-left outline-none ${i > index ? 'text-neutral-400' : ''}`}
              >
                <span aria-hidden="true">{number(i)}</span>
                {/* a hovered title appears at once and lingers on the way out */}
                <span className={i === index ? '' : 'text-neutral-400 opacity-0 transition-opacity duration-[900ms] group-hover:opacity-100 group-hover:duration-150 group-focus-visible:opacity-100 group-focus-visible:duration-150'}>
                  {s.title}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {/* the media, centred on the page; in flow below the text on narrow
          screens, or when there's no room to centre it */}
      {section.media && (
        <div
          key={ids[index]}
          className={`section-in mx-auto w-full max-w-[calc(var(--media-max)_+_2rem)] px-4 pt-8 ${section.wide ? 'media-wide' : ''} ${flows ? '' : 'lg:absolute lg:inset-x-0 lg:top-1/2 lg:-translate-y-1/2 lg:pt-0'}`}
        >
          <div className="section-screen" style={natural}>
            <div className="section-media">{section.media}</div>
          </div>
        </div>
      )}

      {/* narrow screens: where you are, and Back / Next, in the footer band */}
      <footer className="mt-auto flex justify-between px-4 pt-8 pb-8 [&_button]:cursor-pointer [&_button]:outline-none [&_button:disabled]:cursor-default [&_button:disabled]:text-neutral-400 lg:hidden">
        <p>{index + 1}/{sections.length}</p>
        <p>
          <button type="button" onClick={() => go(index - 1)} disabled={index === 0}>Back</button>
          <span className="text-neutral-400"> / </span>
          <button type="button" onClick={() => go(index + 1)} disabled={index === sections.length - 1}>Next</button>
        </p>
      </footer>

      {extras}
    </main>
  )
}
