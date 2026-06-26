'use client'

import { useState, useEffect } from 'react'
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

function Row({ item, index, typeIn }: { item: Item; index: number; typeIn?: boolean }) {
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
    <li className={`flex gap-[2ch]${typeIn && !titleDone ? ' pointer-events-none' : ''}`}>
      <span className="tabular-nums w-[4ch] shrink-0 text-neutral-400">
        {typeIn ? item.year.slice(0, yearCount) : item.year}
      </span>
      <TypewriterItem tagline={item.tagline}>
        {titleNode}
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
          {open && older.map((item, i) => <Row key={item.href} item={item} index={i} typeIn />)}
        </>
      )}
    </ul>
  )
}
