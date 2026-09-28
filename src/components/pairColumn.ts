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
