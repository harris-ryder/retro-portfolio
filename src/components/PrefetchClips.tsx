'use client'

import { useEffect } from 'react'

// Fetches the Work list's clips into the browser's cache ahead of time,
// so pointing at a row on the Work page plays its clip without a wait.
// Rendered on the home page and the Work page; renders nothing itself.
// Only where the peek shows (wide screens), and not when the browser asks
// to save data. One clip after another in list order, so the top rows
// are ready first. Leaving the page part-way stops the download, and the
// clips not yet fetched are tried again on the next page that asks.
const done = new Set<string>()

export function PrefetchClips({ urls }: { urls: string[] }) {
  useEffect(() => {
    if (!window.matchMedia('(min-width: 1024px)').matches) return
    if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return
    const pending = urls.filter(url => !done.has(url))
    if (!pending.length) return
    const controller = new AbortController()
    void (async () => {
      for (const url of pending) {
        try {
          const res = await fetch(url, { signal: controller.signal })
          // the cache entry is only complete once the body has been read
          await res.arrayBuffer()
          if (res.ok) done.add(url)
        } catch {
          return
        }
      }
    })()
    return () => controller.abort()
  }, [urls])
  return null
}
