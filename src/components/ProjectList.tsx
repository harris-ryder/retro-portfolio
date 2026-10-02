'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export type Item = {
  year: string
  title: string
  /** a line about it; kept with the entry, not shown at present */
  tagline?: string
  href: string
  external: boolean
}

const itemLink = 'no-underline cursor-pointer'
// kept as a plain string: Tailwind's build scan only extracts classes it
// can see whole, not ones glued to a template expression. The rows meet
// edge to edge (padding, not a margin, between them), so pointing
// anywhere along one, text or not, counts as pointing at it.
const row = 'flex gap-[2ch] py-1'

function useTypeIn(text: string, active: boolean, startDelay: number) {
  const [count, setCount] = useState(active ? 0 : text.length)
  useEffect(() => {
    if (!active) return
    const t = setTimeout(() => {
      let i = 0
      const id = setInterval(() => {
        i++
        setCount(i)
        if (i >= text.length) clearInterval(id)
      }, 38)
      return () => clearInterval(id)
    }, startDelay)
    return () => clearTimeout(t)
  }, [active, text, startDelay])
  return count
}

type Hover = (index: number | null) => void

function Row({ item, index, typeIn, onHover }: { item: Item; index: number; typeIn?: boolean; onHover?: Hover }) {
  const rowDelay = index * 120
  const yearCount = useTypeIn(item.year, !!typeIn, rowDelay)
  const titleCount = useTypeIn(item.title, !!typeIn, rowDelay)
  const titleDone = titleCount >= item.title.length

  const titleNode = titleDone
    ? (item.external
        ? <a className={itemLink} href={item.href} target="_blank" rel="noopener noreferrer">{item.title}</a>
        : <Link className={itemLink} href={item.href}>{item.title}</Link>)
    : <span>{item.title.slice(0, titleCount)}<span className="opacity-50">|</span></span>

  return (
    <li
      className={typeIn && !titleDone ? `${row} pointer-events-none` : row}
      onMouseEnter={() => onHover?.(index)}
      onMouseLeave={() => onHover?.(null)}
      onFocus={() => onHover?.(index)}
      onBlur={() => onHover?.(null)}
    >
      <span className="tabular-nums w-[4ch] shrink-0 text-neutral-400">
        {typeIn ? item.year.slice(0, yearCount) : item.year}
      </span>
      {titleNode}
    </li>
  )
}

// onHover is told which row is pointed at or focused (null for none)
export function ProjectList({ items, typeIn, onHover }: { items: Item[]; typeIn?: boolean; onHover?: Hover }) {
  return (
    <ul className="list-none pl-0">
      {items.map((item, i) => <Row key={item.href} item={item} index={i} typeIn={typeIn} onHover={onHover} />)}
    </ul>
  )
}
