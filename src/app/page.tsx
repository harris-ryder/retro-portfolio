'use client'

import { useState, useRef } from 'react'
import MacWindow from '@/components/MacWindow'
import { projects, projectsBySlug } from '@/data/projects'
import type { Project } from '@/data/projects'

type WinState = {
  id: string
  project: Project
  cascade: number
  minimized: boolean
}

export default function Home() {
  const [windows, setWindows] = useState<WinState[]>([])
  const [zOrder, setZOrder] = useState<string[]>([])
  const nextId = useRef(0)
  const nextCascade = useRef(0)

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

  return (
    <main aria-label="Content">
      <div className="px-10 py-16 ml-[66.67%]">
        <header>
          <h1>Harris Ryder</h1>
        </header>
        <ul className="sections">
          <li>Design Engineer at <a href="https://nothing.tech/" target="_blank" rel="noopener noreferrer">Nothing.Tech</a> · prev <a href="https://www.workflow.design/" target="_blank" rel="noopener noreferrer">Workflow Design</a></li>
          <li>contact</li>
          <ul>
            <li><a href="mailto:harrisryder321@gmail.com">email</a></li>
            <li><a href="https://www.linkedin.com/in/harris-ryder/" target="_blank" rel="noopener noreferrer">linkedin</a></li>
            <li><a href="https://github.com/harris-ryder" target="_blank" rel="noopener noreferrer">github</a></li>
          </ul>
          <li>projects</li>
          <ul>
            <li>2025 <a href="https://modelnote.io/" target="_blank" rel="noopener noreferrer">ModelNote</a></li>
            <li>2025 <a href="https://everything.harris-ryder.com/" target="_blank" rel="noopener noreferrer">Everything</a></li>
            <li>2025 <a href="https://singyulam.com/crema" target="_blank" rel="noopener noreferrer">Crema</a> (WIP)</li>
            <li>2024 <a href="https://shader-crt.harris-ryder.com/" target="_blank" rel="noopener noreferrer">CRT Shader</a></li>
            <li>2024 <a href="https://advanced-planet-shader-git-main-harris-ryders-projects.vercel.app/" target="_blank" rel="noopener noreferrer">Planet Shader</a></li>
            <li>2025 <a href="https://www.letiryder.com/" target="_blank" rel="noopener noreferrer">Architecture Portfolio</a></li>
            <li>2024 <a href="https://portfolio-six-hazel-78.vercel.app/" target="_blank" rel="noopener noreferrer">Old portfolio</a></li>
            {projects.map(p => (
              <li key={p.slug}>
                {p.date} <button className="bg-transparent p-0 underline cursor-pointer [text-transform:inherit]" onClick={() => open(p.slug)}>{p.title}</button>
              </li>
            ))}
          </ul>
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

      {windows.some(w => w.minimized) && (
        <div className="fixed bottom-4 left-4 flex gap-2 z-[9999]">
          {windows.filter(w => w.minimized).map(w => (
            <button key={w.id} className="border-2 border-black bg-white cursor-pointer px-[10px] py-[2px] text-[11px] shadow-[2px_2px_0_black] [text-transform:inherit]" onClick={() => restoreWindow(w.id)}>
              {w.project.title}
            </button>
          ))}
        </div>
      )}
    </main>
  )
}
