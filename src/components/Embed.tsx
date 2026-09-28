type Props = {
  src: string
  title: string
  width?: number
  height?: number
}

// An embedded player (YouTube) sized like the other media: the wrapper
// reserves the aspect ratio and the iframe fills it.
export function Embed({ src, title, width = 16, height = 9 }: Props) {
  return (
    <span className="media-wrapper" style={{ aspectRatio: `${width} / ${height}`, '--ar': width / height } as React.CSSProperties}>
      <iframe src={src} title={title} loading="lazy" allowFullScreen />
    </span>
  )
}
