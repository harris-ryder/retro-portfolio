'use client'

import { useState, useRef } from 'react'
import MacWindow from '@/components/MacWindow'
import BrowserWindow, { type BrowserTab } from '@/components/BrowserWindow'
import { projects, projectsBySlug } from '@/data/projects'
import type { Project } from '@/data/projects'

type WinState = {
  id: string
  project: Project
  cascade: number
  minimized: boolean
}

type BrowserState = {
  open: boolean
  minimized: boolean
  cascade: number
  tabs: BrowserTab[]
  activeTabId: string
}

const browserLinks = [
  { year: '2025', title: 'ModelNote', url: 'https://modelnote.io/' },
  { year: '2025', title: 'Everything', url: 'https://everything.harris-ryder.com/' },
  { year: '2025', title: 'Crema', label: 'Crema (WIP)', url: 'https://singyulam.com/crema' },
  { year: '2024', title: 'CRT Shader', url: 'https://shader-crt.harris-ryder.com/' },
  { year: '2024', title: 'Planet Shader', url: 'https://advanced-planet-shader-git-main-harris-ryders-projects.vercel.app/' },
  { year: '2025', title: 'Architecture Portfolio', url: 'https://www.letiryder.com/' },
  { year: '2024', title: 'Old portfolio', url: 'https://portfolio-six-hazel-78.vercel.app/' },
]

const itemBtn = 'bg-transparent p-0 underline cursor-pointer [text-transform:inherit] text-left'

