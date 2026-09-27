// Side-by-side media row. Children should be Img/Video with wrapperStyle
// clearing their vertical margins (the row carries them) and flex: 1.
export function MediaRow({ children }: { children: React.ReactNode }) {
  return <div className="media-row">{children}</div>
}
