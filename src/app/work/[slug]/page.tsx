import { projectsBySlug } from '@/data/projects'
import { notFound } from 'next/navigation'
import { SectionedArticle } from '@/components/SectionedArticle'

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = projectsBySlug[slug]
  if (!project) notFound()

  return <SectionedArticle title={project.title} sections={project.sections} extras={project.extras} />
}
