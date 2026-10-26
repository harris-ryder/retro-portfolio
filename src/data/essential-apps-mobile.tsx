import React from 'react'
import { Video } from '@/components/Video'
import { MediaRow } from '@/components/MediaRow'
import type { Project } from '@/data/projects'
import { nothingPhone } from '@/data/phone'

/** One phone of a prototype, its 414x916 screen recorded at 2x, its bezel edge cropped off, in the
 *  phone render, with the screen at the same 720px as the Prompt Lego recordings. */
const phone = (name: string) => <Video src={`/videos/essential-apps-mobile/${name}.mp4`} width={824} height={1828} displayHeight={720} frame={nothingPhone} />

const ext = (href: string, label: string) => <a href={href} target="_blank" rel="noopener noreferrer" className="link">{label}</a>

export const essentialAppsMobile: Project = {
  slug: 'essential-apps-mobile',
  title: 'Essential Apps Mobile',
  tagline: 'The mobile app of Nothing\'s widget builder',
  date: '2026',
  company: 'Nothing',
  contribution: 'Design, Frontend Engineering, Backend',
  sections: [
    {
      title: 'Overview',
      // the widgets the agent built, scrolling in columns on a transparent
      // background, 1080p
      media: <Video src="/videos/essential-apps-mobile/widgets.webm" safariSrc="/videos/essential-apps-mobile/widgets.mov" width={1710} height={1080} />,
      body: <>
        <p>You describe a widget in a chat, an agent writes it, and it lands on your home screen. Essential Apps began on the web, and this is the Android app that followed. It has 3,000 monthly active users.</p>
        <p>I worked on it as a design engineer. I helped design the app, carrying the web platform&apos;s designs over to the phone, and led the frontend engineering in Kotlin and Jetpack Compose.</p>
        <p>I spent a lot of time understanding users&apos; pain points and investigated new flows to make the app easier to use. Below are a few explorations that made it to production.</p>
        <p>I was also involved in a special project applying design principles to the agent to improve the aesthetic quality of its widgets. Through this work we improved the design quality and reduced the agent&apos;s error rate from 20% to 0.1%, which in turn let us move to a smaller model and cut token cost 50 times over.</p>
      </>,
    },
    {
      title: 'Build flow',
      media: (
        <MediaRow captions={['Before', 'After']}>
          {phone('build-before')}
          {phone('build-after')}
        </MediaRow>
      ),
      body: <>
        <p>A build takes a while, and the app used to show a single Building block until it was done. Now it replies straight away and offers to notify you, so it is fine to leave.</p>
        <p>The block then works through thinking, writing the spec and building, and each step delivers its piece above it as it finishes. The description, the feature list, then the widget.</p>
        <p>{ext('https://prototype-build-flow.vercel.app/', 'Try the prototype')}</p>
      </>,
    },
    {
      title: 'Resize flow',
      media: (
        <MediaRow captions={['Before', 'After']}>
          {phone('resize-before')}
          {phone('resize-after')}
        </MediaRow>
      ),
      body: <>
        <p>Asking for a different size used to mean picking a cell count from a pill and then having to include a prompt.</p>
        <p>Now the composer is the picker. Sizes are named by shape, Small, Wide, Tall and Large, and the widget sits on a grid with a button on each edge to grow it, so you see the change before asking for it. Rebuild sends on its own.</p>
        <p>{ext('https://prototype-resize-flow.vercel.app/', 'Try the prototype')}</p>
      </>,
    },
    {
      title: 'Prompt interview',
      media: (
        <MediaRow captions={['Before', 'After']}>
          {phone('lego-before')}
          {phone('lego-after')}
        </MediaRow>
      ),
      body: <>
        <p>First prompts were often too vague for a widget, things like &ldquo;Build me an Instagram clone&rdquo;. Now a short interview helps people say what they want before anything is built, assembling the prompt from small pieces. What features, how to prioritise them, size and style.</p>
        <p>{ext('https://prompt-lego-prototype.vercel.app/', 'Try the prototype')}</p>
      </>,
    },
  ],
}
