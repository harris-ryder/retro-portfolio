'use client'
import { useEffect, useRef } from 'react'

const BAYER4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5],
]

const BLOCK = 8
const DURATION_IN = 700
const DURATION_OUT = 400

interface DitherImageProps {
  src: string
  x: number
  y: number
  visible: boolean
  width?: number
}

export function DitherImage({ src, x, y, visible, width = 260 }: DitherImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const thresholdRef = useRef(0)
  const animRef = useRef<number | null>(null)

  function draw(threshold: number) {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img || canvas.width === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const cols = Math.ceil(canvas.width / BLOCK)
    const rows = Math.ceil(canvas.height / BLOCK)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const bayerVal = BAYER4[row % 4][col % 4] / 16
        if (bayerVal < threshold) {
          const sx = col * BLOCK
          const sy = row * BLOCK
          const sw = Math.min(BLOCK, img.naturalWidth - sx)
          const sh = Math.min(BLOCK, img.naturalHeight - sy)
          if (sw > 0 && sh > 0) {
            ctx.drawImage(img, sx, sy, sw, sh, sx, sy, sw, sh)
          }
        }
      }
    }
  }

  useEffect(() => {
    const img = new Image()
    img.src = src
    img.onload = () => {
      imgRef.current = img
      const canvas = canvasRef.current
      if (!canvas) return
      const aspect = img.naturalHeight / img.naturalWidth
      canvas.width = width
      canvas.height = Math.round(width * aspect)
      draw(thresholdRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, width])

  useEffect(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current)

    const startThreshold = thresholdRef.current
    const target = visible ? 1 : 0
    const duration = visible ? DURATION_IN : DURATION_OUT
    let startTime: number | null = null

    const step = (ts: number) => {
      if (!startTime) startTime = ts
      const t = Math.min((ts - startTime) / duration, 1)
      const threshold = startThreshold + (target - startThreshold) * t
      thresholdRef.current = threshold
      draw(threshold)
      if (t < 1) {
        animRef.current = requestAnimationFrame(step)
      } else {
        animRef.current = null
      }
    }

    animRef.current = requestAnimationFrame(step)
    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current)
        animRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        left: x,
        top: y,
        pointerEvents: 'none',
        zIndex: 50,
        imageRendering: 'pixelated',
      }}
    />
  )
}
