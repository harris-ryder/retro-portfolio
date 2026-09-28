import React from 'react'

// Rows of media stacked into one block. Each row is a MediaRow, a strip
// whose items share one height, and every row spans the block's width,
// so the rows' heights follow from their aspect ratios (naturalWidth in
// pairColumn.ts sizes the block so they add up to the height budget).
// On narrow screens the rows dissolve into one two-column grid.
export function MediaGrid({ children }: { children: React.ReactNode }) {
  return <div className="media-grid">{children}</div>
}
