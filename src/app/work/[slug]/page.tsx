import { projectsBySlug } from '@/data/projects'
import { notFound } from 'next/navigation'
import { SectionedArticle } from '@/components/SectionedArticle'
import { pairColumn, naturalWidth, fixedHeight, wideMedia } from '@/components/pairColumn'
import { glue } from '@/components/glue'

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = projectsBySlug[slug]
  if (!project) notFound()

  // media is measured and text glued here, while they are still plain elements
  const sections = project.sections.map(s => {
    const pair = pairColumn(s.media)
    return { ...s, body: glue(s.body), pair, natural: naturalWidth(s.media), fixed: fixedHeight(s.media), wide: wideMedia(s.media) }
  })

  return <SectionedArticle title={project.title} sections={sections} extras={project.extras} />
}
