import { projects } from '@/data/projects'
import { HomeSections } from '@/components/HomeSections'

const workLinks = [
  { year: '2025', title: 'Essential Apps', url: 'https://www.youtube.com/watch?v=lgMkWKLbmbM' },
  { year: '2025', title: 'Essential Search', url: 'https://youtube.com/shorts/ckFSFFwNx3Y?si=5gmBt-dO2qZeYulQ' },
  { year: '2024', title: 'Workflow Design', url: 'https://www.workflow.design/' },
  { year: '2023', title: 'Apiject', url: 'https://apiject.com/' },
]

const playgroundLinks = [
  { year: '2026', title: 'Cloudflare Wallet', tagline: 'Released with a bunch of issues, so I made a polished version', url: 'https://harris-dummy-pay.vercel.app/' },
  { year: '2026', title: 'Clock Widgets', tagline: 'Experimenting with different designs', url: 'https://clock-widgets.vercel.app/' },
  { year: '2025', title: 'ModelNote', tagline: 'A review tool I built for 3D model feedback', url: 'https://modelnote.io/' },
  { year: '2025', title: 'Everything', tagline: 'Concept designs for future phone software', url: 'https://everything.harris-ryder.com/' },
  { year: '2025', title: 'Crema (WIP)', tagline: 'A coffee app I\'m building with a friend', url: 'https://singyulam.com/crema' },
  { year: '2024', title: 'CRT Shader', tagline: 'A CRT monitor shader I wrote in WebGL', url: 'https://shader-crt.harris-ryder.com/' },
  { year: '2024', title: 'Planet Shader', tagline: 'A procedural planet shader I wrote in WebGL', url: 'https://advanced-planet-shader-git-main-harris-ryders-projects.vercel.app/' },
  { year: '2025', title: 'Architecture Portfolio', tagline: 'A portfolio I built for my sister Leti', url: 'https://www.letiryder.com/' },
  { year: '2024', title: 'Old portfolio', tagline: 'My old portfolio before this one', url: 'https://portfolio-six-hazel-78.vercel.app/' },
]

const byYear = <T extends { year: string }>(a: T, b: T) => Number(b.year) - Number(a.year)

export default function Home() {
  // links first so that, within a year, the stable sort keeps the Workflow
  // plugin case study last — directly above the Workflow Design entry
  const work = [
    ...workLinks.map(l => ({ year: l.year, title: l.title, href: l.url, external: true })),
    ...projects
      .filter(p => !p.hidden)
      .map(p => ({ year: p.date, title: p.title, href: `/work/${p.slug}`, external: false })),
  ].sort(byYear)

  const playground = playgroundLinks
    .map(l => ({ year: l.year, title: l.title, tagline: l.tagline, href: l.url, external: true }))
    .sort(byYear)

  return (
    <main className="flex min-h-dvh flex-col text-[15px] leading-[1.6]">
      <div className="px-10 pt-16 pb-16 lg:px-16">
        <header className="mb-2">
          <h1 className="font-normal text-[15px]">Harris Ryder</h1>
        </header>

        <p className="mb-16 [&_a]:no-underline">
          Design Engineer at{' '}
          <a href="https://nothing.tech/" target="_blank" rel="noopener noreferrer">Nothing</a>
          {' · prev '}
          <a href="https://www.workflow.design/" target="_blank" rel="noopener noreferrer">Workflow</a>
        </p>

        <HomeSections sections={{ work, playground }} />
      </div>

      <footer className="mt-auto px-10 pb-8 lg:px-16 [&_a]:no-underline">
        <p>
          <a href="https://x.com/isHarrisRyder" target="_blank" rel="noopener noreferrer">X</a>
          {' · '}
          <a href="mailto:harrisryder321@gmail.com">Email</a>
          {' · '}
          <a href="https://www.linkedin.com/in/harris-ryder/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          {' · '}
          <a href="https://github.com/harris-ryder" target="_blank" rel="noopener noreferrer">GitHub</a>
        </p>
      </footer>
    </main>
  )
}
