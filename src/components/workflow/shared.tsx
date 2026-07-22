'use client'
/* ------------------------------------------------------------------
   Shared UI for the three "Workflow" plugin demos. Ported verbatim
   from the figma-plugin-emulator repo (github.com/harris-ryder/
   workflow-figma-plugin-emulator) — the presentational pieces are
   identical across the old-version / first-version / main branches;
   only the flow logic (in each demo file) differs.
   ------------------------------------------------------------------ */
import { useEffect, useRef } from 'react'

export const FIGMA_URL =
  'https://www.figma.com/design/mFBgMro5cRqbcp7enMvyKt/Master-Feedback-File?node-id=1-10&t=kOIdBK0BdjARK0jB-1'

export const SCREEN_BASE = 'absolute inset-0 flex flex-col'
export const backBtnCls =
  'grid h-7 w-7 place-items-center rounded-[7px] text-ink transition-colors hover:bg-[#f2f2f2] [&>svg]:h-[18px] [&>svg]:w-[18px]'

/* Soft drop shadow for the plugin/clipboard windows — a touch weaker than
   the article's --shadow-media (lower alpha). Set inline so it doesn't
   depend on a global CSS var. */
export const WINDOW_SHADOW =
  '0 4px 12px -2px #00000009, 0 1px 3px 0 #00000006'

/* ---------- Plugin window chrome ---------- */
export function PluginWindow({
  onClose,
  children,
}: {
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className="flex h-[602px] w-[404px] animate-win-in flex-col overflow-hidden rounded-[13px] border border-black/[0.06] bg-surface"
      style={{ boxShadow: WINDOW_SHADOW }}
    >
      <header className="flex h-[40px] shrink-0 items-center border-b border-hairline pl-3.5 pr-2">
        <WorkflowLogo />
        <span className="ml-2 text-[11px] font-medium tracking-[-0.1px] text-ink">
          Workflow
        </span>
        <span className="flex-1" />
        <button
          className="grid h-6 w-6 place-items-center rounded-md text-[#2b2b2b] transition-colors hover:bg-[#f2f2f2]"
          aria-label="Close"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </header>
      <div className="relative flex-1 overflow-hidden">{children}</div>
    </div>
  )
}

export function ReopenButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="flex animate-fade-up items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-[15px] font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition-[transform,background-color] duration-150 hover:-translate-y-px hover:bg-black [&>svg]:h-4 [&>svg]:w-4"
      onClick={onClick}
    >
      <RunIcon />
      Run Workflow again
    </button>
  )
}

/* ---------- Clipboard history panel ---------- */
const ROW_H = 52
const STALE_CLIPS = [
  { text: '#F5F5F5', time: '13:41' },
  { text: 'are you good?', time: '14:18' },
  { text: 'Fix onboarding copy for step 2', time: '14:32' },
]

