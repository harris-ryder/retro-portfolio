// The Work page's entries, newest first. Each has a still (or a silent clip
// with the still as its poster) and a line or two about it.
export type WorkEntry = {
  year: string
  title: string
  href: string
  media: { src: string; width: number; height: number; video?: string }
  description: string
}

const still = (name: string, width: number, height: number) => ({ src: `/images/thumbs/${name}.webp`, width, height })
const clip = (name: string, width: number, height: number) => ({ ...still(name, width, height), video: `/videos/thumbs/${name}.mp4` })

export const work: WorkEntry[] = [
  {
    year: '2026',
    title: 'Essential Builder',
    href: '/work/nothing-ai-builder',
    media: clip('nothing-ai-builder', 960, 540),
    description: 'A ground-up rewrite of Nothing’s Gen UI product, which lets non-technical users create and deploy AI-powered phone widgets. Three weeks in a team of four; I owned the frontend and worked on part of the redesign.',
  },
  {
    year: '2026',
    title: 'Essential Builder Mobile',
    href: '/work/nothing-ai-builder#mobile',
    media: still('essential-builder-mobile', 1200, 601),
    description: 'Essential Builder on the phone: a gallery of featured widgets and your own creations, the editor, and deploying a widget straight to the home screen.',
  },
  {
    year: '2025',
    title: 'Essential Apps',
    href: 'https://www.youtube.com/watch?v=lgMkWKLbmbM',
    media: still('essential-apps', 1200, 800),
    description: 'The launch film for Essential Apps, Nothing’s AI widget builder: turn an idea into a widget with a prompt, no code needed.',
  },
  {
    year: '2025',
    title: 'Essential Search',
    href: 'https://youtube.com/shorts/ckFSFFwNx3Y?si=5gmBt-dO2qZeYulQ',
    media: clip('essential-search', 1000, 600),
    description: 'Essential Search on Nothing Phone: type a question into the search bar and an answer comes back as a card, with its sources.',
  },
  {
    year: '2025',
    title: 'ModelNote',
    href: 'https://modelnote.io/',
    media: still('modelnote', 768, 512),
    description: 'A review tool I built for 3D model feedback: design review made easy, from the browser.',
  },
  {
    year: '2025',
    title: 'Workflow Figma Plugin',
    href: '/work/workflow-figma-plugin',
    media: still('workflow-figma-plugin', 768, 480),
    description: 'The Figma plugin that pushed design files into the Workflow app, and how a single keystroke replaced a copy-and-paste walkthrough.',
  },
  {
    year: '2024',
    title: 'Workflow Design',
    href: 'https://www.workflow.design/',
    media: clip('workflow-design', 960, 614),
    description: 'Workflow, where I worked before Nothing: an app for managing creative assets and gathering design feedback in one place.',
  },
  {
    year: '2023',
    title: 'Apiject',
    href: 'https://apiject.com/',
    media: still('apiject', 768, 512),
    description: 'The website for Apiject, a medical technology company making prefilled injectors.',
  },
]
