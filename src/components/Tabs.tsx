'use client'

import { Fragment } from 'react'

// Plain-text tabs in the page's own voice: "Work (11) / Playground (7)".
// The selected one, count included, is the dark text colour; the rest are
// grey until hovered.

export type TabOption<T extends string> = { id: T; label: string; count: number }

const tab = 'bg-transparent border-none p-0 [font:inherit] cursor-pointer transition-colors duration-150'

export function Tabs<T extends string>({
  options,
  value,
  onChange,
  name,
}: {
  options: TabOption<T>[]
  value: T
  onChange: (id: T) => void
  name: string
}) {
  return (
    <div role="tablist" aria-label={name}>
      {options.map((o, i) => (
        <Fragment key={o.id}>
          {i > 0 && ' / '}
          <button
            type="button"
            role="tab"
            aria-selected={o.id === value}
            className={`${tab} ${o.id === value ? 'text-neutral-800' : 'text-neutral-400 hover:text-neutral-800'}`}
            onClick={() => onChange(o.id)}
          >
            {o.label} ({o.count})
          </button>
        </Fragment>
      ))}
    </div>
  )
}
