import Link from 'next/link'
import { Page } from '@/components/Page'
import { Clip } from '@/components/Clip'
import { MediaCard } from '@/components/MediaCard'
import { work, type WorkEntry } from '@/data/work'

// Each entry is a row: the year and title on the left, as in the lists,
// and on the right its picture or clip in a grey card, with a line about
// it beneath. On a narrow screen the right column follows the left.
export default function WorkPage() {
  return (
    <Page title="Work">
      <ol className="flex list-none flex-col gap-16">
        {work.map(entry => (
          <li key={entry.href} className="grid gap-x-8 gap-y-[1.6em] lg:grid-cols-2">
            <p className="flex gap-[2ch]">
              <span className="w-[4ch] shrink-0 tabular-nums text-neutral-400">{entry.year}</span>
              <Title entry={entry} />
            </p>
            <div className="flex flex-col gap-[1.6em]">
              <Media entry={entry} />
              <p className="max-w-[64ch]">{entry.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </Page>
  )
}

function Title({ entry }: { entry: WorkEntry }) {
  const className = 'no-underline transition-colors hover:text-neutral-400'
  return /^https?:/.test(entry.href)
    ? <a className={className} href={entry.href} target="_blank" rel="noopener noreferrer">{entry.title}</a>
    : <Link className={className} href={entry.href}>{entry.title}</Link>
}

function Media({ entry }: { entry: WorkEntry }) {
  const { src, video, width, height } = entry.media
  return (
    <MediaCard>
      {video
        ? <Clip src={video} poster={src} width={width} height={height} />
        : <img src={src} alt="" width={width} height={height} draggable={false} />}
    </MediaCard>
  )
}
