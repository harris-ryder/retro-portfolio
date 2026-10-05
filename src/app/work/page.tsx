import { Page } from '@/components/Page'
import { WorkIndex } from '@/components/WorkIndex'
import { PrefetchClips } from '@/components/PrefetchClips'
import { workClips, workItems } from '@/data/links'

export default function WorkPage() {
  return (
    <Page title="Work">
      {/* for anyone who lands here without passing through the home page */}
      <PrefetchClips urls={workClips} />
      <WorkIndex items={workItems} />
    </Page>
  )
}
