'use client'

// Colour audit, switched on by adding ?colours to any URL (and ?colours=0
// to switch it off again; it stays on for the tab as you click around).
// Lists every colour the page renders (hex, the token it came from, how
// many elements use it); hovering a row outlines those elements.
// Self-contained: delete this file and its one-line mount in
// app/layout.tsx and nothing else changes.

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const KEY = 'colour-inspector'

function wanted(): boolean {
  try {
    // accepted in the query or, since it is easy to type it there, after
    // the hash: /work/x?colours#chapter and /work/x#chapter?colours both work
    const q = new URLSearchParams(location.search + '&' + (location.hash.split('?')[1] ?? ''))
    if (q.has('colours') || q.has('colors')) {
      const off = ['0', 'off', 'false'].includes((q.get('colours') ?? q.get('colors') ?? '').toLowerCase())
      sessionStorage.setItem(KEY, off ? '' : '1')
    }
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

type Role = 'text' | 'bg' | 'border'
type Entry = { hex: string; names: string[]; roles: Set<Role>; els: Set<Element> }

const HIT = 'ci-hit'

const toHex = (() => {
  const probe = typeof document !== 'undefined' ? document.createElement('span') : null
  return (value: string): string | null => {
    if (!probe || !value) return null
    probe.style.color = ''
    probe.style.color = value
    if (!probe.style.color) return null
    document.body.append(probe)
    const rgb = getComputedStyle(probe).color
    probe.remove()
    const m = rgb.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/)
    if (!m) return null
    if (m[4] !== undefined && Number(m[4]) === 0) return null
    const h = (n: string) => Math.round(Number(n)).toString(16).padStart(2, '0')
    const a = m[4] !== undefined && Number(m[4]) < 1 ? h(String(Number(m[4]) * 255)) : ''
    return `#${h(m[1])}${h(m[2])}${h(m[3])}${a}`
  }
})()

// hex -> custom property names, read from every stylesheet rule
function tokenMap(): Map<string, string[]> {
  const map = new Map<string, string[]>()
  const root = getComputedStyle(document.documentElement)
  const seen = new Set<string>()
  const visit = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule) {
        for (const prop of Array.from(rule.style)) {
          if (!prop.startsWith('--') || prop.startsWith('--tw-') || seen.has(prop)) continue
          seen.add(prop)
          const value = root.getPropertyValue(prop).trim() || rule.style.getPropertyValue(prop).trim()
          if (/^(inherit|initial|unset|revert|currentcolor)?$/i.test(value) || /calc\(|var\(/.test(value)) continue
          const hex = toHex(value)
          if (hex) map.set(hex, [...(map.get(hex) ?? []), prop])
        }
      } else if ('cssRules' in rule) {
        try { visit((rule as CSSGroupingRule).cssRules) } catch {}
      }
    }
  }
  for (const sheet of Array.from(document.styleSheets)) {
    try { visit(sheet.cssRules) } catch {}
  }
  return map
}

function scan(): Entry[] {
  const names = tokenMap()
  const entries = new Map<string, Entry>()
  const add = (hex: string | null, role: Role, el: Element) => {
    if (!hex) return
    let e = entries.get(hex)
    if (!e) entries.set(hex, (e = { hex, names: names.get(hex) ?? [], roles: new Set(), els: new Set() }))
    e.roles.add(role)
    e.els.add(el)
  }
  for (const el of Array.from(document.body.querySelectorAll('*'))) {
    if (el.closest('[data-color-inspector]') || el instanceof SVGElement) continue
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden') continue
    const hasText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent?.trim())
    if (hasText) add(toHex(cs.color), 'text', el)
    add(toHex(cs.backgroundColor), 'bg', el)
    for (const side of ['Top', 'Right', 'Bottom', 'Left'] as const) {
      if (parseFloat(cs[`border${side}Width`]) > 0 && cs[`border${side}Style`] !== 'none') {
        add(toHex(cs[`border${side}Color`]), 'border', el)
        break
      }
    }
  }
  return Array.from(entries.values()).sort((a, b) => b.els.size - a.els.size)
}

export default function ColorInspector() {
  const [on, setOn] = useState(false)
  const [entries, setEntries] = useState<Entry[]>([])
  const [open, setOpen] = useState(true)
  const pathname = usePathname()

  useEffect(() => { setOn(wanted()) }, [pathname])

  useEffect(() => {
    if (!on) return
    // throttled, not debounced: animating media mutates styles every frame,
    // and a debounce would wait forever. At most one scan a second, plus a
    // trailing one once things go quiet.
    let timer: ReturnType<typeof setTimeout> | null = null
    let last = 0
    const run = () => { timer = null; last = Date.now(); setEntries(scan()) }
    const rescan = () => {
      if (timer) return
      timer = setTimeout(run, Math.max(0, 1000 - (Date.now() - last)))
    }
    setTimeout(run, 300)
    const mo = new MutationObserver((muts) => {
      if (muts.some((m) => !(m.target as Element).closest?.('[data-color-inspector]'))) rescan()
    })
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style'] })
    return () => { mo.disconnect(); if (timer) clearTimeout(timer) }
  }, [on, pathname])

  if (!on) return null

  const highlight = (e: Entry | null) => {
    document.querySelectorAll(`.${HIT}`).forEach((el) => el.classList.remove(HIT))
    e?.els.forEach((el) => el.classList.add(HIT))
  }

  return (
    <div data-color-inspector style={{ position: 'fixed', top: 8, right: 8, zIndex: 99999, font: '11px/1.4 ui-monospace, monospace', color: '#000' }}>
      <style>{`.${HIT}{outline:2px solid #ff00ff!important;outline-offset:1px!important;background-image:linear-gradient(rgba(255,0,255,.18),rgba(255,0,255,.18))!important}`}</style>
      <button type="button" onClick={() => setOpen(!open)} style={{ float: 'right', position: 'relative', zIndex: 1, background: '#fff', border: '1px solid #000', borderBottom: open ? 'none' : '1px solid #000', marginBottom: open ? -1 : 0, padding: open ? '2px 6px 3px' : '2px 6px', cursor: 'pointer', font: 'inherit' }}>
        {open ? 'colours ×' : `colours (${entries.length})`}
      </button>
      {open && (
        <table style={{ clear: 'both', background: '#fff', border: '1px solid #000', borderCollapse: 'collapse' }} onMouseLeave={() => highlight(null)}>
          <tbody>
            {entries.map((e) => (
              <tr key={e.hex} onMouseEnter={() => highlight(e)} style={{ cursor: 'default' }}>
                <td style={{ padding: '3px 6px' }}><span style={{ display: 'inline-block', width: 14, height: 14, background: e.hex, border: '1px solid #0003', verticalAlign: 'middle' }} /></td>
                <td style={{ padding: '3px 6px' }}>{e.hex}</td>
                <td style={{ padding: '3px 6px', color: e.names.length ? '#000' : '#c00' }}>{e.names.join(' ') || 'no token'}</td>
                <td style={{ padding: '3px 6px', color: '#666' }}>{Array.from(e.roles).join(' ')}</td>
                <td style={{ padding: '3px 6px', textAlign: 'right' }}>{e.els.size}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
