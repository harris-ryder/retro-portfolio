'use client'
/* ------------------------------------------------------------------
   Presents a fixed-size interactive demo like a piece of media: the
   same bordered, shadowed card the article images use, with the demo
   scaled down to fit the column.
   ------------------------------------------------------------------ */
import { useEffect, useRef, useState } from 'react'

export function DemoFrame({
  designWidth,
  designHeight,
  children,
}: {
  designWidth: number
  designHeight: number
  children: React.ReactNode
}) {
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

  const scale = cw ? Math.min(1, cw / designWidth) : 0
  const left = cw ? (cw - designWidth * scale) / 2 : 0

  return (
    <figure className="wf-demo my-[54px] overflow-hidden rounded-[12px] border border-[rgba(50,50,50,0.12)] bg-[#fcfcfc] shadow-[var(--shadow-media)] select-none">
      <div className="p-6">
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
