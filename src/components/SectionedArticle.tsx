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
  // wide: a grid, which may run right up to the index rather than 1000px
  sections: (Section & { pair?: PairColumn | null; natural?: string; wide?: boolean })[]
  // rendered once, outside the sections (e.g. the Try-me cursor overlay)
  extras?: React.ReactNode
}

// One section at a time. The section's text sits under the breadcrumb,
// left-aligned on the same margin, in full, and a numbered index in the
// top right corner picks the section (numbers up to and including the
// current one are dark, the rest grey, so it doubles as a progress
// rail). Below the text is the band, with the media centred in it on
// the page's centre line. The band starts where the text ends
// (--top-block, published from here), so the media scales to the room
// the text leaves. The arrow keys and the URL hash step through
// sections too. On narrow screens everything simply flows top to
// bottom, with Back / Next in the footer in place of the index.
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

  const go = useCallback((i: number) => {
    const next = Math.max(0, Math.min(sections.length - 1, i))
    setIndex(next)
    history.replaceState(null, '', `#${ids[next]}`)
    window.scrollTo({ top: 0 })
  }, [sections.length, ids])

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

  // the band starts where the header (breadcrumb and text) ends: publish
  // that, and again whenever the text or the window changes
  useLayoutEffect(() => {
    const header = headerRef.current
    const main = mainRef.current
    if (!header || !main) return
    const publish = () => {
      const bottom = header.getBoundingClientRect().bottom - main.getBoundingClientRect().top
      main.style.setProperty('--top-block', `${Math.round(bottom)}px`)
    }
    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(header)
    window.addEventListener('resize', publish)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', publish)
    }
  }, [index])

  const section = sections[index]
  const natural = { '--natural': section.natural } as React.CSSProperties

  return (
    <main ref={mainRef} className="sectioned-article type-body relative flex min-h-dvh flex-col">
      {/* the breadcrumb, and the section's text under it on the same margin */}
      <header ref={headerRef} className="relative flex-none px-4 pt-[26px] lg:px-[57px]">
        <p>
          <Link href="/" className="text-neutral-400 no-underline transition-colors hover:text-neutral-800">Work</Link>
          <span className="text-neutral-400"> / </span>
          {title}
        </p>
        {section.body && (
          <div key={ids[index]} className="section-body section-in mt-6 max-w-[629px]">
            {section.body}
          </div>
        )}
      </header>

      {/* desktop: vertical index in the top right corner, on the
          breadcrumb's line; titles read leftwards from the numbers */}
      <nav aria-label="Sections" className="absolute top-[26px] right-[57px] hidden lg:block">
        <ol className="section-index type-tight flex flex-col items-end" style={{ '--n': sections.length } as React.CSSProperties}>
          {sections.map((s, i) => (
            <li key={ids[i]}>
              <button
                type="button"
                // drop focus after a click, or the title would stay revealed
                // once the arrow keys put the browser in keyboard mode
                onClick={e => { e.currentTarget.blur(); go(i) }}
                aria-current={i === index ? 'step' : undefined}
                className={`group flex h-[1em] cursor-pointer flex-row-reverse items-baseline gap-[10px] text-right outline-none ${i > index ? 'text-neutral-400' : ''}`}
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

      {/* the media, centred in the band; in flow below the text on narrow
          screens */}
      {section.media && (
        <div
          key={ids[index]}
          className={`section-stage section-in mx-auto w-full max-w-[calc(var(--media-max)_+_2rem)] px-4 pt-8 lg:absolute lg:inset-x-0 lg:pt-0 ${section.wide ? 'media-wide' : ''}`}
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
