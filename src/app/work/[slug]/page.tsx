import { projectsBySlug } from '@/data/projects'
import { workItems } from '@/data/links'
import { notFound } from 'next/navigation'
import { Frame } from '@/components/WorkFrame'

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = projectsBySlug[slug]
  if (!project || project.draft) notFound()

  // a listed article is drawn by the Work layout's frame, which has it
  // already (see WorkFrame); an unlisted one gets a frame of its own
  if (workItems.some(item => item.slug === slug)) return null
  return <Frame project={project} />
}
