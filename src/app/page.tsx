import { projects } from '@/data/projects'
import { ProjectList } from '@/components/ProjectList'

const browserLinks = [
  { year: '2025', title: 'ModelNote', tagline: 'A review tool I built for 3D model feedback', url: 'https://modelnote.io/' },
  { year: '2025', title: 'Everything', tagline: 'Concept designs for future phone software', url: 'https://everything.harris-ryder.com/' },
  { year: '2025', title: 'Crema', label: 'Crema (WIP)', tagline: 'A coffee app I\'m building with a friend', url: 'https://singyulam.com/crema' },
  { year: '2024', title: 'CRT Shader', tagline: 'A CRT monitor shader I wrote in WebGL', url: 'https://shader-crt.harris-ryder.com/' },
  { year: '2024', title: 'Planet Shader', tagline: 'A procedural planet shader I wrote in WebGL', url: 'https://advanced-planet-shader-git-main-harris-ryders-projects.vercel.app/' },
  { year: '2025', title: 'Architecture Portfolio', tagline: 'A portfolio I built for my sister Leti', url: 'https://www.letiryder.com/' },
  { year: '2024', title: 'Old portfolio', tagline: 'My old portfolio before this one', url: 'https://portfolio-six-hazel-78.vercel.app/' },
]

export default function Home() {
  const items = [
    ...browserLinks.map(l => ({ year: l.year, title: l.label ?? l.title, tagline: l.tagline, href: l.url, external: true as const })),
    ...projects.filter(p => !p.hidden).map(p => ({ year: p.date, title: p.title, tagline: p.tagline, href: `/work/${p.slug}`, external: false as const })),
  ].sort((a, b) => Number(b.year) - Number(a.year))

  return (
    <main className="text-[15px] leading-[1.9]">
      <div className="px-10 pt-16 pb-8 lg:px-16">
        <header className="mb-2">
          <h1 className="font-normal text-[15px]">Harris Ryder</h1>
        </header>

        <p className="mb-16 [&_a]:no-underline">
          Software Engineer at{' '}
          <a href="https://nothing.tech/" target="_blank" rel="noopener noreferrer">Nothing</a>
          {' · prev '}
          <a href="https://www.workflow.design/" target="_blank" rel="noopener noreferrer">Workflow</a>
        </p>

        <p className="mb-16 [&_a]:no-underline">
          <a href="https://x.com/isHarrisRyder" target="_blank" rel="noopener noreferrer">X</a>
          {' · '}
          <a href="mailto:harrisryder321@gmail.com">Email</a>
          {' · '}
          <a href="https://www.linkedin.com/in/harris-ryder/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          {' · '}
          <a href="https://github.com/harris-ryder" target="_blank" rel="noopener noreferrer">GitHub</a>
        </p>

        <ProjectList items={items} />
      </div>
    </main>
  )
}