export function ClipboardPanel({
  copied,
  pulled,
  flying,
  verb = 'Pulled',
}: {
  copied: boolean
  pulled: boolean
  flying: boolean
  verb?: 'Pulled' | 'Pasted'
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!copied) return
    const el = scrollRef.current
    if (!el) return
    const t = setTimeout(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }, 150)
    return () => clearTimeout(t)
  }, [copied])

  return (
    <div className="relative">
      <aside
        className="w-[248px] animate-win-in overflow-hidden rounded-xl border border-black/5 bg-white/95"
        style={{ boxShadow: WINDOW_SHADOW }}
      >
        <div className="flex items-center gap-1.5 border-b border-hairline px-3.5 py-2.5">
          <span className="text-[#2b2b2b]">
            <ClipboardIcon />
          </span>
          <span className="text-[11px] font-medium text-ink">Clipboard</span>
        </div>

        <div className="relative p-2">
          <div
            ref={scrollRef}
            className="overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ height: ROW_H * 3 }}
          >
            {STALE_CLIPS.map((c) => (
              <div
                key={c.text}
                className="overflow-hidden px-2.5 py-2"
                style={{ height: ROW_H }}
              >
                <div className="truncate text-[11px] text-ink-soft">{c.text}</div>
                <div className="mt-0.5 text-[10px] text-ink-muted">{c.time}</div>
              </div>
            ))}

            {copied && (
              <div
                className="relative animate-clip-in overflow-hidden px-2.5 py-2"
                style={{ height: ROW_H }}
              >
                <div className="flex min-w-0 items-center">
                  <span className="truncate font-mono text-[10.5px] text-ink-soft">
                    {FIGMA_URL}
                  </span>
                </div>
                <div
                  className={`absolute bottom-2 left-2.5 text-[10px] ${
                    pulled ? 'text-green-soft' : 'text-ink-muted'
                  }`}
                >
                  {pulled ? `${verb} into Workflow ✓` : 'Copied · just now'}
                </div>
              </div>
            )}
          </div>

          <div
            className="pointer-events-none absolute inset-x-2 bottom-2 rounded-lg border border-[#c9c9c9]"
            style={{ height: ROW_H }}
          >
            <span className="absolute bottom-2 right-2.5 text-[8px] font-medium uppercase tracking-[0.08em] text-[#9a9a9a]">
              current
            </span>
          </div>
        </div>
      </aside>

      {flying && (
        <div
          className="pointer-events-none absolute bottom-2 left-2 z-20 w-[232px] animate-fly-paste rounded-lg border border-black/5 bg-white px-2.5 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
          style={{ height: ROW_H }}
        >
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="shrink-0 text-[#2b2b2b]">
              <LinkIcon />
            </span>
            <span className="truncate font-mono text-[10.5px] text-ink">
              {FIGMA_URL}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- Keycaps ---------- */
const KEYCAP_BASE =
  'box-border grid h-[60px] w-[60px] place-items-center rounded-[7px] text-[34px] font-normal leading-none transition-[background-color,border-color,opacity] duration-100 ease-out [&>svg]:block [&>svg]:h-[27px] [&>svg]:w-[27px]'

export function Keycap({
  children,
  pressed = false,
  className = '',
}: {
  children: React.ReactNode
  pressed?: boolean
  className?: string
}) {
  const look = pressed
    ? 'bg-[#e6e6e6] border border-[#dee0e3] text-[#1a1a1a] shadow-[inset_0_2px_2px_-1px_rgba(0,0,0,0.05)]'
    : 'bg-[#fcfcfc] border-x border-t border-b-[3px] border-[#dddddd] text-[#1a1a1a]'
  return <span className={`${KEYCAP_BASE} ${look} ${className}`}>{children}</span>
}

export function ShiftGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3.5 4.5 11.5H9v7h6v-7h4.5L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}
export function CommandGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ---------- Downstream screens (shared by every flow) ---------- */
export function SuccessScreen() {
  return (
    <div className={`${SCREEN_BASE} animate-fade-up`}>
      <div className="flex flex-1 flex-col items-center justify-center gap-[26px] pb-6">
        <div className="flex items-center gap-2 text-[13px] text-green-soft">
          <span className="[&>svg]:animate-pop">
            <CheckIcon />
          </span>
          File connected successfully
        </div>
      </div>
    </div>
  )
}

export function SelectingScreen() {
  return (
    <div className={`${SCREEN_BASE} animate-fade-up`}>
      <div className="grid flex-1 place-items-center text-[13.5px] text-ink">
        Select the work you want to upload
      </div>
    </div>
  )
}

export function UploadScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className={`${SCREEN_BASE} animate-fade-up`}>
      <div className="flex flex-1 flex-col items-center px-5 pb-[30px] pt-[30px]">
        <div className="w-[264px] animate-card-in rounded-[14px] bg-white px-[18px] pb-4 pt-5 font-mono shadow-[0_6px_22px_rgba(0,0,0,0.10),0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="mb-[18px] flex items-baseline justify-between gap-2">
            <span className="whitespace-nowrap text-[12.5px] font-bold text-[#111]">
              Nature Oncology, Vol 14
            </span>
            <span className="text-[12px] font-bold text-green">91%</span>
          </div>
          <p className="mb-4 text-[10.5px] leading-[1.55] text-[#333]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
          <div className="flex items-center justify-end gap-2.5">
            <span className="rounded-[7px] bg-[#ececec] px-2.5 py-[5px] text-[11px] text-ink">
              Review
            </span>
          </div>
        </div>

        <span className="mt-auto pb-[18px] text-[12.5px] text-ink-soft">
          1 frame selected
        </span>
        <button
          className="h-10 w-[270px] rounded-[10px] bg-[#f0f0f0] text-[13.5px] font-normal text-ink transition-colors hover:bg-[#e8e8e8]"
          onClick={onContinue}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export function HelpScreen({ onBack }: { onBack?: () => void }) {
  return (
    <div className={`${SCREEN_BASE} animate-slide-in`}>
      <div
        className={`flex flex-1 flex-col overflow-y-auto px-[18px] py-[22px] ${
          onBack ? '' : 'justify-center'
        }`}
      >
        {onBack && (
          <button
            className={`${backBtnCls} mb-4`}
            aria-label="Back"
            onClick={onBack}
          >
            <BackIcon />
          </button>
        )}

        <video
          className="block w-full rounded-[10px] bg-[#eaeaea]"
          src="/videos/workflow/help-demo.mp4"
          autoPlay
          muted
          loop
          playsInline
        />

        <p className="my-[22px] text-center text-[13px] leading-[1.75] text-ink [&_b]:font-bold">
          1. Click the <b>Share</b> button
          <br />
          2. <b>Copy</b> the file link
          <br />
          3. <b>Paste</b> the link below
        </p>

        <input
          className="flex h-[40px] w-[272px] items-center self-center rounded-lg border border-solid border-neutrals-border-weak bg-neutrals-surface px-4 py-2 text-sm text-neutrals-text-weak outline-none placeholder:text-neutrals-text-weak focus:border-gold focus:ring-1 focus:ring-gold"
          placeholder="https://www.figma.com/file/..."
        />
      </div>
    </div>
  )
}

const TASKS = [
  { title: 'Design email newsletter template', thumb: 'placeholder' },
  { title: 'Startup landing page update', thumb: 'landing' },
  { title: 'E-commerce website design', thumb: 'atelie' },
] as const

export function AddToScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className={`${SCREEN_BASE} animate-slide-in`}>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="relative flex h-[46px] shrink-0 items-center border-b border-hairline px-4">
          <button className={backBtnCls} aria-label="Back" onClick={onBack}>
            <BackIcon />
          </button>
          <span className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1.5 text-[12px] font-medium tracking-[1px] text-ink [&_svg]:h-[13px] [&_svg]:w-[13px] [&_svg]:text-[#9a9a9a]">
            ADD TO <HelpCircleIcon />
          </span>
          <span className="ml-auto text-[#2b2b2b] [&>svg]:block [&>svg]:h-[18px] [&>svg]:w-[18px]">
            <MenuIcon />
          </span>
        </div>

        <input
          className="h-[44px] w-full shrink-0 border-b border-hairline bg-transparent px-[18px] text-[13px] text-ink outline-none placeholder:text-[#a0a0a0]"
          placeholder="Search tasks..."
        />

        <button className="flex h-12 w-full shrink-0 items-center gap-[13px] border-b border-hairline px-[18px] text-left text-[13px] text-ink transition-colors hover:bg-[#f5f5f5] [&>svg]:h-[15px] [&>svg]:w-[15px] [&>svg]:text-[#2b2b2b]">
          <PlusIcon /> Create New Task
        </button>

        <div className="flex-1 overflow-y-auto">
          {TASKS.map((t) => (
            <button
              key={t.title}
              className="flex h-[72px] w-full items-center gap-[13px] border-b border-hairline px-[18px] text-left transition-colors hover:bg-[#e9e9e9]"
            >
              <Thumb kind={t.thumb} />
              <span className="min-w-0">
                <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-ink">
                  {t.title}
                </span>
                <span className="mt-[3px] block text-[11px] text-ink-sub">
                  Demo project
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const THUMB_BASE =
  'shrink-0 h-12 w-[78px] overflow-hidden rounded-[5px] border border-[#e3e3e3] bg-[#e9e9e9]'

function Thumb({ kind }: { kind: string }) {
  if (kind === 'landing')
    return (
      <span className={`${THUMB_BASE} flex flex-col bg-white`}>
        <span className="grid h-[34%] place-items-center bg-[#c6f24a] px-[3px] text-center text-[6px] font-bold text-[#111]">
          AI Optimize Your Marketing
        </span>
        <span className="flex flex-1 flex-col gap-[3px] px-1.5 py-1">
          <span className="h-[2px] w-[70%] rounded-[2px] bg-[#d8d8d8]" />
          <span className="h-[2px] w-[90%] rounded-[2px] bg-[#d8d8d8]" />
          <span className="mt-[2px] h-[6px] w-[22px] self-center rounded-[4px] bg-[#111]" />
        </span>
      </span>
    )
  if (kind === 'atelie')
    return (
      <span className={`${THUMB_BASE} flex`}>
        <span className="relative w-[42%] bg-[linear-gradient(160deg,#d33a2c_0%,#b52c20_100%)] after:absolute after:inset-[22%_18%_0_18%] after:rounded-[50%_50%_0_0] after:bg-[#7cae6a] after:content-['']" />
        <span className="grid flex-1 place-items-center bg-white font-serif text-[11px] font-bold tracking-[-0.5px] text-[#111]">
          ATELIE
        </span>
      </span>
    )
  return <span className={THUMB_BASE} />
}

/* ---------- Icons ---------- */
function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 5l14 14M19 5L5 19"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}
function WorkflowLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 57 57" fill="none" className="shrink-0">
      <path
        d="M48.7527 0H7.90949C3.5768 0 0.0644531 3.51234 0.0644531 7.84504V48.6883C0.0644531 53.021 3.5768 56.5333 7.90949 56.5333H48.7527C53.0854 56.5333 56.5978 53.021 56.5978 48.6883V7.84504C56.5978 3.51234 53.0854 0 48.7527 0Z"
        fill="white"
      />
      <path
        d="M7.90918 0.470703H48.7529C52.8252 0.47081 56.1268 3.77243 56.127 7.84473V48.6885C56.1268 52.7608 52.8253 56.0624 48.7529 56.0625H7.90918C3.83688 56.0623 0.535263 52.7608 0.535156 48.6885V7.84473C0.535325 3.77247 3.83692 0.470872 7.90918 0.470703Z"
        stroke="#1A1A1A"
        strokeOpacity="0.12"
        strokeWidth="0.942222"
      />
      <path
        d="M46.359 17.9023H38.7689L38.661 19.7165L41.1715 20.3441L36.5135 32.7393L31.4044 20.3441L33.6991 19.7165L33.5912 17.9023H24.0006L23.8928 19.7165L25.7462 20.3441L26.7366 22.6192L22.8533 32.4549L17.8913 20.3441L19.7447 19.7165L19.6368 17.9023H10.3405L10.1934 19.7165L12.1252 20.3441L20.4508 39.741H22.412L28.2173 26.0514L34.1796 39.741H36.1801L44.5448 20.3441L46.4669 19.7165L46.359 17.9023Z"
        fill="#1A1A1A"
      />
    </svg>
  )
}
function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 12H4M4 12l7-7M4 12l7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 12.5l5 5 11-11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}
function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}
function HelpCircleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M9.5 9.2a2.5 2.5 0 0 1 4.5 1.5c0 1.6-2 2-2 3.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" />
    </svg>
  )
}
function RunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M7 5l12 7-12 7V5z" fill="currentColor" />
    </svg>
  )
}
function ClipboardIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="4" width="14" height="17" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M9 4.5V3.5A1.5 1.5 0 0 1 10.5 2h3A1.5 1.5 0 0 1 15 3.5v1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}
function LinkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
      <path
        d="M10 14a5 5 0 0 0 7.1.4l3-3a5 5 0 0 0-7-7.1l-1.7 1.6M14 10a5 5 0 0 0-7.1-.4l-3 3a5 5 0 0 0 7 7.1l1.7-1.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
