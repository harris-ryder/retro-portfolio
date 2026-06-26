'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TypewriterItem } from '@/components/TypewriterItem'

type Item = {
  year: string
  title: string
  tagline: string
  href: string
  external: boolean
}

const itemLink = 'no-underline cursor-pointer'

function Row({ item, index, animate }: { item: Item; index: number; animate?: boolean }) {
  return (
    <li
      className="flex gap-[2ch]"
      style={animate ? { animation: 'fade-in 0.3s ease both', animationDelay: `${index * 40}ms` } : undefined}
    >
      <span className="tabular-nums w-[4ch] shrink-0 text-neutral-400">{item.year}</span>
      <TypewriterItem tagline={item.tagline}>
        {item.external
          ? <a className={itemLink} href={item.href} target="_blank" rel="noopener noreferrer">{item.title}</a>
          : <Link className={itemLink} href={item.href}>{item.title}</Link>
        }
      </TypewriterItem>
    </li>
  )
}

export function ProjectList({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false)

  const recent = items.filter(i => Number(i.year) >= 2024)
  const older = items.filter(i => Number(i.year) <= 2023)

  return (
    <ul className="list-none pl-0 [&>li]:mb-2">
      {recent.map((item, i) => <Row key={item.href} item={item} index={i} />)}

      {older.length > 0 && (
        <>
          {!open && (
            <li className="flex gap-[2ch]">
              <span className="tabular-nums w-[4ch] shrink-0 text-neutral-400">2023</span>
              <button
                onClick={() => setOpen(true)}
                className="no-underline cursor-pointer text-neutral-400 hover:text-neutral-800 transition-colors duration-150 bg-transparent border-none p-0 font-[inherit] text-[inherit]"
              >
                Older projects
              </button>
            </li>
          )}
          {open && older.map((item, i) => <Row key={item.href} item={item} index={i} animate />)}
        </>
      )}
    </ul>
  )
}
