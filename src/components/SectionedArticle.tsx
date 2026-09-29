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
// left-aligned on the same margin, in full. The media is centred on the
// page, both ways, and a numbered index on the left, centred on the same
// line, picks the section (numbers up to and including the current one
// are dark, the rest grey, so it doubles as a progress rail). The
// media's size comes from the window alone, in a band with fixed
// margins. Text past --text-lines lines is cut off on a line boundary;
// pointing at it reveals the rest, and the media moves down by the same
// distance as it does (see --reveal in globals.css). The arrow keys and
// the URL hash step through sections too. On narrow screens everything
// simply flows top to bottom, with Back / Next in the footer in place
// of the index.
export function SectionedArticle({ title, sections, extras }: Props) {
  const [index, setIndex] = useState(0)

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

  // where the text is cut (--cut: the last line ending within --text-lines
  // lines, over every paragraph, so a line is never split) and how tall it
  // is in full (--full); both go on <main>, where the media reads them too
  const bodyRef = useRef<HTMLDivElement>(null)
  const [cut, setCut] = useState(0)
  const [full, setFull] = useState(0)
  useLayoutEffect(() => {
    const body = bodyRef.current
    if (!body) {
      setCut(0)
      return
    }
    const measure = () => {
      setFull(body.scrollHeight)
      const style = getComputedStyle(body)
      const lineHeight = parseFloat(style.lineHeight) || 24
      const limit = (parseFloat(style.getPropertyValue('--text-lines')) || 3) * lineHeight
      const top = body.getBoundingClientRect().top
      let last = 0
      for (const block of Array.from(body.children)) {
        const rect = block.getBoundingClientRect()
        const lh = parseFloat(getComputedStyle(block).lineHeight) || lineHeight
        const lines = Math.max(1, Math.round(rect.height / lh))
        for (let n = 1; n <= lines; n++) {
          const bottom = rect.top - top + n * lh
          if (bottom <= limit + 0.5) last = bottom
        }
      }
      setCut(last || limit)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(body)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [index])

  const section = sections[index]
  const natural = { '--natural': section.natural } as React.CSSProperties
  const text = cut ? ({ '--cut': `${cut}px`, '--full': `${full}px` } as React.CSSProperties) : undefined

  return (
    <main className="sectioned-article type-body relative flex min-h-dvh flex-col" style={text}>
      {/* the breadcrumb, and the section's text under it on the same margin;
          above the media, so the text can be read and pointed at where
          the two meet */}
      <header className="relative z-10 flex-none px-4 pt-[26px] lg:px-[57px]">
        <p>
          <Link href="/" className="text-neutral-400 no-underline transition-colors hover:text-neutral-800">Work</Link>
          <span className="text-neutral-400"> / </span>
          {title}
        </p>
        {section.body && (
          <div key={ids[index]} ref={bodyRef} className="section-body section-in mt-6 max-w-[1000px]">
            {section.body}
          </div>
        )}
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
          screens */}
      {section.media && (
        <div
          key={ids[index]}
          className={`section-stage section-in mx-auto w-full max-w-[calc(var(--media-max)_+_2rem)] px-4 pt-8 lg:absolute lg:inset-x-0 lg:top-1/2 lg:-translate-y-1/2 lg:pt-0 ${section.wide ? 'media-wide' : ''}`}
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
