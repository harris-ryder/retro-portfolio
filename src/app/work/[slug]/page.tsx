import { projectsBySlug } from '@/data/projects'
import { notFound } from 'next/navigation'
import { FrameArticle } from '@/components/FrameArticle'

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = projectsBySlug[slug]
  if (!project || project.draft) notFound()

  return <FrameArticle project={project} />
}
