import { projectsBySlug } from '@/data/projects'
import { SectionedArticle } from '@/components/SectionedArticle'
import { prepare } from '@/components/prepare'

// Tried layout 3: a Look / Read toggle; Look is the media alone, Read
// swaps it for the text in a centred column
export default function Try3() {
  const project = projectsBySlug['nothing-ai-builder']
  return <SectionedArticle title={project.title} sections={prepare(project)} extras={project.extras} variant="read" />
}
