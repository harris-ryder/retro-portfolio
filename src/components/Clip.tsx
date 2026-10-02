'use client'

type Props = {
  src: string
  poster: string
  width: number
  height: number
  label?: string
  className?: string
}

// A silent looping clip, its first frame as the poster. It doesn't start
// on its own: whatever holds it (a MediaCard) plays and pauses it.
export function Clip({ src, poster, width, height, label, className }: Props) {
  return (
    <video
      src={src}
      poster={poster}
      width={width}
      height={height}
      className={className}
      preload="metadata"
      muted
      loop
      playsInline
      disablePictureInPicture
      aria-label={label}
      // React leaves the muted attribute out of the server HTML, and an
      // unmuted video may not be played without a gesture; set it by hand
      ref={el => {
        if (el) el.muted = true
      }}
    />
  )
}
