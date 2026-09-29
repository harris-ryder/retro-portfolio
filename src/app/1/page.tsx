import { projectsBySlug } from '@/data/projects'
import { SectionedArticle } from '@/components/SectionedArticle'
import { prepare, fit } from '@/components/prepare'

// Tried layout 1: the text fits beside its media in four lines, and
// whatever wouldn't moves to a text screen of its own right after
export default function Try1() {
  const project = projectsBySlug['nothing-ai-builder']
  return <SectionedArticle title={project.title} sections={fit(prepare(project))} extras={project.extras} variant="fit" />
}
