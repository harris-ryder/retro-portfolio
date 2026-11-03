import React from 'react'

/** A figure drawn in monospace text: +---+ boxes, dashed connectors, one warm
 *  accent on the thing the chapter is about, green and red for status, dim for
 *  what is inactive or structural. Real text, so nothing can bleed or clip.
 *
 *  Markup inside the string: «k|text» wraps text in a class, where k is
 *    a  accent        g  success        r  failure        d  dim
 *    p  pill (label)  h  pill, accent   b  ink, bold
 *  Everything else is plain ink. Runs of two or more structural characters
 *  (+ - | . : = > <) and lone + or | are dimmed automatically, so a box's
 *  frame sits back behind its words. Markers take no width, so align the
 *  visible text as it will render. */

const CLASS: Record<string, string> = { a: 'ascii-a', g: 'ascii-g', r: 'ascii-r', d: 'ascii-d', p: 'ascii-p', h: 'ascii-h', b: 'ascii-b' }

// the dim runs in plain text: a frame or connector, never a hyphenated word
const STRUCTURE = /([+\-|.:=<>'`^]{2,}|(?<![A-Za-z0-9])[+|](?![A-Za-z0-9]))/g

function plain(text: string, key: number): React.ReactNode[] {
  const out: React.ReactNode[] = []
  let last = 0, i = 0
  for (const m of text.matchAll(STRUCTURE)) {
    const at = m.index ?? 0
    if (at > last) out.push(text.slice(last, at))
    out.push(<span key={`${key}.${i++}`} className="ascii-d">{m[0]}</span>)
    last = at + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export function Ascii({ children, label }: { children: string; label: string }) {
  // drop a leading newline and the common indent, so the source can be laid out as it reads
  const lines = children.replace(/^\n/, '').replace(/\n[ \t]*$/, '').split('\n')
  const indent = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)![0].length))
  const text = lines.map(l => l.slice(indent)).join('\n')

  const nodes: React.ReactNode[] = []
  const re = /«([a-z])\|([^»]*)»/g
  let last = 0, k = 0
  for (const m of text.matchAll(re)) {
    const at = m.index ?? 0
    if (at > last) nodes.push(...plain(text.slice(last, at), k++))
    nodes.push(<span key={k++} className={CLASS[m[1]] ?? ''}>{m[2]}</span>)
    last = at + m[0].length
  }
  if (last < text.length) nodes.push(...plain(text.slice(last), k++))

  return <pre className="ascii" role="img" aria-label={label}>{nodes}</pre>
}
