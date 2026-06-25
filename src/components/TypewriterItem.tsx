'use client'

import { useState, useRef } from 'react'

interface TypewriterItemProps {
  tagline: string
  children: React.ReactNode
}

export function TypewriterItem({ tagline, children }: TypewriterItemProps) {
  const [displayLength, setDisplayLength] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'cursor' | 'forward' | 'backward'>('idle')
  // Ref mirrors displayLength so setTimeout callbacks always read fresh value
  const lengthRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  function setLen(n: number) {
    lengthRef.current = n
    setDisplayLength(n)
  }

  function stepForward() {
    const next = lengthRef.current + 1
    setLen(next)
    if (next < tagline.length) {
      timerRef.current = setTimeout(stepForward, 38)
    } else {
      timerRef.current = null
      setPhase('idle')
    }
  }

  function stepBackward() {
    const next = lengthRef.current - 1
    setLen(next)
    if (next > 0) {
      timerRef.current = setTimeout(stepBackward, 38)
    } else {
      timerRef.current = null
      setPhase('idle')
    }
  }

  function handleMouseEnter() {
    clearTimer()
    if (lengthRef.current === 0) {
      setPhase('cursor')
      timerRef.current = setTimeout(() => {
        setPhase('forward')
        stepForward()
      }, 350)
    } else if (lengthRef.current < tagline.length) {
      setPhase('forward')
      stepForward()
    }
    // already fully typed: text is visible, nothing to do
  }

  function handleMouseLeave() {
    clearTimer()
    if (lengthRef.current > 0) {
      setPhase('backward')
      stepBackward()
    } else {
      setPhase('idle')
    }
  }

  const displayText = tagline.slice(0, displayLength)
  const active = phase !== 'idle'

  return (
    <span className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {(active || displayLength > 0) && (
        <span className="absolute left-full top-0 text-neutral-400 pointer-events-none select-none whitespace-nowrap pl-2">
          {displayText ? `· ${displayText}` : ''}
          {active && <span className={phase === 'cursor' ? 'cursor-blink' : ''}>|</span>}
        </span>
      )}
    </span>
  )
}
