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
        <div className="[&_p]:my-6 [&_h2]:mt-14 [&_h2]:mb-4 [&_h2]:font-normal [&_h2]:text-[15px] [&_h2]:text-neutral-800 [&_ol]:my-6 [&_li]:my-1 [&_iframe]:my-10 [&_img]:w-full [&_img]:my-12 [&_a]:underline">
          {project.content}
        </div>
      </div>
    </main>
  )
}
