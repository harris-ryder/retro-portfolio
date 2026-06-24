'use client'

import { useRef, useEffect } from 'react'
import { Close } from '@/components/icons'

export type BrowserTab = {
  id: string
  title: string
  url: string
}

type Props = {
  tabs: BrowserTab[]
  activeTabId: string
  cascadeIndex: number
  zIndex: number
  onClose: () => void
  onFocus: () => void
  onTabClose: (tabId: string) => void
  onTabSelect: (tabId: string) => void
}

const CASCADE = 26

export default function BrowserWindow({ tabs, activeTabId, cascadeIndex, zIndex, onClose, onFocus, onTabClose, onTabSelect }: Props) {
  const windowRef = useRef<HTMLDivElement>(null)
  const titlebarRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const offset = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const titlebar = titlebarRef.current
    const win = windowRef.current
    if (!titlebar || !win) return

    const onMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest?.('button, [data-tabs]')) return
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

  return (
    <div
      className="fixed bg-white border-2 border-black flex flex-col w-[min(960px,92vw)] h-[82vh]"
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
        <div className="bg-white shrink-0 flex items-center justify-center p-1">
          <button
            className="bg-white cursor-pointer shrink-0 relative z-10 active:invert active:scale-100"
            onClick={onClose}
            aria-label="Close browser"
          >
            <Close />
          </button>
        </div>
        <span className="absolute font-bold bg-white whitespace-nowrap z-10 left-1/2 -translate-x-1/2 text-[16px] leading-none py-[2px] px-[10px]">
          Netscape
        </span>
      </div>

      {/* Tab bar */}
      <div
        data-tabs
        className="flex border-b border-black overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0"
      >
        {tabs.map(tab => {
          const isActive = tab.id === activeTabId
          return (
            <div
              key={tab.id}
              className={`flex items-center gap-2 px-3 border-r border-black cursor-pointer shrink-0 h-[32px] ${isActive ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'}`}
              onClick={() => onTabSelect(tab.id)}
            >
              <span className="text-[15px] max-w-[140px] truncate leading-none">{tab.title}</span>
              <button
                className="p-0 cursor-pointer shrink-0 text-[14px] leading-none bg-transparent"
                onClick={e => { e.stopPropagation(); onTabClose(tab.id) }}
                aria-label={`Close ${tab.title}`}
              >
                ×
              </button>
            </div>
          )
        })}
      </div>

      {/* iframe area */}
      <div className="flex-1 relative overflow-hidden">
        {tabs.map(tab => (
          <iframe
            key={tab.id}
            src={tab.url}
            title={tab.title}
            className="absolute inset-0 w-full h-full border-0"
            style={{ display: tab.id === activeTabId ? 'block' : 'none' }}
          />
        ))}
      </div>

      {/* URL bar */}
      <div className="shrink-0 border-t border-black px-3 h-[26px] flex items-center bg-white overflow-hidden">
        <span className="text-[13px] text-black truncate select-text font-mono">
          {tabs.find(t => t.id === activeTabId)?.url ?? ''}
        </span>
      </div>
    </div>
  )
}
