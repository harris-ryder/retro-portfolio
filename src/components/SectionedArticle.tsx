'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { Section } from '@/data/projects'
import type { PairColumn } from '@/components/pairColumn'

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const number = (i: number) => String(i + 1).padStart(2, '0')

type Props = {
  title: string
  // pair: measured on the server for sections whose media is a MediaRow
  sections: (Section & { pair?: PairColumn | null })[]
  // rendered once, outside the sections (e.g. the Try-me cursor overlay)
  extras?: React.ReactNode
}

// One section at a time: a numbered index on the left picks the section,
// Back / Next step through them. Numbers up to and including the current
// section are dark, the rest grey, so the index doubles as a progress
// rail. The current section is mirrored in the URL hash so a refresh or
// shared link lands on the same one.
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
      // leave the arrows alone inside inputs and the interactive demos
      if ((e.target as HTMLElement | null)?.closest('input, textarea, [contenteditable], .wf-demo')) return
      if (e.key === 'ArrowRight') go(index + 1)
      else if (e.key === 'ArrowLeft') go(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, index])

  const section = sections[index]
  const pair = section.pair

  return (
    <main className="sectioned-article flex min-h-dvh flex-col text-[16px] leading-[1.3] text-black">
      {/* breadcrumb on the index's left edge: Work / <article> */}
      <header className="flex-none px-4 pt-[26px] lg:px-[57px]">
        <p>
          <Link href="/" className="text-neutral-400 no-underline transition-colors hover:text-black">Work</Link>
          <span className="text-neutral-400"> / </span>
          {title}
        </p>
      </header>

      {/* everything between the header and Next: the index and the article
          both start one home-page gap (64px) below the breadcrumb */}
      <div className="relative mt-16 flex flex-1 flex-col">
        {/* desktop: vertical index, pinned to the left edge */}
        <nav aria-label="Sections" className="absolute top-0 left-[57px] hidden lg:block">
          <ol className="section-index flex flex-col leading-none" style={{ '--n': sections.length } as React.CSSProperties}>
            {sections.map((s, i) => (
              <li key={ids[i]}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-current={i === index ? 'step' : undefined}
                  className={`group flex h-[1em] cursor-pointer items-baseline gap-[10px] text-left ${i > index ? 'text-neutral-400' : ''}`}
                >
                  <span aria-hidden="true">{number(i)}</span>
                  <span className={i === index ? '' : 'text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100'}>
                    {s.title}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mx-auto flex w-full max-w-[calc(var(--media-max)_+_2rem)] flex-1 flex-col px-4">
          {/* narrow screens: the same index laid on its side */}
          <nav aria-label="Sections" className="w-full max-w-[629px] lg:hidden">
            <ol className="flex flex-wrap gap-x-[0.6em] gap-y-2 leading-none">
              {sections.map((s, i) => (
                <li key={ids[i]}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-label={s.title}
                    aria-current={i === index ? 'step' : undefined}
                    className={`cursor-pointer ${i > index ? 'text-neutral-400' : ''}`}
                  >
                    {number(i)}
                  </button>
                </li>
              ))}
            </ol>
            <p className="mt-3">{section.title}</p>
          </nav>

          <article
            key={ids[index]}
            className={`section-screen section-in pt-6 pb-6 lg:pt-0 ${pair ? (pair.stack ? 'section-pair section-pair--stack' : 'section-pair') : ''}`}
            style={pair ? ({ '--ar1': pair.ar1, '--share': pair.share } as React.CSSProperties) : undefined}
          >
            {section.media && <div className="section-media">{section.media}</div>}
            {section.body && <div className="section-body max-w-[629px]">{section.body}</div>}
          </article>
        </div>
      </div>

      {/* same footer band as the home page's social links: Next under the
          text's left edge, gone on the last section */}
      <footer className="mx-auto w-full max-w-[calc(var(--media-max)_+_2rem)] flex-none px-4 pt-6 pb-8 leading-[1.6]">
        {index < sections.length - 1 && <button type="button" onClick={() => go(index + 1)} className="cursor-pointer">Next</button>}
      </footer>

      {extras}
    </main>
  )
}
