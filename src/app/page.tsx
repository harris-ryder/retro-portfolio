import Link from 'next/link'
import { GeistPixelSquare } from 'geist/font/pixel'

export default function Home() {
  return (
    <main className="type-home min-h-dvh p-6 sm:p-10">
      <p className="max-w-[40ch] text-balance">
        My name is Harris. I design and engineer software at{' '}
        <a href="https://nothing.tech/" target="_blank" rel="noopener noreferrer" className={`${GeistPixelSquare.className} underline underline-offset-[0.2em] transition-colors hover:text-[#777777]`}>Nothing</a>
        {' '}in London.
      </p>
      <nav aria-label="Sections" className="mt-[1.6em]">
        <ul className="list-none [&_a]:no-underline [&_a]:transition-colors [&_a:hover]:text-[#777777]">
          <li><Link href="/work">Work</Link></li>
          <li><Link href="/playground">Playground</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
      </nav>
    </main>
  )
}
