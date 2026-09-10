import React from 'react'
import { Img } from '@/components/Img'
import { Reel, type ReelItem } from '@/components/Reel'
import { Collage } from '@/components/Collage'
import { Video } from '@/components/Video'
import type { Project } from '@/data/projects'

const P = '/images/prompt-lego'

/** A 414x920 phone screen exported from Figma at 2x. */
const figma = (name: string, caption: string, alt?: string): ReelItem => ({
  src: `${P}/${name}.webp`,
  width: 828,
  height: 1840,
  alt: alt ?? `Figma exploration: ${caption}`,
  caption,
})

/** A still of the prototype's phone frame, captured at 2x. */
const proto = (name: string, caption: string, alt?: string): ReelItem => ({
  src: `${P}/${name}.webp`,
  width: 830,
  height: 1840,
  alt: alt ?? `Prototype: ${caption}`,
  caption,
})

/** A Figma component frame exported at 2x, sized per frame. */
const part = (name: string, width: number, height: number, caption: string): ReelItem => ({
  src: `${P}/${name}.webp`,
  width,
  height,
  alt: `Figma component: ${caption}`,
  caption,
})

const references: ReelItem[] = [
  { src: `${P}/ref-imagine-chain.webp`, width: 964, height: 1200, alt: 'Reference: a chain of /imagine prompts joined like links' },
  { src: `${P}/ref-block-palette.webp`, width: 1034, height: 826, alt: 'Reference: a colour palette drawn as toy bricks' },
  { src: `${P}/ref-tickr-chat.webp`, width: 1200, height: 1200, alt: 'Reference: a builder chat that offers its next edits as chips' },
  { src: `${P}/ref-marathon-app.webp`, width: 1170, height: 1165, alt: 'Reference: a colourful running app whose cards interlock like blocks' },
  { src: `${P}/ref-morning-widget.webp`, width: 1536, height: 1536, alt: 'Reference: a glanceable, personal morning widget on a phone' },
]

const incremental: ReelItem[] = [
  { src: `${P}/incremental-bubbles-black.webp`, width: 1224, height: 1018, alt: 'Three agent questions as dark speech bubbles with brick studs, each answered in plain text: workouts, theme, colour scheme' },
  { src: `${P}/incremental-bubbles-white.webp`, width: 1224, height: 1018, alt: 'The same three questions and answers, the bubbles joined by white studs' },
  { src: `${P}/incremental-plain.webp`, width: 1224, height: 1018, alt: 'The same three questions and answers set as plain text with no bubbles' },
]

/** The question-and-answer idea carried into the phone: 414x920 Figma frames at 2x. */
const incrementalPhones: ReelItem[] = [
  { src: `${P}/incremental-phone-bubble.webp`, width: 828, height: 1452, alt: 'Phone screen: the agent asks what workouts to track in a speech bubble, and the answer pills sit in a bubble of their own' },
  { src: `${P}/incremental-phone-checklist.webp`, width: 828, height: 1452, alt: 'Phone screen: the questions listed in the agent’s turn as a checklist, three ticked and one open' },
  { src: `${P}/incremental-phone-bricks.webp`, width: 828, height: 1452, alt: 'Phone screen: the same list with a brick icon per question, the current one yellow' },
  { src: `${P}/incremental-phone-editable.webp`, width: 828, height: 1452, alt: 'Phone screen: answered questions with a menu and avatar beside each, so any can be reopened' },
  { src: `${P}/incremental-phone-stack.webp`, width: 828, height: 1452, alt: 'Phone screen: the answers stacked as interlocking bricks under a yellow Workout App brick' },
]

const wizardCards: ReelItem[] = [
  { src: `${P}/wizard-pills.webp`, width: 780, height: 600, alt: 'Wizard card, question 1 of 5: the widget’s function as choice pills, with a plus to add your own' },
  { src: `${P}/wizard-sport.webp`, width: 780, height: 1064, alt: 'Wizard card: a dial of sports, cycling picked at its centre' },
  { src: `${P}/wizard-size.webp`, width: 780, height: 813, alt: 'Wizard card: widget size on a tilted homescreen, 4x4 flagged as recommended' },
  { src: `${P}/wizard-rank.webp`, width: 780, height: 720, alt: 'Wizard card: ranking what earns space on the widget, four rows with drag handles' },
  { src: `${P}/wizard-counter.webp`, width: 780, height: 492, alt: 'Wizard card: how many days a week you train, as a counter set to five' },
  { src: `${P}/wizard-style.webp`, width: 780, height: 480, alt: 'Wizard card: visual style picked from three reference widgets' },
]

/** the phone videos sit centred at phone width rather than filling the column */
const phoneVideo: React.CSSProperties = { width: 'min(100%, 380px)', marginLeft: 'auto', marginRight: 'auto' }

