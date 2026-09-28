import { projectsBySlug } from '@/data/projects'
import { notFound } from 'next/navigation'
import { SectionedArticle } from '@/components/SectionedArticle'
import { pairColumn, naturalWidth, fixedHeight } from '@/components/pairColumn'

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = projectsBySlug[slug]
  if (!project) notFound()

  // media is measured here, while it is still a plain element
  const sections = project.sections.map(s => {
    const pair = pairColumn(s.media)
    return { ...s, pair, natural: naturalWidth(s.media, pair), fixed: fixedHeight(s.media) }
  })

  return <SectionedArticle title={project.title} sections={sections} extras={project.extras} />
}
