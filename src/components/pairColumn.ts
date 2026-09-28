import { Children, isValidElement } from 'react'

// A pair's first asset and the text share one column. The first asset's
// aspect ratio and its share of the row let CSS give the text the same
// width the row gives that cell (see .section-pair in globals.css).
export type PairColumn = { ar1: number; share: number; stack: boolean }

// Runs on the server, where a section's media is still a plain element:
// on the client, media further down the article arrives as a lazy
// reference. A pair is recognised by shape (a MediaRow: two children with
// width/height) rather than by component identity.
export function pairColumn(media: React.ReactNode): PairColumn | null {
  if (!isValidElement<{ children?: React.ReactNode; stack?: boolean }>(media)) return null
  const ratios = Children.toArray(media.props.children).map(child =>
    isValidElement<{ width?: number; height?: number }>(child) && child.props.width && child.props.height
      ? child.props.width / child.props.height
      : 0,
  )
  if (ratios.length < 2 || !ratios[0] || !ratios[1]) return null
  return { ar1: ratios[0], share: ratios[0] / (ratios[0] + ratios[1]), stack: !!media.props.stack }
}

// The width a section's media takes when the 800px height budget is the
// limit, as a CSS expression the screen can size itself by: a single by
// its aspect ratio (Img/Video, or a DemoFrame's design size; an Embed is
// 16:9), a pair by both ratios plus the gap between them. Undefined for a
// text-only section, which takes the text column's width.
export function naturalWidth(media: React.ReactNode, pair: PairColumn | null): string | undefined {
  if (pair) return `calc(var(--section-media-h) * ${pair.ar1 / pair.share} + 1rem)`
  type MediaProps = { width?: number; height?: number; designWidth?: number; designHeight?: number; src?: string }
  if (!isValidElement<MediaProps>(media)) return undefined
  const { width, height, designWidth, designHeight, src } = media.props
  // a demo keeps its design size (plus the frame's 16px sides) so the
  // demos of an article all match, whatever the text beside them
  if (designWidth && designHeight) return `${designWidth + 32}px`
  const ar = width && height ? width / height : src ? 16 / 9 : undefined
  return ar ? `calc(var(--section-media-h) * ${ar})` : undefined
}

// A demo's fixed height (design height plus the frame's 24px top and
// bottom); undefined for media that scales to the height budget.
export function fixedHeight(media: React.ReactNode): number | undefined {
  if (!isValidElement<{ designHeight?: number }>(media)) return undefined
  return media.props.designHeight ? media.props.designHeight + 48 : undefined
}
