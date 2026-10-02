import { Page } from '@/components/Page'

const links = [
  { label: 'harrisryder321@gmail.com', href: 'mailto:harrisryder321@gmail.com' },
  { label: 'X', href: 'https://x.com/isHarrisRyder' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/harris-ryder/' },
  { label: 'GitHub', href: 'https://github.com/harris-ryder' },
]

export default function ContactPage() {
  return (
    <Page title="Contact">
      <ul className="list-none [&>li]:mb-2 [&_a]:underline [&_a]:underline-offset-[0.2em] [&_a]:transition-colors [&_a:hover]:text-neutral-400">
        {links.map(l => (
          <li key={l.href}>
            <a href={l.href} target={l.href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer">{l.label}</a>
          </li>
        ))}
      </ul>
    </Page>
  )
}