export const promptLego: Project = {
  slug: 'prompt-lego',
  title: 'Prompt Lego',
  tagline: 'A prototype that turns vague widget prompts into specific ones',
  date: '2026',
  content: (
    <>
      <p>Essential Builder is Nothing&apos;s Gen UI app: you describe a phone widget and an agent builds it. In testing, the first prompt was often the problem. People typed things like &ldquo;Build me an Instagram clone&rdquo;, which is too broad for a widget and says nothing about features, size or look. The agent had to guess, and the first build was rarely what they had in mind. Prompt Lego is a prototype of how the app could help people say what they want before anything gets built.</p>
      <p><Img src={`${P}/hero-lego-stack.webp`} alt="A prompt assembled from lego-like bricks: Workout App, Focused on calisthenics, Minimalist app one main view, Widget size should be 4x2, Colours should be" width={780} height={628} goo={false} /></p>
      <p>The name comes from the idea that a good prompt is built from a few small, separable pieces: what the widget does, what it shows, how big it is, how it looks. Each is a brick, and the user should be able to add or swap one without rewriting the whole thing.</p>

      <h2>What users were doing</h2>
      <p>One interview made the problem concrete. A user showed us their workaround: they wrote their idea in Gemini first, asked it to turn it into a better prompt, then pasted the result into Essential Builder. They had bolted the missing step onto the front of the app themselves. That set the brief. The app should do that step for them, and do it better than a general chat can, because it knows what a widget is.</p>

      <h2>References</h2>
      <p>A few references I kept coming back to. Two are about interlocking pieces, the visual idea behind the bricks: cards that plug into one another, and a palette drawn as toy blocks. One is a chain of prompts, each joined to the next. The last is the kind of glanceable, personal widget people kept describing.</p>
      <Collage items={references} label="References" />

      <h2>Interactive prompt prototype</h2>
      <p>I was curious how this would feel to use, so rather than design it out fully I made a single Figma frame of the enhanced composer and pointed an AI coding agent at it to turn it into a working prototype. Type a draft and tap Enhance: the field grows, a highlight sweeps its border while the rewrite is prepared, and the new prompt lands in display type with the proposed palette as inline colour pills. Tap the pills and a colour editor opens, so the palette is the one part of the rewrite you can adjust directly. Revert puts the original words back.</p>
      <Video src="/videos/prompt-lego/v1-enhance.mp4" width={828} height={1840} controls goo={false} maxHeight={680} wrapperStyle={phoneVideo} />
      <p>It demoed well and it felt wrong. The rewrite is a black box: you read a sentence you did not write and decide whether to trust it, and changing anything beyond the colours means going back to the text. The useful part was hidden underneath. The prompt only got better because the rewrite answered questions the original had left open. Asking those questions directly would give the user the same result with none of the guessing, so V2 dropped the toggle and made the agent ask.</p>

      <h2>Incremental prompt building</h2>
      <p>The first round of Figma explorations kept the chat as it was and added one thing to the composer: an Enhance toggle. Tap it and the draft is rewritten into something the builder can act on, with the details it needs filled in. The rewrite is presented rather than edited, set in a display face to mark it as the agent&apos;s words, and Revert puts your own back.</p>
      <Reel items={incremental} height={480} raw label="Incremental prompt building sketches" />
      <p>Halfway through the sprint the sketches started to drift. Rewriting a prompt means the agent invents the details, and the more it invents the less the result feels like yours. So alongside the toggle I sketched the other route: the agent asks. Questions arrive as speech bubbles, answers as pills, and the thread keeps a checklist of what has been asked. By the end of the sprint the checklist had become a stack of bricks, each one a decision the user had made, and the stack was the prompt.</p>
      <Reel items={incrementalPhones} height={640} label="Incremental prompt building on the phone" />

      <h2>Asking instead</h2>
      <p>The second round of Figma work was about the questions themselves. Each one needs an interaction that suits its answer, so the composer became a card that asks one thing at a time and swaps its body per question: pills for multiple choice, a counter for numbers, a drag list for ranking, a homescreen for widget size, and a gallery of reference widgets for visual style.</p>
      <Reel items={wizardCards} width={390} raw label="Second sprint components" />

      <h2>The interview prototype</h2>
      <p>Send a prompt and the agent answers with &ldquo;let me ask a few questions to get this right&rdquo;. After a beat the composer morphs into the wizard. The questions come from a model in two rounds: two or three discovery questions about what the widget is for, then follow-ups written with those answers in hand, closed by size and style. The size step goes up while the follow-ups load, so there is never a dead wait. As each question is revealed the agent&apos;s turn mirrors it into a live checklist, and when the last one is answered the answers are read back into the thread as bullets before the build runs.</p>
      <Video src="/videos/prompt-lego/v2-interview.mp4" width={828} height={1840} controls goo={false} maxHeight={680} wrapperStyle={phoneVideo} />

      <h2>Refining the interview</h2>
      <p>V3 is V2 with the feedback folded in. The thread opens on a greeting instead of an empty sheet. The 1/5 counter became a progress ring, because the interview has no fixed length and a denominator that keeps changing reads as a bug. Skip joined Next. The live checklist became a record of activity: &ldquo;Asking questions&rdquo; runs behind a loader and folds the questions out on demand once they are answered, then &ldquo;Forming prompt&rdquo; does the same for the prompt the answers amount to, written as one paragraph addressed to the builder rather than a list of bullets. The style gallery was redrawn per size so every tile fills its slot, selection reads by contrast instead of a badge, and the built widget lands on the canvas above in the chosen style, so &ldquo;it&apos;s on the canvas above&rdquo; is true the moment it is said.</p>
      <Video src="/videos/prompt-lego/v3-interview.mp4" width={828} height={1840} controls goo={false} maxHeight={680} wrapperStyle={phoneVideo} />

      <h2>Engineering</h2>
      <p>The prototype is a Next.js app. Each version lives side by side in its own tree, so V3 could be iterated without disturbing V2. The interview questions, the follow-ups and the written prompt come from a live model behind an API route, with deterministic fallbacks so the flow never dead-ends without a key. The phone frame lays out at its Figma size and scales down to fit the viewport, so every measurement taken from the design stays literal.</p>

      <h2>What I took from it</h2>
      <p>Rewriting the prompt for the user made it worse in the way that mattered: it stopped being theirs. Asking a handful of well-chosen questions keeps the user as the author and the agent as the one who knows what a widget needs. The prompt that reaches the builder is assembled, not guessed, and every brick in it is a decision someone actually made.</p>
    </>
  ),
}
