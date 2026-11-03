import React from 'react'

/** How a tested module reached a legacy widget, as the things it passed
 *  through. The capability resolver's frame holds the chat and the library of
 *  module files, the picked ones dark; the main model's frame holds its system
 *  prompt, with those files pasted in beside the rules; App.tsx holds the
 *  model's retyped copies beside the rest of its code, which is muted like
 *  the rules; the validator checks the copies by name. Drawn
 *  with Turn's frame, type and hairlines (see .turn in globals.css). */

export interface ModuleFile {
  name: string
  picked?: boolean
}

function Head({ name, tag }: { name: string; tag?: string }) {
  return (
    <div className="turn-head">
      <span className="turn-name">{name}</span>
      {tag && <span className="turn-tag">{tag}</span>}
    </div>
  )
}

export function ModulePath({ label, chat, modules, rules, copies, validator }: {
  label: string
  chat: string
  modules: ModuleFile[]
  rules: string
  copies: { name: string; muted?: boolean }[]
  validator: string[]
}) {
  const picked = modules.filter(m => m.picked)
  return (
    <div className="turn" role="img" aria-label={label}>
      <div className="turn-box">
        <Head name="Capability resolver" tag="Haiku" />
        <div className="turn-line">Reads the chat, picks from the module library</div>
        <div className="mp-chat">“{chat}”</div>
        <div className="mp-files">
          {modules.map(m => (
            <span key={m.name} className="mp-file" data-picked={m.picked || undefined}>{m.name}</span>
          ))}
        </div>
      </div>

      <div className="turn-link" />

      <div className="turn-box">
        <div className="turn-main">
          <Head name="Main model" tag="Sonnet" />
          <div className="turn-line">Retypes each pasted module</div>
        </div>
        <div className="mp-section">
          <Head name="System prompt" />
          <div className="turn-line">Re-sent, uncached, on every step</div>
          <div className="mp-files">
            <span className="mp-file mp-rules">{rules}</span>
            {picked.map(m => <span key={m.name} className="mp-file" data-picked>{m.name}</span>)}
          </div>
        </div>
      </div>

      <div className="turn-link" />

      <div className="turn-box">
        <Head name="App.tsx" />
        <div className="turn-line">The widget, with every module typed out once more</div>
        <div className="mp-files">
          {copies.map(c => <span key={c.name} className={`mp-file ${c.muted ? 'mp-rules' : ''}`} data-picked={c.muted ? undefined : true}>{c.name}</span>)}
        </div>
      </div>

      <div className="turn-link" />

      <div className="turn-box">
        <Head name="Validator" />
        {validator.map(line => <div key={line} className="turn-line">{line}</div>)}
      </div>
    </div>
  )
}
