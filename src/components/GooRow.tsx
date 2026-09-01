import { GooBorder } from '@/components/GooBorder'

// Side-by-side media row sharing ONE goo-border field: every card's rim
// renders into the same canvas, so the facing edges of adjacent cards fuse
// into a single liquid seam instead of two parallel borders. Children
// should be Img/Video with goo={false} (and wrapperStyle clearing margins)
// so they don't draw their own.

export function GooRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="goo-media" style={{ display: 'flex', gap: '1rem' }}>
      <GooBorder targets=".media-wrapper" />
      {children}
    </div>
  )
}
