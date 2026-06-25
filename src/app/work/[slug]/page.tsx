import { projectsBySlug } from '@/data/projects'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = projectsBySlug[slug]
  if (!project) notFound()

  return (
    <main className="min-h-screen px-6 py-16 text-[15px] leading-[1.9] text-neutral-400">
      <div className="max-w-[640px] mx-auto">
        <Link href="/" className="block mb-16 no-underline text-neutral-800">← Back</Link>
        <h1 className="font-normal text-[15px] text-neutral-800">{project.title}</h1>
        <time dateTime={project.date} className="block mb-14 text-neutral-400">{project.date}</time>
        <div className="article-content [&_p]:my-6 [&_h2]:mt-14 [&_h2]:mb-4 [&_h2]:font-normal [&_h2]:text-[15px] [&_h2]:text-neutral-800 [&_ol]:my-6 [&_li]:my-1 [&_.video-wrap]:my-14 [&_a]:underline [&_img]:block [&_img]:w-full [&_img]:h-auto [&_img]:my-14 [&_img]:object-cover [&_img]:rounded-[12px] [&_img]:[border:1px_solid_rgba(50,50,50,0.12)] [&_img]:[box-shadow:0_4px_12px_-2px_#0000000d,0_1px_3px_0_#00000008] [&_img]:select-none">
          {project.content}
        </div>
      </div>
    </main>
  )
}
