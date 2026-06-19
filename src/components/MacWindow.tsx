'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import type { Project } from '@/data/projects'
import { Arrow, Close, Resize } from '@/components/icons'

type Props = {
  project: Project
  cascadeIndex: number
  zIndex: number
  onClose: () => void
  onMinimize: () => void
  onFocus: () => void
}

const CASCADE = 26

export default function MacWindow({ project, cascadeIndex, zIndex, onClose, onMinimize, onFocus }: Props) {
  const windowRef = useRef<HTMLDivElement>(null)
  const titlebarRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const dragging = useRef(false)
  const offset = useRef({ x: 0, y: 0 })

  const [scrollFrac, setScrollFrac] = useState(0)
  const [thumbFrac, setThumbFrac] = useState(1)

  const updateScroll = useCallback(() => {
    const el = contentRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    const scrollable = scrollHeight - clientHeight
    setScrollFrac(scrollable > 0 ? scrollTop / scrollable : 0)
    setThumbFrac(scrollHeight > 0 ? clientHeight / scrollHeight : 1)
  }, [])

  useEffect(() => { updateScroll() }, [project, updateScroll])

  useEffect(() => {
    const titlebar = titlebarRef.current
    const win = windowRef.current
    if (!titlebar || !win) return

    const onMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest?.('button')) return
      dragging.current = true
      const rect = win.getBoundingClientRect()
      offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      win.style.transform = 'none'
      win.style.right = 'auto'
      win.style.left = rect.left + 'px'
      win.style.top = rect.top + 'px'
    }
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return
      win.style.left = (e.clientX - offset.current.x) + 'px'
      win.style.top = (e.clientY - offset.current.y) + 'px'
    }
    const onMouseUp = () => { dragging.current = false }

    titlebar.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      titlebar.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  const scrollBy = (delta: number) => {
    contentRef.current?.scrollBy({ top: delta, behavior: 'smooth' })
  }

  const trackH = trackRef.current?.clientHeight ?? 200
  const thumbH = Math.max(24, thumbFrac * trackH)
  const thumbTop = scrollFrac * (trackH - thumbH)

  return (
    <div
      className="fixed bg-white border-2 border-black flex flex-col w-[min(680px,92vw)] max-h-[84vh]"
      ref={windowRef}
      onMouseDown={onFocus}
      style={{
        top: `calc(8vh + ${cascadeIndex * CASCADE}px)`,
        left: `calc(2rem + ${cascadeIndex * CASCADE}px)`,
        zIndex,
      }}
    >
      {/* Title bar */}
      <div
        className="relative flex items-center h-[26px] min-h-[26px] px-3 border-b border-black bg-white cursor-grab active:cursor-grabbing select-none bg-[image:repeating-linear-gradient(to_bottom,black_0px,black_1px,white_1px,white_3px)] [background-size:100%_16px] [background-position:0_50%] [background-repeat:no-repeat]"
        ref={titlebarRef}
      >
        <div className='bg-white shrink-0 flex items-center justify-center p-1'>
          <button
            className="bg-white cursor-pointer shrink-0 relative z-10 active:invert active:scale-100"
            onClick={onClose}
            aria-label="Close"
          >
            <Close />
          </button>
        </div>
        <span className="absolute font-bold bg-white whitespace-nowrap z-10 left-1/2 -translate-x-1/2 text-[16px] leading-none py-[2px] px-[10px]">
          {project.title}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        <div
          className="flex-1 overflow-y-scroll px-8 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          ref={contentRef}
          onScroll={updateScroll}
        >
          <h1>{project.title}</h1>
          <time dateTime={project.date}>{project.date}</time>
          <div className="project-content">{project.content}</div>
        </div>

        {/* Vertical scrollbar */}
        <div className="flex flex-col border-l border-black w-6 min-w-6">
          <button
            className="bg-white p-0 cursor-pointer flex items-center justify-center shrink-0 w-6 h-6 min-h-6 border-b border-black active:bg-black"
            onClick={() => scrollBy(-40)}
            aria-label="Scroll up"
          ><Arrow className="w-[22px] h-[22px] rotate-90" /></button>
          <div
            className="flex-1 relative bg-white bg-[image:radial-gradient(circle,black_1px,transparent_1px)] [background-size:3px_3px]"
            ref={trackRef}
          >
            <div
              className="absolute left-0 right-0 bg-white border border-black min-h-6"
              style={{ top: thumbTop, height: thumbH }}
            />
          </div>
          <button
            className="bg-white p-0 cursor-pointer flex items-center justify-center shrink-0 w-6 h-6 min-h-6 border-t border-black active:bg-black"
            onClick={() => scrollBy(40)}
            aria-label="Scroll down"
          ><Arrow className="w-[22px] h-[22px] -rotate-90" /></button>
        </div>
      </div>

      {/* Horizontal scrollbar */}
      <div className="flex shrink-0 border-t border-black h-6 min-h-6">
        <button
          className="bg-white p-0 cursor-pointer flex items-center justify-center shrink-0 w-6 min-w-6 border-r border-black active:bg-black"
          aria-label="Scroll left"
        ><Arrow className="w-[22px] h-[22px]" /></button>
        <div className="flex-1 bg-white" />
        <button
          className="bg-white p-0 cursor-pointer flex items-center justify-center shrink-0 w-6 min-w-6 border-l border-black active:bg-black"
          aria-label="Scroll right"
        ><Arrow className="w-[22px] h-[22px] rotate-180" /></button>
        <div className="flex items-center justify-center shrink-0 bg-white border-l border-black w-6 min-w-6">
          <Resize />
        </div>
      </div>
    </div>
  )
}
