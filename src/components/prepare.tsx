import { Children, Fragment, createElement, isValidElement, type ReactNode } from 'react'
import type { Project, Section } from '@/data/projects'
import { glue, runs } from '@/components/glue'
import { pairColumn, naturalWidth, wideMedia, type PairColumn } from '@/components/pairColumn'

export type Prepared = Section & { pair?: PairColumn | null; natural?: string; wide?: boolean }

// A project's sections with their media measured and text glued, on the
// server while they are still plain elements (see glue.ts for why).
export function prepare(project: Project): Prepared[] {
  return project.sections.map(s => {
    const pair = pairColumn(s.media)
    return { ...s, body: runs(glue(s.body)), pair, natural: naturalWidth(s.media), wide: wideMedia(s.media) }
  })
}

const textOf = (node: ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children)
  return ''
}

// a paragraph's blocks: the body is one element or a fragment of them
const blocksOf = (body: ReactNode): ReactNode[] =>
  isValidElement<{ children?: ReactNode }>(body) && body.type === Fragment ? Children.toArray(body.props.children) : Children.toArray(body)

// Tried at /1: text that wouldn't fit beside its media in `lines` lines
// moves to a text-only screen of the same title right after it, so
// nothing is ever clipped. Lines are estimated from the text, at about
// 72 characters to a balanced line of the 629px column, with a paragraph
// gap counting as most of a line.
export function fit(sections: Prepared[], lines = 4): Prepared[] {
  const out: Prepared[] = []
  for (const s of sections) {
    if (!s.media || !s.body) {
      out.push(s)
      continue
    }
    const blocks = blocksOf(s.body)
    const kept: ReactNode[] = []
    let used = 0
    for (const block of blocks) {
      const need = Math.ceil(textOf(block).length / 72) + (kept.length ? 0.6 : 0)
      if (used + need > lines) break
      used += need
      kept.push(block)
    }
    const rest = blocks.slice(kept.length)
    out.push({ ...s, body: kept.length ? createElement(Fragment, null, ...kept) : undefined })
    if (rest.length) out.push({ title: s.title, body: createElement(Fragment, null, ...rest) })
  }
  return out
}