export default function Home() {
  const [windows, setWindows] = useState<WinState[]>([])
  const [zOrder, setZOrder] = useState<string[]>([])
  const [browser, setBrowser] = useState<BrowserState | null>(null)
  const nextId = useRef(0)
  const nextCascade = useRef(0)
  const nextTabId = useRef(0)

  const focusWindow = (id: string) =>
    setZOrder(prev => [...prev.filter(i => i !== id), id])

  const open = (slug: string) => {
    const p = projectsBySlug[slug]
    if (!p) return
    const existing = windows.find(w => w.project.slug === slug)
    if (existing) {
      setWindows(prev => prev.map(w => w.id === existing.id ? { ...w, minimized: false } : w))
      focusWindow(existing.id)
      return
    }
    const id = `w${nextId.current++}`
    const cascade = nextCascade.current++ % 8
    setWindows(prev => [...prev, { id, project: p, cascade, minimized: false }])
    setZOrder(prev => [...prev, id])
  }

  const openInBrowser = (title: string, url: string) => {
    const tabId = `t${nextTabId.current++}`
    setBrowser(prev => {
      if (!prev) {
        const cascade = nextCascade.current++ % 8
        setZOrder(zo => [...zo, 'browser'])
        return { open: true, minimized: false, cascade, tabs: [{ id: tabId, title, url }], activeTabId: tabId }
      }
      const existing = prev.tabs.find(t => t.url === url)
      if (existing) {
        setZOrder(zo => [...zo.filter(i => i !== 'browser'), 'browser'])
        return { ...prev, open: true, minimized: false, activeTabId: existing.id }
      }
      setZOrder(zo => [...zo.filter(i => i !== 'browser'), 'browser'])
      return { ...prev, open: true, minimized: false, tabs: [...prev.tabs, { id: tabId, title, url }], activeTabId: tabId }
    })
  }

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id))
    setZOrder(prev => prev.filter(i => i !== id))
  }

  const minimizeWindow = (id: string) =>
    setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: true } : w))

  const restoreWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: false } : w))
    focusWindow(id)
  }

  const closeBrowserTab = (tabId: string) => {
    setBrowser(prev => {
      if (!prev) return null
      const tabs = prev.tabs.filter(t => t.id !== tabId)
      if (tabs.length === 0) {
        setZOrder(zo => zo.filter(i => i !== 'browser'))
        return null
      }
      const activeTabId = prev.activeTabId === tabId
        ? tabs[tabs.length - 1].id
        : prev.activeTabId
      return { ...prev, tabs, activeTabId }
    })
  }

  const browserZIndex = 100 + zOrder.indexOf('browser')
  const allMinimized = windows.filter(w => w.minimized)
  const browserMinimized = browser?.minimized ?? false

  return (
    <main aria-label="Content" className="flex justify-center md:justify-end items-center text-[15px] leading-[1.9]">
      <div className="px-10 py-8 lg:pr-16">
        <header className="mb-8">
          <h1 className="font-normal text-[1rem]">Harris Ryder</h1>
        </header>

        <p className="mb-8">
          Design Engineer at{' '}
          <a href="https://nothing.tech/" target="_blank" rel="noopener noreferrer">Nothing</a>
          {' · prev '}
          <a href="https://www.workflow.design/" target="_blank" rel="noopener noreferrer">Workflow</a>
        </p>

        <p className="mb-8">
          <a href="https://x.com/isHarrisRyder" target="_blank" rel="noopener noreferrer">X</a>
          {' · '}
          <a href="mailto:harrisryder321@gmail.com">Email</a>
          {' · '}
          <a href="https://www.linkedin.com/in/harris-ryder/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          {' · '}
          <a href="https://github.com/harris-ryder" target="_blank" rel="noopener noreferrer">GitHub</a>
        </p>

        <ul className="list-none pl-0 [&>li]:my-[0.4rem]">
          {browserLinks.map(link => (
            <li key={link.url} className="flex gap-[2ch]">
              <span className="tabular-nums w-[4ch] shrink-0">{link.year}</span>
              <button className={itemBtn} onClick={() => openInBrowser(link.title, link.url)}>
                {link.label ?? link.title}
              </button>
            </li>
          ))}
          {projects.map(p => (
            <li key={p.slug} className="flex gap-[2ch]">
              <span className="tabular-nums w-[4ch] shrink-0">{p.date}</span>
              <button className={itemBtn} onClick={() => open(p.slug)}>
                {p.title}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {windows.filter(w => !w.minimized).map(w => (
        <MacWindow
          key={w.id}
          project={w.project}
          cascadeIndex={w.cascade}
          zIndex={100 + zOrder.indexOf(w.id)}
          onClose={() => closeWindow(w.id)}
          onMinimize={() => minimizeWindow(w.id)}
          onFocus={() => focusWindow(w.id)}
        />
      ))}

      {browser && !browser.minimized && (
        <BrowserWindow
          tabs={browser.tabs}
          activeTabId={browser.activeTabId}
          cascadeIndex={browser.cascade}
          zIndex={browserZIndex}
          onClose={() => {
            setBrowser(null)
            setZOrder(prev => prev.filter(i => i !== 'browser'))
          }}
          onFocus={() => setZOrder(prev => [...prev.filter(i => i !== 'browser'), 'browser'])}
          onTabClose={closeBrowserTab}
          onTabSelect={tabId => setBrowser(prev => prev ? { ...prev, activeTabId: tabId } : null)}
        />
      )}

      {(allMinimized.length > 0 || browserMinimized) && (
        <div className="fixed bottom-4 left-4 flex gap-2 z-[9999]">
          {allMinimized.map(w => (
            <button key={w.id} className="border-2 border-black bg-white cursor-pointer px-[10px] py-[2px] text-[11px] shadow-[2px_2px_0_black] [text-transform:inherit]" onClick={() => restoreWindow(w.id)}>
              {w.project.title}
            </button>
          ))}
          {browserMinimized && (
            <button className="border-2 border-black bg-white cursor-pointer px-[10px] py-[2px] text-[11px] shadow-[2px_2px_0_black] [text-transform:inherit]" onClick={() => {
              setBrowser(prev => prev ? { ...prev, minimized: false } : null)
              setZOrder(prev => [...prev.filter(i => i !== 'browser'), 'browser'])
            }}>
              Browser
            </button>
          )}
        </div>
      )}
    </main>
  )
}
