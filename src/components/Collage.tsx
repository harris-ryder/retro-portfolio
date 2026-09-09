import type { MediaItem } from '@/components/Reel'

// A justified row of images that runs from one edge of the screen to the
// other. Every image gets the same height; widths follow their aspect
// ratios so together they fill the row exactly. It is a plain flex trick:
// each item's flex-basis and flex-grow are both proportional to its aspect,
// so however the row grows the widths stay in ratio and the heights match.
// When the row would drop below the minimum height (a phone), the items
// wrap into two or more rows, each justified the same way. Images are shown
// raw, edge to edge with a small gap, like a mood board.

type Props = {
  items: MediaItem[]
  /** the row never gets shorter than this before wrapping, in px */
  minHeight?: number
  /** ...and on narrow screens */
  minHeightMobile?: number
  gap?: number
  label?: string
}

export function Collage({ items, minHeight = 180, minHeightMobile = 110, gap = 8, label = 'Image collage' }: Props) {
  return (
    <div
      className="collage"
      role="group"
      aria-label={label}
      style={{ '--min-h-desktop': `${minHeight}px`, '--min-h-mobile': `${minHeightMobile}px`, '--gap': `${gap}px` } as React.CSSProperties}
    >
      {items.map(item => (
        <figure key={item.src} className="collage-item" style={{ '--ar': item.width / item.height } as React.CSSProperties}>
          <img src={item.src} alt={item.alt ?? ''} width={item.width} height={item.height} loading="lazy" decoding="async" draggable={false} />
        </figure>
      ))}
    </div>
  )
}
