'use client'
/* First version: Shift + L (either order) "copies" the file link; the
   plugin then polls the clipboard and pulls the link in automatically,
   no manual paste. (Shift stands in for ⌘, which the browser reserves.) */
import { useEffect, useRef, useState } from 'react'
import {
  PluginWindow,
  ReopenButton,
  ClipboardPanel,
  Keycap,
  ShiftGlyph,
  SuccessScreen,
  SelectingScreen,
  UploadScreen,
  HelpScreen,
  AddToScreen,
  SCREEN_BASE,
} from './shared'

type Screen = 'keys' | 'help' | 'pulling' | 'success' | 'selecting' | 'card' | 'addto'

export function FirstVersionDemo() {
  const [open, setOpen] = useState(true)
  const [screen, setScreen] = useState<Screen>('keys')
  const [held, setHeld] = useState({ l: false, mod: false })
  const [copied, setCopied] = useState(false)
  const [pulled, setPulled] = useState(false)
  const [flying, setFlying] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const flyRef = useRef<number | undefined>(undefined)
  const copyTimerRef = useRef<number | undefined>(undefined)
  const lRef = useRef(false)
  const shiftRef = useRef(false)
  const firedRef = useRef(false)

  const reopen = () => {
    clearTimeout(flyRef.current)
    clearTimeout(copyTimerRef.current)
    lRef.current = false
    shiftRef.current = false
    firedRef.current = false
    setScreen('keys')
    setHeld({ l: false, mod: false })
    setCopied(false)
    setPulled(false)
    setFlying(false)
    setOpen(true)
  }

  // Shift + L both held → copy, then hand off to the auto-pull
  const fire = () => {
    if (firedRef.current) return
    firedRef.current = true
    setCopied(true)
    copyTimerRef.current = window.setTimeout(() => setScreen('pulling'), 1000)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (screen !== 'keys') return
    if (e.key === 'Shift') {
      shiftRef.current = true
      setHeld((h) => ({ ...h, mod: true }))
    }
    if (e.key.toLowerCase() === 'l') {
      lRef.current = true
      setHeld((h) => ({ ...h, l: true }))
    }
    if (shiftRef.current && lRef.current) fire()
  }

  const onKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === 'Shift') {
      shiftRef.current = false
      setHeld((h) => ({ ...h, mod: false }))
    }
    if (e.key.toLowerCase() === 'l') {
      lRef.current = false
      setHeld((h) => ({ ...h, l: false }))
    }
  }

  const onBlur = (e: React.FocusEvent) => {
    if (rootRef.current?.contains(e.relatedTarget as Node)) return
    shiftRef.current = false
    lRef.current = false
    setHeld({ l: false, mod: false })
  }

  // automatic advances (incl. the auto-pull)
  useEffect(() => {
    if (screen === 'pulling') {
      const t = setTimeout(() => {
        setPulled(true)
        setFlying(true)
        setScreen('success')
        flyRef.current = window.setTimeout(() => setFlying(false), 850)
      }, 1100)
      return () => clearTimeout(t)
    }
    if (screen === 'success') {
      const t = setTimeout(() => setScreen('selecting'), 1300)
      return () => clearTimeout(t)
    }
    if (screen === 'selecting') {
      const t = setTimeout(() => setScreen('card'), 1250)
      return () => clearTimeout(t)
    }
  }, [screen])

  if (!open) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <ReopenButton onClick={reopen} />
      </div>
    )
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        ref={rootRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onBlur={onBlur}
        className="flex items-center gap-9 rounded-[20px] p-2 outline-none"
      >
        <PluginWindow onClose={() => setOpen(false)}>
          {screen === 'keys' && (
            <div className={SCREEN_BASE}>
              <div className="flex flex-1 flex-col items-center justify-center gap-[26px] pb-6">
                <span className="text-[13px] font-normal text-[#1c1c1c]">
                  Press Shift + L
                </span>
                <div className="flex items-center gap-[11px]">
                  <Keycap pressed={held.mod}>
                    <ShiftGlyph />
                  </Keycap>
                  <span className="text-[20px] font-normal text-[#1a1a1a]">+</span>
                  <Keycap pressed={held.l}>L</Keycap>
                </div>
                <button
                  className="absolute inset-x-0 bottom-[34px] text-center text-[14px] text-ink-muted transition-colors hover:text-[#6f6f6f]"
                  onClick={() => setScreen('help')}
                >
                  Not working?
                </button>
              </div>
            </div>
          )}

          {screen === 'pulling' && (
            <div className={`${SCREEN_BASE} animate-fade-up`}>
              <div className="flex flex-1 flex-col items-center justify-center gap-3.5 pb-6">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#e4e4e4] border-t-[#8a8a8a]" />
                <span className="text-[13px] text-ink-muted">
                  Pulling from clipboard…
                </span>
              </div>
            </div>
          )}

          {screen === 'success' && <SuccessScreen />}
          {screen === 'selecting' && <SelectingScreen />}
          {screen === 'card' && <UploadScreen onContinue={() => setScreen('addto')} />}
          {screen === 'help' && <HelpScreen onBack={() => setScreen('keys')} />}
          {screen === 'addto' && <AddToScreen onBack={() => setScreen('keys')} />}
        </PluginWindow>

        <ClipboardPanel copied={copied} pulled={pulled} flying={flying} verb="Pulled" />
      </div>
    </div>
  )
}
