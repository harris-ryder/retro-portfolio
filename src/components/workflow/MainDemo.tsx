'use client'
/* Main version: Figma no longer lets the plugin read the clipboard, so
   a manual ⌘V step was added. The plugin first guides the user to hold
   L then press Shift (a stand-in for ⌘, which the browser reserves on
   ⌘L) so it can validate the combo, then prompts the real ⌘V paste. */
import { useEffect, useRef, useState } from 'react'
import {
  PluginWindow,
  ReopenButton,
  ClipboardPanel,
  Keycap,
  ShiftGlyph,
  CommandGlyph,
  SuccessScreen,
  SelectingScreen,
  UploadScreen,
  HelpScreen,
  AddToScreen,
  SCREEN_BASE,
} from './shared'

type Screen =
  | 'holdL'
  | 'help'
  | 'pressCmd'
  | 'pressV'
  | 'success'
  | 'selecting'
  | 'card'
  | 'addto'

const isKeyScreen = (s: Screen) =>
  s === 'holdL' || s === 'pressCmd' || s === 'pressV'

const LABELS: Record<'holdL' | 'pressCmd' | 'pressV', string> = {
  holdL: 'Hold the L key',
  pressCmd: 'Then press Shift',
  pressV: 'Now press Command + V',
}

export function MainDemo() {
  const [open, setOpen] = useState(true)
  const [screen, setScreen] = useState<Screen>('holdL')
  const [held, setHeld] = useState({ l: false, mod: false, meta: false, v: false })
  const [copied, setCopied] = useState(false)
  const [pasted, setPasted] = useState(false)
  const [flying, setFlying] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const flyRef = useRef<number | undefined>(undefined)
  const beatRef = useRef<number | undefined>(undefined)
  const armedRef = useRef(false)
  const armTimerRef = useRef<number | undefined>(undefined)
  const advanceRef = useRef<number | undefined>(undefined)

  const clearTimers = () => {
    clearTimeout(beatRef.current)
    clearTimeout(armTimerRef.current)
    clearTimeout(advanceRef.current)
    armedRef.current = false
  }

  const reopen = () => {
    clearTimers()
    clearTimeout(flyRef.current)
    setScreen('holdL')
    setHeld({ l: false, mod: false, meta: false, v: false })
    setCopied(false)
    setPasted(false)
    setFlying(false)
    setOpen(true)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const k = e.key.toLowerCase()
    if (e.key === 'Shift') setHeld((h) => ({ ...h, mod: true }))
    if (e.key === 'Meta' || e.key === 'Control') setHeld((h) => ({ ...h, meta: true }))

    if (screen === 'holdL') {
      if (k === 'l' && !e.repeat) {
        setHeld((h) => ({ ...h, l: true }))
        beatRef.current = window.setTimeout(() => {
          setScreen('pressCmd')
          armedRef.current = false
          armTimerRef.current = window.setTimeout(() => {
            armedRef.current = true
          }, 260)
        }, 50)
      }
      return
    }
    if (screen === 'pressCmd') {
      if (e.key === 'Shift' && !e.repeat && armedRef.current) {
        advanceRef.current = window.setTimeout(() => {
          setScreen('pressV')
          setCopied(true)
        }, 300)
      }
      return
    }
    if (screen === 'pressV') {
      if (k === 'v') {
        e.preventDefault() // swallow the browser paste
        setHeld((h) => ({ ...h, v: true }))
        if (e.metaKey || e.ctrlKey) {
          setScreen('success')
          setPasted(true)
          setFlying(true)
          flyRef.current = window.setTimeout(() => setFlying(false), 850)
        }
      }
      return
    }
  }

  const onKeyUp = (e: React.KeyboardEvent) => {
    const k = e.key.toLowerCase()
    if (e.key === 'Shift') {
      setHeld((h) => ({ ...h, mod: false }))
      if (screen === 'pressCmd') clearTimeout(advanceRef.current)
    }
    if (e.key === 'Meta' || e.key === 'Control') setHeld((h) => ({ ...h, meta: false }))
    if (k === 'l') {
      setHeld((h) => ({ ...h, l: false }))
      if (screen === 'holdL') clearTimeout(beatRef.current)
      if (screen === 'pressCmd') {
        clearTimers()
        setScreen('holdL')
      }
    }
    if (k === 'v') setHeld((h) => ({ ...h, v: false }))
  }

  const onBlur = (e: React.FocusEvent) => {
    if (rootRef.current?.contains(e.relatedTarget as Node)) return
    setHeld({ l: false, mod: false, meta: false, v: false })
    if (screen === 'pressCmd') {
      clearTimers()
      setScreen('holdL')
    }
  }

  useEffect(() => {
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

  const isV = screen === 'pressV'
  const expanded = screen !== 'holdL'

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
          {isKeyScreen(screen) ? (
            <div className={SCREEN_BASE}>
              {/* one persistent stage so the pair slides open + swaps glyphs */}
              <div className="flex flex-1 flex-col items-center justify-center gap-[26px] pb-6">
                <span
                  key={LABELS[screen as keyof typeof LABELS]}
                  className="animate-label-in text-[13px] font-normal text-[#1c1c1c]"
                >
                  {LABELS[screen as keyof typeof LABELS]}
                </span>

                <div
                  className={`flex items-center gap-[11px] transition-transform duration-[240ms] ease-[cubic-bezier(0.5,0,0.3,1)] ${
                    expanded ? 'translate-x-0' : 'translate-x-[46px]'
                  }`}
                >
                  <Keycap pressed={isV ? held.meta : held.l}>
                    {isV ? <CommandGlyph /> : 'L'}
                  </Keycap>
                  <span
                    className={`text-[20px] font-normal text-[#1a1a1a] transition-opacity duration-[180ms] ${
                      expanded ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    +
                  </span>
                  <Keycap
                    pressed={isV ? held.v : held.mod}
                    className={`transition-opacity duration-[180ms] ${
                      expanded ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {isV ? 'V' : <ShiftGlyph />}
                  </Keycap>
                </div>

                <button
                  className="absolute inset-x-0 bottom-[34px] text-center text-[14px] text-ink-muted transition-colors hover:text-[#6f6f6f]"
                  onClick={() => setScreen('help')}
                >
                  Not working?
                </button>
              </div>
            </div>
          ) : screen === 'success' ? (
            <SuccessScreen />
          ) : screen === 'selecting' ? (
            <SelectingScreen />
          ) : screen === 'card' ? (
            <UploadScreen onContinue={() => setScreen('addto')} />
          ) : screen === 'help' ? (
            <HelpScreen onBack={() => setScreen('holdL')} />
          ) : screen === 'addto' ? (
            <AddToScreen onBack={() => setScreen('holdL')} />
          ) : null}
        </PluginWindow>

        <ClipboardPanel copied={copied} pulled={pasted} flying={flying} verb="Pasted" />
      </div>
    </div>
  )
}
