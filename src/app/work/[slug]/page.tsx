import { projectsBySlug } from '@/data/projects'
import { notFound } from 'next/navigation'
import { SectionedArticle } from '@/components/SectionedArticle'
import { pairColumn } from '@/components/pairColumn'

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = projectsBySlug[slug]
  if (!project) notFound()

  // pairs are measured here, while their media is still a plain element
  const sections = project.sections.map(s => ({ ...s, pair: pairColumn(s.media) }))

  return <SectionedArticle title={project.title} sections={sections} extras={project.extras} />
}
