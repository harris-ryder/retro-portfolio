import { Page } from '@/components/Page'
import { WorkIndex } from '@/components/WorkIndex'
import { workItems } from '@/data/links'

export default function WorkPage() {
  return (
    <Page title="Work">
      <WorkIndex items={workItems} />
    </Page>
  )
}
