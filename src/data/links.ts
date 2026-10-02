import type { Item } from '@/components/ProjectList'

// The Playground list: things that live on other sites, newest first.
// (The Work list is src/data/work.ts.)
const playgroundLinks = [
  { year: '2026', title: 'Cloudflare Wallet', tagline: 'Released with a bunch of issues, so I made a polished version', url: 'https://harris-dummy-pay.vercel.app/' },
  { year: '2026', title: 'Clock Widgets', tagline: 'Experimenting with different designs', url: 'https://clock-widgets.vercel.app/' },
  { year: '2025', title: 'Everything', tagline: 'Concept designs for future phone software', url: 'https://everything.harris-ryder.com/' },
  { year: '2025', title: 'Crema (WIP)', tagline: 'A coffee app I\'m building with a friend', url: 'https://singyulam.com/crema' },
  { year: '2024', title: 'CRT Shader', tagline: 'A CRT monitor shader I wrote in WebGL', url: 'https://shader-crt.harris-ryder.com/' },
  { year: '2024', title: 'Planet Shader', tagline: 'A procedural planet shader I wrote in WebGL', url: 'https://advanced-planet-shader-git-main-harris-ryders-projects.vercel.app/' },
  { year: '2025', title: 'Architecture Portfolio', tagline: 'A portfolio I built for my sister Leti', url: 'https://www.letiryder.com/' },
  { year: '2024', title: 'Old portfolio', tagline: 'My old portfolio before this one', url: 'https://portfolio-six-hazel-78.vercel.app/' },
]

const byYear = (a: Item, b: Item) => Number(b.year) - Number(a.year)

export const playgroundItems: Item[] = playgroundLinks
  .map(l => ({ year: l.year, title: l.title, tagline: l.tagline, href: l.url, external: true }))
  .sort(byYear)
