'use client'

import { Children, Fragment, cloneElement, isValidElement, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { SequenceContext, type Sequence } from '@/components/VideoSequence'
import { Video } from '@/components/Video'
import { onceFullyInView } from '@/components/inView'

type Props = {
  children: ReactNode
  // one label per child, e.g. ['Before', 'After']
  labels: string[]
  // how long a still is shown before the flip, in ms
  hold?: number
}

type AssetProps = { width?: number; height?: number; src?: string; bar?: ReactNode }

// A Before / After pair (or longer run) shown one asset at a time in one
// slot, with a "Before / After" switch in the voice of the page's other
// text: the one on show dark, the rest grey, each a button. On a video
// the switch sits at the right end of the scrub bar's row; under a still
// it gets a line of its own. The round begins once the slot is fully on
// screen (or when one is chosen): a video flips to the next asset when
// it ends, a still after a hold, the last back to the first, and
// choosing one starts the round from it. Assets crossfade, and only the
// one on show can be pointed at. The slot is as wide as the widest asset
// at the height budget (see naturalWidth in pairColumn.ts); narrower
// ones sit centred.
export function Flip({ children, labels, hold = 4000 }: Props) {
  const items = Children.toArray(children)
  const [index, setIndex] = useState(0)
  const [started, setStarted] = useState(false)
  const slotRef = useRef<HTMLDivElement>(null)

  // videos inside neither autoplay nor loop; this component plays them
  const sequence = useMemo<Sequence>(() => ({ register: () => () => {} }), [])

  // the round waits for the slot to be fully on screen
  useEffect(() => {
    const slot = slotRef.current
    if (!slot || started) return
    return onceFullyInView(slot, () => setStarted(true))
  }, [started])

  useEffect(() => {
    const slot = slotRef.current
    if (!slot || !started) return
    const next = () => setIndex(i => (i + 1) % items.length)
    const videos = Array.from(slot.children).map(item => item.querySelector('video'))
    videos.forEach((video, i) => {
      if (video && i !== index) video.pause()
    })
    const video = videos[index]
    if (video) {
      video.currentTime = 0
      void video.play().catch(() => {})
      video.addEventListener('ended', next)
      return () => video.removeEventListener('ended', next)
    }
    const timer = window.setTimeout(next, hold)
    return () => window.clearTimeout(timer)
  }, [index, items.length, hold, started])

  // choosing an asset starts the round from it, on screen or not
  const choose = (j: number) => {
    setStarted(true)
    setIndex(j)
  }

  const switcher = (
    <span className="flip-switch [&_button]:cursor-pointer [&_button]:outline-none [&_button]:transition-colors">
      {labels.map((label, j) => (
        <Fragment key={label}>
          {j > 0 && <span className="text-neutral-400"> / </span>}
          <button type="button" onClick={() => choose(j)} aria-pressed={j === index} className={j === index ? '' : 'text-neutral-400 hover:text-neutral-800'}>
            {label}
          </button>
        </Fragment>
      ))}
    </span>
  )

  return (
    <SequenceContext.Provider value={sequence}>
      <div ref={slotRef} className="flip">
        {items.map((item, i) => {
          const asset = isValidElement<AssetProps>(item) ? item : null
          const ar = asset?.props.width && asset.props.height ? asset.props.width / asset.props.height : undefined
          const isVideo = !!asset && (asset.type === Video || /\.mp4$/.test(asset.props.src ?? ''))
          return (
            <div key={i} className="flip-item" data-on={i === index} aria-hidden={i !== index}>
              <div className="flip-asset" style={ar ? ({ '--ar': ar } as React.CSSProperties) : undefined}>
                {isVideo && asset ? cloneElement(asset, { bar: switcher }) : item}
                {!isVideo && <p className="flip-switch-row">{switcher}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </SequenceContext.Provider>
  )
}
