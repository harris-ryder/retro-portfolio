import { Page } from '@/components/Page'
import { ProjectList } from '@/components/ProjectList'
import { playgroundItems } from '@/data/links'

export default function PlaygroundPage() {
  return (
    <Page title="Playground">
      <ProjectList items={playgroundItems} />
    </Page>
  )
}
