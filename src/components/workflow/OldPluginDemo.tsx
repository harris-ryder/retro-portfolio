'use client'
/* Old plugin: a static walkthrough telling the user to Share → Copy in
   Figma, then paste the link into the field by hand. */
import { useState } from 'react'
import { PluginWindow, ReopenButton, HelpScreen } from './shared'

export function OldPluginDemo() {
  const [open, setOpen] = useState(true)
  return (
    <div className="flex h-full w-full items-center justify-center">
      {open ? (
        <PluginWindow onClose={() => setOpen(false)}>
          <HelpScreen />
        </PluginWindow>
      ) : (
        <ReopenButton onClick={() => setOpen(true)} />
      )}
    </div>
  )
}
