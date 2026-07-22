'use client'
/* ------------------------------------------------------------------
   Presents a fixed-size interactive demo like a piece of media: the
   same bordered card the article images use, with the demo scaled to
   fit the column. Registers its focusable root so the coordinator can
   auto-focus the centred demo (and aim the "Try me" pointer at it).
   ------------------------------------------------------------------ */
import { useEffect, useRef, useState } from 'react'
import { registerDemo } from './focusManager'

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

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setCw(el.clientWidth))
    ro.observe(el)
    setCw(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const root = figureRef.current?.querySelector<HTMLElement>('[tabindex="0"]')
    if (!root) return
    return registerDemo(root)
  }, [cw])

  const scale = cw ? Math.min(1, cw / designWidth) : 0
  const left = cw ? (cw - designWidth * scale) / 2 : 0

  return (
    <figure
      ref={figureRef}
      className="wf-demo relative my-[54px] overflow-hidden rounded-[12px] border border-[rgba(50,50,50,0.12)] bg-transparent shadow-[var(--shadow-media)] select-none"
    >
      <div className="px-4 pb-6 pt-6">
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
    </figure>
  )
}
