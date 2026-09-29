import { Children, isValidElement } from 'react'

// A pair's first asset and the text share one column. The first asset's
// aspect ratio and its share of the row let CSS give the text the same
// width the row gives that cell (see .section-pair in globals.css).
export type PairColumn = { ar1: number; share: number; stack: boolean }

// the gap between a row's cells and between a grid's rows (1rem)
const GAP = 16

const ratio = (child: React.ReactNode) =>
  isValidElement<{ width?: number; height?: number }>(child) && child.props.width && child.props.height
    ? child.props.width / child.props.height
    : 0

// A MediaRow's aspect ratios, or null for anything else. These run on the
// server, where a section's media is still a plain element (on the
// client, media further down the article arrives as a lazy reference),
// and recognise a row by shape (two or more children with width/height)
// rather than by component identity.
function rowRatios(node: React.ReactNode): number[] | null {
  if (!isValidElement<{ children?: React.ReactNode }>(node)) return null
  const ratios = Children.toArray(node.props.children).map(ratio)
  return ratios.length >= 2 && ratios.every(Boolean) ? ratios : null
}

// A MediaGrid's rows (each a MediaRow), or null for anything else.
function gridRows(media: React.ReactNode): number[][] | null {
  if (!isValidElement<{ children?: React.ReactNode }>(media)) return null
  const rows = Children.toArray(media.props.children).map(rowRatios)
  return rows.length > 0 && rows.every(Boolean) ? (rows as number[][]) : null
}

export function pairColumn(media: React.ReactNode): PairColumn | null {
  const row = rowRatios(media)
  if (!row) return null
  const stack = isValidElement<{ stack?: boolean }>(media) && !!media.props.stack
  return { ar1: row[0], share: row[0] / (row[0] + row[1]), stack }
}

// The width a section's media takes when the height budget is the limit,
// as a CSS expression the screen can size itself by: a single by its
// aspect ratio (Img/Video, or a DemoFrame's design size; an Embed is
// 16:9), a row or grid by the shapes of its rows. Undefined for a
// text-only section, which takes the text column's width.
export function naturalWidth(media: React.ReactNode): string | undefined {
  const row = rowRatios(media)
  if (row) return gridWidth([row])
  const rows = gridRows(media)
  if (rows) return gridWidth(rows)
  type MediaProps = { width?: number; height?: number; designWidth?: number; designHeight?: number; displayHeight?: number; src?: string; maxWidth?: number }
  if (!isValidElement<MediaProps>(media)) return undefined
  const { width, height, designWidth, designHeight, displayHeight, src, maxWidth } = media.props
  // a demo shows at its design size (plus the frame's 16px sides and
  // 24px top and bottom) so an article's demos all match, and scales
  // down with the budget when that doesn't fit
  if (designWidth && designHeight) {
    const frame = (designWidth + 32) / (designHeight + 48)
    return `min(${designWidth + 32}px, calc(var(--section-media-h) * ${frame.toFixed(4)}))`
  }
  const ar = width && height ? width / height : src ? 16 / 9 : undefined
  if (!ar) return undefined
  const byHeight = `calc(var(--section-media-h) * ${ar})`
  // likewise a video shown at a fixed height, so an article's phone
  // recordings all match
  if (displayHeight) return `min(${Math.round(displayHeight * ar)}px, ${byHeight})`
  // an image may ask to be shown smaller than the budget allows
  return maxWidth ? `min(${byHeight}, ${maxWidth}px)` : byHeight
}

// Rows sharing one width W: a row of ratios ar and n cells is
// (W - GAP * (n - 1)) / sum(ar) tall, so the rows add up to the height
// budget h when W = (h - B) / A, with A = sum over rows of 1 / sum(ar)
// and B = GAP * (rows - 1) - sum over rows of GAP * (n - 1) / sum(ar).
// For one row that is simply h * sum(ar) + the gaps.
function gridWidth(rows: number[][]): string {
  let a = 0
  let b = GAP * (rows.length - 1)
  for (const row of rows) {
    const sum = row.reduce((s, ar) => s + ar, 0)
    a += 1 / sum
    b -= (GAP * (row.length - 1)) / sum
  }
  return `calc((var(--section-media-h) - ${b.toFixed(2)}px) / ${a.toFixed(4)})`
}

// A grid of several images runs wider than other media: right up to the
// index on the left (and the same on the right) rather than stopping at
// 1000px, so a row of five stays legible.
export function wideMedia(media: React.ReactNode): boolean {
  return gridRows(media) !== null
}
