import Link from 'next/link'

// The frame of the home page's sections (Work, Playground, Contact): the
// home page's type, top left, with a "Harris / Work" line leading back.
export function Page({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="type-home flex min-h-dvh flex-col gap-[1.6em] p-6 sm:p-10">
      <p>
        <Link href="/" className="text-neutral-400 no-underline transition-colors hover:text-neutral-800">Harris</Link>
        <span className="text-neutral-400">{' / '}</span>
        {title}
      </p>
      {children}
    </main>
  )
}
