'use client'
/* ------------------------------------------------------------------
   Presents a fixed-size interactive demo like a piece of media: the
   same bordered, shadowed card the article images use, with the demo
   scaled to fit the column. The demo nearest the viewport centre is
   auto-focused (via the coordinator) — when active its border darkens
   and an "Interactive..." label types itself out.
   ------------------------------------------------------------------ */
import { useEffect, useRef, useState } from 'react'
import { registerDemo } from './focusManager'

const LABEL = 'Interactive...'

export function DemoFrame({
  designWidth,
  designHeight,
  children,
}: {
  designWidth: number
  designHeight: number
  children: React.ReactNode
}) {
  const figureRef = useRef<HTMLElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const [cw, setCw] = useState(0)
  const [active, setActive] = useState(false)
  const [typed, setTyped] = useState(0)

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setCw(el.clientWidth))
    ro.observe(el)
    setCw(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  // register the demo's focusable root; the coordinator focuses the
  // centred demo and flags it active
  useEffect(() => {
    const root = figureRef.current?.querySelector<HTMLElement>('[tabindex="0"]')
    if (!root) return
    return registerDemo(root, setActive)
  }, [cw])

  // type the label out while active
  useEffect(() => {
    if (!active) {
      setTyped(0)
      return
    }
    let i = 0
    setTyped(0)
    const id = setInterval(() => {
      i += 1
      setTyped(i)
      if (i >= LABEL.length) clearInterval(id)
    }, 85)
    return () => clearInterval(id)
  }, [active])

  const scale = cw ? Math.min(1, cw / designWidth) : 0
  const left = cw ? (cw - designWidth * scale) / 2 : 0

  return (
    <figure
      ref={figureRef}
      className={`wf-demo relative my-[54px] overflow-hidden rounded-[12px] border bg-[#fcfcfc] shadow-[var(--shadow-media)] transition-colors duration-[600ms] select-none ${
        active ? 'border-[rgba(50,50,50,0.3)]' : 'border-[rgba(50,50,50,0.12)]'
      }`}
    >
      <div className="px-4 pb-6 pt-8">
        <div
          ref={boxRef}
          className="relative w-full"
          style={
            cw
              ? { height: designHeight * scale }
              : { aspectRatio: `${designWidth} / ${designHeight}` }
          }
        >
          {cw > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left,
                width: designWidth,
                height: designHeight,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              {children}
            </div>
          )}
        </div>
      </div>

      {active && (
        <span className="pointer-events-none absolute left-4 top-3 text-[11px] leading-none text-neutral-800">
          {LABEL.slice(0, typed)}
          <span className="cursor-blink">|</span>
        </span>
      )}
    </figure>
  )
}
