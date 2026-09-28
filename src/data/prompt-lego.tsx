import React from 'react'
import { Img } from '@/components/Img'
import { Video } from '@/components/Video'
import { MediaRow } from '@/components/MediaRow'
import { MediaGrid } from '@/components/MediaGrid'
import type { Project } from '@/data/projects'

const P = '/images/prompt-lego'

/** A 414x920 Figma phone screen at 2x, cropped to its chat and composer. */
const phone = (name: string, alt: string) => <Img src={`${P}/${name}.webp`} alt={alt} width={828} height={1452} />
/** A loose Figma sketch, flattened onto the canvas grey. */
const sketch = (name: string, alt: string) => <Img src={`${P}/${name}.webp`} alt={alt} width={1000} height={856} />
/** A recording of the prototype's phone, captured at 2x, with a scrub bar under it. Every
 *  recording shows at the same 720px (a 324px-wide phone), whatever the text beside it. */
const proto = (name: string) => <Video src={`/videos/prompt-lego/${name}.mp4`} width={828} height={1840} displayHeight={720} />

export const promptLego: Project = {
  slug: 'prompt-lego',
  title: 'Prompt Lego',
  tagline: 'A prototype that turns vague widget prompts into specific ones',
  date: '2026',
  sections: [
    {
      title: 'Overview',
      // a 390px Figma frame at 2x; shown a little over its design size
      media: <Img src={`${P}/hero-lego-stack.webp`} alt="A prompt assembled from lego-like bricks: Workout App, Focused on calisthenics, Minimalist app one main view, Widget size should be 4x2, Colours should be" width={780} height={628} maxWidth={560} />,
      body: <>
        <p>Essential Builder is Nothing&apos;s Gen UI app: you describe a phone widget and an agent builds it. In testing, the first prompt was often the problem. People typed things like &ldquo;Build me an Instagram clone&rdquo;, which is too broad for a widget and says nothing about features, size or look. The agent had to guess, and the first build was rarely what they had in mind. Prompt Lego is a prototype of how the app could help people say what they want before anything gets built.</p>
        <p>The name comes from the idea that a good prompt is built from a few small, separable pieces: what the widget does, what it shows, how big it is, how it looks. Each is a brick, and the user should be able to add or swap one without rewriting the whole thing.</p>
      </>,
    },
    {
      title: 'What users were doing',
      media: phone('sprint1-jarvis', 'Phone screen: a draft that just says Build me jarvis sits in the composer, with an Enhance button beside it'),
      body: <p>One interview made the problem concrete. A user showed us their workaround: they wrote their idea in Gemini first, asked it to turn it into a better prompt, then pasted the result into Essential Builder. They had bolted the missing step onto the front of the app themselves. That set the brief. The app should do that step for them, and do it better than a general chat can, because it knows what a widget is.</p>,
    },
    {
      title: 'References',
      media: (
        <MediaGrid>
          <MediaRow>
            <Img src={`${P}/ref-imagine-chain.webp`} alt="Reference: a chain of /imagine prompts joined like links" width={964} height={1200} />
            <Img src={`${P}/ref-block-palette.webp`} alt="Reference: a colour palette drawn as toy bricks" width={1034} height={826} />
            <Img src={`${P}/ref-tickr-chat.webp`} alt="Reference: a builder chat that offers its next edits as chips" width={1200} height={1200} />
            <Img src={`${P}/ref-marathon-app.webp`} alt="Reference: a colourful running app whose cards interlock like blocks" width={1170} height={1165} />
            <Img src={`${P}/ref-morning-widget.webp`} alt="Reference: a glanceable, personal morning widget on a phone" width={1200} height={1200} />
          </MediaRow>
        </MediaGrid>
      ),
      body: <p>A few references I kept coming back to. Two are about interlocking pieces, the visual idea behind the bricks: cards that plug into one another, and a palette drawn as toy blocks. One is a chain of prompts, each joined to the next. The last is the kind of glanceable, personal widget people kept describing.</p>,
    },
    {
      title: 'The Enhance toggle',
      media: (
        <MediaRow labels={['Draft', 'Enhanced']}>
          {phone('sprint1-toggle', 'Phone screen: a draft in the composer, with the Enhance toggle off beside it')}
          {phone('sprint1-enhanced', 'Phone screen: the draft rewritten in display type with the proposed colours as pills, and Revert beside it')}
        </MediaRow>
      ),
      body: <p>The first round of Figma explorations kept the chat as it was and added one thing to the composer: an Enhance toggle. Tap it and the draft is rewritten into something the builder can act on, with the details it needs filled in. The rewrite is presented rather than edited, set in a display face to mark it as the agent&apos;s words, and Revert puts your own back.</p>,
    },
    {
      title: 'The Enhance prototype',
      media: proto('v1-enhance'),
      body: <>
        <p>Rather than design it out fully, I made a single Figma frame of the enhanced composer and had an AI coding agent turn it into a working prototype. Type a draft and tap Enhance: the field grows, a highlight sweeps its border while the rewrite is prepared, and the new prompt lands in display type with the proposed palette as colour pills. Tap a pill to edit the colour; Revert puts the original words back.</p>
        <p>It demoed well and it felt wrong. The rewrite is a black box: you read a sentence you did not write and decide whether to trust it, and changing anything beyond the colours means going back to the text. The prompt only got better because the rewrite answered questions the original had left open. Asking those questions directly would give the same result with none of the guessing, so V2 dropped the toggle and made the agent ask.</p>
      </>,
    },
    {
      title: 'Asking instead',
      // the loose sketches, flattened onto Figma's canvas grey
      media: (
        <MediaGrid>
          <MediaRow>
            {sketch('sketch-bubbles-black', 'Three agent questions as dark speech bubbles with brick studs, each answered in plain text: workouts, theme, colour scheme')}
            {sketch('sketch-bubbles-white', 'The same three questions and answers, the bubbles joined by white studs')}
            {sketch('sketch-plain', 'The same three questions and answers set as plain text with no bubbles')}
          </MediaRow>
        </MediaGrid>
      ),
      body: <p>Halfway through the sprint the sketches started to drift. Rewriting a prompt means the agent invents the details, and the more it invents the less the result feels like yours. So alongside the toggle I sketched the other route: the agent asks.</p>,
    },
    {
      title: 'Incremental prompt building',
      media: (
        <MediaGrid>
          <MediaRow>
            {phone('incremental-phone-bubble', 'Phone screen: the agent asks what workouts to track in a speech bubble, and the answer pills sit in a bubble of their own')}
            {phone('incremental-phone-checklist', 'Phone screen: the questions listed in the agent’s turn as a checklist, three ticked and one open')}
            {phone('incremental-phone-bricks', 'Phone screen: the same list with a brick icon per question, the current one yellow')}
            {phone('incremental-phone-editable', 'Phone screen: answered questions with a menu and avatar beside each, so any can be reopened')}
            {phone('incremental-phone-stack', 'Phone screen: the answers stacked as interlocking bricks under a yellow Workout App brick')}
          </MediaRow>
        </MediaGrid>
      ),
      body: <p>Questions arrive as speech bubbles, answers as pills, and the thread keeps a checklist of what has been asked. By the end of the sprint the checklist had become a stack of bricks, each one a decision the user had made, and the stack was the prompt.</p>,
    },
    {
      title: 'One question at a time',
      // the six wizard cards laid out on Figma's canvas grey
      media: <Img src={`${P}/wizard-gallery.webp`} alt="Six wizard cards: the widget’s function as pills, a dial of sports, widget size on a tilted homescreen, ranking with drag handles, a days-a-week counter, and visual style picked from three reference widgets" width={2500} height={1904} />,
      body: <p>The second round of Figma work was about the questions themselves. Each one needs an interaction that suits its answer, so the composer became a card that asks one thing at a time and swaps its body per question: pills for multiple choice, a counter for numbers, a drag list for ranking, a homescreen for widget size, and a gallery of reference widgets for visual style.</p>,
    },
    {
      title: 'The interview prototype',
      media: proto('v2-interview'),
      body: <p>Send a prompt and the agent answers with &ldquo;let me ask a few questions to get this right&rdquo;. After a beat the composer morphs into the wizard. The questions come from a model in two rounds: two or three discovery questions about what the widget is for, then follow-ups written with those answers in hand, closed by size and style. The size step goes up while the follow-ups load, so there is never a dead wait. As each question is revealed the agent&apos;s turn mirrors it into a live checklist, and when the last one is answered the answers are read back into the thread as bullets before the build runs.</p>,
    },
    {
      title: 'Refining the interview',
      media: proto('v3-interview'),
      body: <>
        <p>V3 is V2 with the feedback folded in. The thread opens on a greeting instead of an empty sheet. The 1/5 counter became a progress ring, because the interview has no fixed length and a denominator that keeps changing reads as a bug. Skip joined Next.</p>
        <p>The live checklist became a record of activity: &ldquo;Asking questions&rdquo; runs behind a loader and folds the questions out on demand once they are answered, then &ldquo;Forming prompt&rdquo; does the same for the prompt the answers amount to, written as one paragraph addressed to the builder rather than a list of bullets. The style gallery was redrawn per size so every tile fills its slot, selection reads by contrast instead of a badge, and the built widget lands on the canvas above in the chosen style, so &ldquo;it&apos;s on the canvas above&rdquo; is true the moment it is said.</p>
      </>,
    },
    {
      title: 'Engineering',
      body: <p>The prototype is a Next.js app. Each version lives side by side in its own tree, so V3 could be iterated without disturbing V2. The interview questions, the follow-ups and the written prompt come from a live model behind an API route, with deterministic fallbacks so the flow never dead-ends without a key. The phone frame lays out at its Figma size and scales down to fit the viewport, so every measurement taken from the design stays literal.</p>,
    },
    {
      title: 'What I took from it',
      body: <p>Rewriting the prompt for the user made it worse in the way that mattered: it stopped being theirs. Asking a handful of well-chosen questions keeps the user as the author and the agent as the one who knows what a widget needs. The prompt that reaches the builder is assembled, not guessed, and every brick in it is a decision someone actually made.</p>,
    },
  ],
}
