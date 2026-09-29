import type { Project, Section } from '@/data/projects'
import { glue } from '@/components/glue'
import { pairColumn, naturalWidth, wideMedia, type PairColumn } from '@/components/pairColumn'

export type Prepared = Section & { pair?: PairColumn | null; natural?: string; wide?: boolean }

// A project's sections with their media measured and text glued, on the
// server while they are still plain elements (see glue.ts for why).
export function prepare(project: Project): Prepared[] {
  return project.sections.map(s => {
    const pair = pairColumn(s.media)
    return { ...s, body: glue(s.body), pair, natural: naturalWidth(s.media), wide: wideMedia(s.media) }
  })
}
