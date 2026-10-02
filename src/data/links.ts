import { projectsBySlug } from '@/data/projects'
import type { Item } from '@/components/ProjectList'

// A Work entry's picture, or a silent clip with the picture as its poster
export type Media = { src: string; width: number; height: number; video?: string }
export type WorkItem = Item & { media: Media }

const still = (name: string, width: number, height: number): Media => ({ src: `/images/thumbs/${name}.webp`, width, height })
const clip = (name: string, width: number, height: number): Media => ({ ...still(name, width, height), video: `/videos/thumbs/${name}.mp4` })

// A case study, by slug, as a list row
const caseStudy = (slug: string, media: Media): WorkItem => {
  const p = projectsBySlug[slug]
  return { year: p.date, title: p.title, href: `/work/${p.slug}`, external: false, media }
}

// The Work list, in the order it shows (newest first, by hand)
export const workItems: WorkItem[] = [
  caseStudy('nothing-ai-builder', clip('nothing-ai-builder', 960, 540)),
  { year: '2026', title: 'Essential Apps Mobile', href: '/work/nothing-ai-builder#mobile', external: false, media: still('essential-builder-mobile', 1200, 601) },
  { year: '2025', title: 'Playground', href: 'https://www.youtube.com/watch?v=lgMkWKLbmbM', external: true, media: still('essential-apps', 1200, 800) },
  { year: '2025', title: 'Essential Search', href: 'https://youtube.com/shorts/ckFSFFwNx3Y?si=5gmBt-dO2qZeYulQ', external: true, media: clip('essential-search', 1000, 600) },
  { year: '2025', title: 'ModelNote', tagline: 'A review tool I built for 3D model feedback', href: 'https://modelnote.io/', external: true, media: still('modelnote', 768, 512) },
  caseStudy('workflow-figma-plugin', still('workflow-figma-plugin', 768, 480)),
  { year: '2024', title: 'Workflow Design', href: 'https://www.workflow.design/', external: true, media: clip('workflow-design', 960, 614) },
  { year: '2023', title: 'Apiject', href: 'https://apiject.com/', external: true, media: still('apiject', 768, 512) },
]

// The Playground list: things that live on other sites, newest first
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
