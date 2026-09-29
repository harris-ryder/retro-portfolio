import { projectsBySlug } from '@/data/projects'
import { SectionedArticle } from '@/components/SectionedArticle'
import { prepare } from '@/components/prepare'

// Tried layout 2: the text in full in a column at the right, the media
// centred in the space between the index and it
export default function Try2() {
  const project = projectsBySlug['nothing-ai-builder']
  return <SectionedArticle title={project.title} sections={prepare(project)} extras={project.extras} variant="column" />
}
