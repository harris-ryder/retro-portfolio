import { WorkFrame } from '@/components/WorkFrame'
import { PrefetchClips } from '@/components/PrefetchClips'
import { workClips, workItems, workProjects } from '@/data/links'

// The list and the articles share one frame, kept up here across the
// routes under /work so an article's opening media carries over from the
// list's hover (see WorkFrame). The pages below render nothing of their
// own unless the article isn't in the list.
export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* for anyone who lands here without passing through the home page */}
      <PrefetchClips urls={workClips} />
      <WorkFrame items={workItems} projects={workProjects}>{children}</WorkFrame>
    </>
  )
}
