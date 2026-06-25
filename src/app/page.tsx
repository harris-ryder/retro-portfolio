import Link from 'next/link'
import { projects } from '@/data/projects'
import { TypewriterItem } from '@/components/TypewriterItem'

const browserLinks = [
  { year: '2025', title: 'ModelNote', tagline: 'A web review tool for 3D models', url: 'https://modelnote.io/' },
  { year: '2025', title: 'Everything', tagline: 'A gallery of interactive web experiments', url: 'https://everything.harris-ryder.com/' },
  { year: '2025', title: 'Crema', label: 'Crema (WIP)', tagline: 'A specialty coffee discovery app', url: 'https://singyulam.com/crema' },
  { year: '2024', title: 'CRT Shader', tagline: 'A retro CRT monitor shader effect in WebGL', url: 'https://shader-crt.harris-ryder.com/' },
  { year: '2024', title: 'Planet Shader', tagline: 'A procedural planet renderer in WebGL', url: 'https://advanced-planet-shader-git-main-harris-ryders-projects.vercel.app/' },
  { year: '2025', title: 'Architecture Portfolio', tagline: 'Portfolio site for architect Leti Ryder', url: 'https://www.letiryder.com/' },
  { year: '2024', title: 'Old portfolio', tagline: "Harris's previous portfolio site", url: 'https://portfolio-six-hazel-78.vercel.app/' },
]

const itemLink = 'no-underline cursor-pointer'

export default function Home() {
  return (
    <main className="text-[15px] leading-[1.9]">
      <div className="px-10 pt-16 pb-8 lg:px-16">
        <header className="mb-2">
          <h1 className="font-normal text-[15px]">Harris Ryder</h1>
        </header>

        <p className="mb-16">
          Design Engineer at{' '}
          <a href="https://nothing.tech/" target="_blank" rel="noopener noreferrer">Nothing</a>
          {' · prev '}
          <a href="https://www.workflow.design/" target="_blank" rel="noopener noreferrer">Workflow</a>
        </p>

        <p className="mb-16">
          <a href="https://x.com/isHarrisRyder" target="_blank" rel="noopener noreferrer">X</a>
          {' · '}
          <a href="mailto:harrisryder321@gmail.com">Email</a>
          {' · '}
          <a href="https://www.linkedin.com/in/harris-ryder/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          {' · '}
          <a href="https://github.com/harris-ryder" target="_blank" rel="noopener noreferrer">GitHub</a>
        </p>

        <ul className="list-none pl-0 [&>li]:my-[0.4rem]">
          {browserLinks.map(link => (
            <li key={link.url} className="flex gap-[2ch]">
              <span className="tabular-nums w-[4ch] shrink-0 text-neutral-400">{link.year}</span>
              <TypewriterItem tagline={link.tagline}>
                <a className={itemLink} href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.label ?? link.title}
                </a>
              </TypewriterItem>
            </li>
          ))}
          {projects.map(p => (
            <li key={p.slug} className="flex gap-[2ch]">
              <span className="tabular-nums w-[4ch] shrink-0 text-neutral-400">{p.date}</span>
              <TypewriterItem tagline={p.tagline}>
                <Link className={itemLink} href={`/work/${p.slug}`}>
                  {p.title}
                </Link>
              </TypewriterItem>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
