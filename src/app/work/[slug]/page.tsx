import { projectsBySlug } from '@/data/projects'
import { notFound } from 'next/navigation'
import { SectionedArticle } from '@/components/SectionedArticle'
import { prepare } from '@/components/prepare'

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = projectsBySlug[slug]
  if (!project) notFound()

  // media is measured and text glued here, while they are still plain elements
  return <SectionedArticle title={project.title} sections={prepare(project)} extras={project.extras} />
}
