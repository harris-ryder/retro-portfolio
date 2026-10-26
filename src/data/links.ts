import { isValidElement, type ReactNode } from 'react'
import { projectsBySlug, type Project } from '@/data/projects'
import type { Item } from '@/components/ProjectList'

// A Work entry: a case study's row, with its slug for the frame (see WorkFrame)
export type WorkItem = Item & { slug: string }

const caseStudy = (slug: string): WorkItem => {
  const p = projectsBySlug[slug]
  return { slug, year: p.date, title: p.title, href: `/work/${p.slug}`, external: false }
}

// The Work list, in the order it shows (newest first, by hand)
export const workItems: WorkItem[] = [
  caseStudy('essential-apps-mobile'),
  caseStudy('nothing-ai-builder'),
  caseStudy('playground'),
  caseStudy('essential-search'),
  caseStudy('workflow-figma-plugin'),
  caseStudy('modelnote'),
  caseStudy('workflow-design'),
  caseStudy('apiject'),
]

// the listed articles in full, for the Work frame: pointing at a row shows
// its article's opening media, and opening the article keeps that up
export const workProjects: Project[] = workItems.map(item => projectsBySlug[item.slug])

// the clips in the listed articles' opening media, in list order, for
// fetching ahead (see PrefetchClips)
const clipsIn = (node: ReactNode): string[] => {
  if (Array.isArray(node)) return node.flatMap(clipsIn)
  if (!isValidElement<{ src?: unknown; children?: ReactNode }>(node)) return []
  const { src, children } = node.props
  return [...(typeof src === 'string' && src.endsWith('.mp4') ? [src] : []), ...clipsIn(children)]
}
export const workClips = workProjects.flatMap(p => clipsIn(p.sections[0]?.media))

// The Playground list: things that live on other sites, newest first
const playgroundLinks = [
  { year: '2026', title: 'Decamp', tagline: 'Moves a Squarespace or Webflow site off its platform', url: 'https://getdecamp.com/' },
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
