import React from 'react'
import type { Project } from '@/data/projects'
import { Ascii } from '@/components/agent-v6/Ascii'
import { Img } from '@/components/Img'
import { MediaRow } from '@/components/MediaRow'
import { Video } from '@/components/Video'
import { nothingPhone } from '@/data/phone'

/** A run of the build-flow prototype, the 414x916 screen recorded at 2x with the
 *  bezel edge cropped off, set in the phone render at the same 720px screen as
 *  the Essential Apps Mobile recordings. Clips are cached for a day under the
 *  same name, so bump the take when they are re-recorded. */
const take = 4
const phone = (name: string) => <Video src={`/videos/agent-v6/${name}.mp4?t=${take}`} width={824} height={1828} displayHeight={720} frame={nothingPhone} />

/** Figures come from the internal bench reports (13–14 Oct 2026), the agent
 *  design doc, the prod prompt study (20 Oct 2026) and the caching spike
 *  (14 Oct 2026). They are internal numbers and need Nothing's sign-off before
 *  this is listed. Five parts, each with sub-chapters (level 2). The figures
 *  are monospace drawings (see Ascii); keep every line at 76 columns or fewer. */

// the twenty legacy widgets picked up by the new agent: six strips, fixed columns
const strips = (() => {
  const rows: [string, number, number, boolean][] = [
    ['Weather', 1, 2, true], ['Water tracker', 2, 1, true], ['Habit tracker', 3, 2, true],
    ['Shopping list', 4, 1, true], ['Stopwatch', 1, 2, true], ['Tic-tac-toe', 5, 2, false],
  ]
  return rows.map(([name, old, nw, healed]) => {
    const cells: string[] = []
    for (let i = 0; i < old + nw; i++) {
      const v = `v${i + 1}`
      cells.push(i >= old ? `«a|${v}»` : healed && i === old - 1 ? `«r|${v}»` : v)
    }
    const line = `  ${name.padEnd(16)} ${cells.join('  ')}`
    const visible = 2 + 16 + 1 + (old + nw) * 4 - 2
    return line + ' '.repeat(Math.max(1, 50 - visible)) + (healed ? '«a|healed»' : '')
  }).join('\n')
})()

// the 193-version sweep as a grid: 24 a row, the 22 that never rendered marked
const sweep = (() => {
  const stuck = new Set([3, 7, 15, 22, 31, 38, 44, 57, 63, 69, 78, 86, 95, 101, 112, 120, 133, 141, 150, 162])
  const blank = new Set([47, 171])
  const rows: string[] = []
  for (let r = 0; r < 9; r++) {
    const cells: string[] = []
    for (let c = 0; c < 24; c++) {
      const i = r * 24 + c
      if (i >= 193) break
      cells.push(stuck.has(i) ? '«r|█»' : blank.has(i) ? '«r|○»' : '«d|░»')
    }
    rows.push('  ' + cells.join(' '))
  }
  return rows.join('\n')
})()

export const agentV6: Project = {
  slug: 'agent-v6',
  title: 'Essential Apps Agent',
  tagline: 'Rewriting the agent that writes the widgets',
  date: '2026',
  company: 'Nothing',
  contribution: 'Investigation, Agent architecture, Evaluation',
  // listed once the internal figures are signed off
  hidden: true,
  layout: 'article',
  sections: [
    // ------------------------------------------------------------ 0
    {
      title: 'Before and after',
      body: <>
        <p>This is a long article about rewriting an AI agent, and most of it is measurement: where the time went, what each widget cost, which prompts failed and why. It is easy to read all of that and still not know what changed for the person holding the phone. So before any of it, the change itself.</p>
        <p>Both phones below get the same request, a widget that shows where the International Space Station is. On the left is the agent as I found it. It thinks for a minute and a half and hands back a tile of text with a button. On the right is the agent after the rewrite. It is done in half the time, at a 50th of the cost, and what lands is a widget you would keep on your home screen.</p>
        <p>The rest of the article is how we got from one to the other.</p>
      </>,
      media: (
        <MediaRow together>
          {phone('before')}
          {phone('after')}
        </MediaRow>
      ),
      bare: true,
      caption: 'The left phone runs at 10× while it waits, with the clock in the block keeping real time. The right phone runs at real time.',
    },
    // ------------------------------------------------------------ 1
    {
      title: 'Overview',
      body: <>
        <p>Essential Apps turns a sentence into a widget on a Nothing phone. An agent writes the code, a build compiles it, the phone renders it. By October 2026 the agent was 18,400 lines of Python, ran three helper models a turn, and one widget in ten that it called built never drew anything.</p>
        <p>I investigated why, wrote the replacement, and built the way we measure it. The new agent is one model, eight tools and the real compiler in the loop. It runs on a much smaller model than the legacy agent needed, renders everything it builds, in half the time, at a 50th of the cost.</p>
      </>,
      media: (
        <Ascii label="Cost per 100 widgets, legacy agent against new agent, then five smaller measures">{`
  Cost for 100 widgets

  Legacy agent   $25.34   «d|██████████████████████████████████████████████████»
  New agent      «a| $0.47   █»

  +---------------------------+---------------+---------------+
  |                           |  Legacy agent |     New agent |
  +---------------------------+---------------+---------------+
  | Widgets that never render |      7 of 100 |      «a|0 of 100» |
  | Median time to a widget   |          92 s |          «a|49 s» |
  | Lines of Python           |        18,402 |         «a|1,800» |
  | Tools                     |            17 |             «a|8» |
  | Helper models per turn    |             3 |             «a|0» |
  +---------------------------+---------------+---------------+
`}</Ascii>
      ),
    },

    // ------------------------------------------------------------ 2
    {
      title: 'The legacy agent',
      body: <p>The agent had grown for a year without a way to know whether what it wrote worked. In place of that it had grown substitutes, and then guards to defend the substitutes from each other.</p>,
    },
    {
      title: 'Architecture',
      level: 2,
      body: <>
        <p>A turn began before the main model had read the request: a Haiku model guessed the widget&apos;s capabilities from the whole chat, and its answer was pasted into the system prompt and re-sent, uncached, on every step. Then the main model ran up to fifteen steps over seventeen tools.</p>
        <p>Two more helper models hid in those tools. One chose the colour theme, in two Haiku calls. One chose which app a tap should open. Each had its own prompt, parser and silent fallback. When the theme picker failed, the widget came out black and red, which is why they all looked the same.</p>
      </>,
      media: (
        <Ascii label="One turn of the legacy agent: a Haiku pre-step, a fifteen-step loop with helper models inside its tools, a regex validator, and files written to the database as it goes">{`
  phone ------> backend
                   |
                   v
  «h| CAPABILITY RESOLVER »   «a|a Haiku model, before every turn,»
                   |          «a|guessing from the whole chat»
                   v
  +--------------------------------------------------------------+
  | System prompt     7.5k tokens of rules + 3.6-8.4k pasted code |
  |                   re-sent, uncached, on every step            |
  +--------------------------------------------------------------+
                   |
                   v
  +--------------------------------------------------------------+
  | Main model        up to 15 steps, 17 tools                    |
  |                   next move chosen by grepping for "[ERROR]"  |
  |                   twelve guards around the validator          |
  +-------+------------------+------------------+-----------------+
          |                  |                  |
       files              layout            validator
       straight to        guesses, never    61 regexes
       the database       measures          never compiles

  «h| THEME »  «h| APP LINK »  «h| SEARCH »     «a|three more Haiku calls, inside the tools»
`}</Ascii>
      ),
      caption: 'One turn. Each marked label is a separate model call, two to four per new widget.',
    },
    {
      title: 'Code through the model',
      level: 2,
      body: <p>The tested modules we wanted in every widget, location, audio, storage, reached it by being flattened into the prompt and retyped by the model into <code>App.tsx</code>. The audio module alone was 900 lines: 8,400 tokens re-read on every step, then typed out once more. The validator checked the paste by grepping for a marker name.</p>,
      media: (
        <Ascii label="How a tested module reached the widget before and after: retyped by the model and checked by name, against written as a read-only file and imported">{`
  «d|Legacy agent»

  audio.tsx ----> prompt ----> «a|model retypes it» ----> validator
  900 tested      8.4k tokens  «a|900 lines, into App.tsx»  greps for a
  lines           a step                                 marker name

  It compared names, not code: a paste that renamed one helper
  failed, a rewrite that kept the names passed.

  «d|New agent»

  audio.tsx ----> «a|declare writes it» ----> model imports it ----> tsc
  unchanged       «a|a read-only file»        one line               a wrong
                  «a|0 tokens»                                       import is
                                                                   a type error
`}</Ascii>
      ),
    },
    {
      title: 'No compiler',
      level: 2,
      body: <>
        <p>The agent never compiled anything. In place of a compiler it had a 1,901-line validator of 61 regular expressions, and a hand-kept Python copy of <code>package.json</code>. The real build ran after the turn, on a separate worker, once the run was already marked done. If it failed, the agent never heard.</p>
        <p>Because the validator&apos;s verdict was unreliable, twelve guards had grown around it, and the loop chose its next move by searching tool output for <code>[ERROR]</code>.</p>
      </>,
      media: (
        <Ascii label="Timeline of a turn before and after: the legacy agent compiled after the run was marked done, on a separate worker; the new agent type-checks after every write and gates the finish on tsc and Metro">{`
  «d|Legacy agent»   the compile happens after the turn

  write ..... write ..... reply ..... run done .....: «r|another worker compiles,»
  regex       regex       files       told to the    «r|later. if it fails, the»
  check       check       saved       phone          «r|agent never hears»

  «d|New agent»      the compiler is in the loop

  write ----- edit ----- write ----- «a|[ tsc + Metro ]» ----- «g|green» ----- reply
  tsc         tsc        tsc         «a|both must pass»      saved       the same
                                     «a|three red builds»    once        bundle
                                     «a|end the turn»
`}</Ascii>
      ),
    },
    {
      title: 'Happy on a crash',
      level: 2,
      body: <>
        <p>Every file write went straight to the database, so a turn that died on step eight had already saved steps one to seven: a half-made version, a build of it, and a version pill in the chat.</p>
        <p>And a run reported success even when the widget crashed on the phone. In a sweep of 193 versions on production, 22 never rendered, usually from code calling a helper it had never declared. The regexes could not see it; the compiler was never asked.</p>
      </>,
      media: (
        <Ascii label="193 widget versions from a production sweep; 22 never rendered, 20 stuck on a loading spinner and 2 drew nothing, all recorded as succeeded">{`
  193 widget versions built on production   «r|22 never rendered, every one»
                                            «r|recorded as "succeeded"»

${sweep}

  «d|░» rendered   «r|█» stuck on the host's spinner, forever   «r|○» drew nothing
`}</Ascii>
      ),
      caption: 'Found by hashing the frames: every stuck widget shared one byte-identical spinner image.',
    },
    {
      title: 'How I found it',
      level: 2,
      body: <>
        <p>I read the agent end to end, rendered its prompt and tool schemas to count what each step sent, and traced one turn from phone to database. The numbers made the argument.</p>
        <p>Then I ran it at volume on a phone: 100 prompts, two sizes, captured at the first rendered frame. Seven builds never rendered. I wrote the flaws up in one list so the rewrite could be checked against it. None of them should survive.</p>
      </>,
      media: (
        <Ascii label="Input tokens sent on each step of a six-step audio widget turn, split into cached and uncached parts">{`
  What one step sent      25,486 input tokens, before the widget's own code

  cached, once an hour    «d|███████████████ 7.5k  ██████████ 5.1k»
                          static prompt         tool schemas

  uncached, every step    «a|██ 0.8k  █████████████████ 8.4k  ███████ 3.6k»
                          context   pasted audio module     location + storage

  six steps x 12.9k uncached = about 77,000 tokens of pasted code a turn,
  and the model then types the 900 lines out once more as output
`}</Ascii>
      ),
      caption: 'Measured by rendering the prompt and tool schemas from the code; tokens are characters ÷ 4.',
    },

    // ------------------------------------------------------------ 3
    {
      title: 'The new agent',
      body: <p>One model in one thread, eight tools, and the compiler inside the loop. About 1,800 lines against 18,400.</p>,
    },
    {
      title: 'How it works',
      level: 2,
      body: <>
        <p>The loop is 126 lines: call the model, run its tools, append the results, repeat. TypeScript runs after every write and its errors go back to the model. When the model stops, TypeScript and Metro must both pass before the turn can end. Three red builds end it with a plain apology.</p>
        <p>All edits happen on a temp copy; only a green turn is saved, so a failed turn leaves no half-made version. A <code>declare</code> tool writes the tested modules as read-only files and returns their imports and type signatures, so nothing is retyped and a wrong import is a type error.</p>
      </>,
      media: (
        <Ascii label="One turn of the new agent: stage the files, build the prompt, run the loop with tsc after every write, pass the finish gate, save once on green">{`
  phone ------> backend worker ------> «h| RUN_TURN »   one model, one thread

  +------------------------------------------------------------------+
  |  1  Stage        the previous version's files, into a temp dir   |
  |  2  Prompt       56 lines of rules, the files inlined, the spec  |
  |  3  Loop         126 lines, 8 tools, tsc after every write       |
  |                  declare fits write edit delete ask search fetch |
  |  4  «a|Finish gate  tsc + Metro must pass; 3 red builds end the turn» |
  |  5  Save         once, only on green: the next version and spec  |
  +------------------------------------------------------------------+

  declare writes the catalogue into the project:
  11 capability modules, 29 hooks, app links, theme tokens
`}</Ascii>
      ),
    },
    {
      title: 'Results',
      level: 2,
      body: <p>The first runs did exactly what the legacy agent did, with nothing broken, on the same model. Then came the part the legacy agent could not do. Its regexes needed the strongest model to stay out of trouble. The new agent checks its own work, so it can run a much smaller model, and it lost nothing in the move.</p>,
      media: (
        <Ascii label="Legacy agent and new agent on the same 100 prompts: median time, cost per 100 widgets, and rendered counts">{`
                    median time to a widget      cost for 100 widgets

  Legacy agent      «d|███████████████████» 92 s     «d|████████████████████» $25.34
  89 of 100 rendered

  New agent         «a|██████████ 49 s»               «a|▏ $0.47»
  90 of 100 rendered

  mean input tokens per widget  52,174 -> 4,371
`}</Ascii>
      ),
      caption: 'Legacy cost is estimated from tokens at list price; the new agent’s is what was billed.',
    },
    {
      title: 'Faster checks',
      level: 2,
      body: <p>The first version was twice as slow as the legacy agent. Timing each stage showed the model was not the slow part: every write ran a cold <code>tsc</code> on a worker with half a CPU, and the finish ran it again plus Metro. TypeScript 7&apos;s native compiler, <code>tsgo</code>, became the loop&apos;s only check, with Metro run once on the build worker. The median turn went from 161 to 49 seconds.</p>,
      media: (
        <Ascii label="The checks a turn ran before and after: a cold tsc after every write and Metro twice, against tsgo after every write and Metro once on the build worker">{`
  «d|First version»                                        161 s median

  [ write ] «r|[ tsc, cold ]» [ write ] «r|[ tsc, cold ]» «r|[ tsc ]» [ Metro ] «d|[ Metro ]»
  each cold tsc about 7.5 s on a half-CPU worker;
  Metro at the gate, then again for delivery

  «d|With tsgo»                                             «g|49 s median»

  [ write ] «a|[ tsgo ]» [ write ] «a|[ tsgo ]» «a|[ tsgo ]» [ Metro, once ]
  tsgo is the only check in the loop;
  Metro runs once, on the build worker, and that bundle ships
`}</Ascii>
      ),
    },
    {
      title: 'Colour',
      level: 2,
      body: <>
        <p>The agent&apos;s palettes are Radix colour scales. Each scale is twelve steps with a role for each: backgrounds, hover and pressed surfaces, borders, solid fills, text. The agent asks for a step by role, not a hex value, so a widget is laid out the same in any hue.</p>
        <p>They are built in OKLCH, so hue and saturation hold across the steps and every step&apos;s contrast against the others is known in advance.</p>
      </>,
      media: (
        <MediaRow captions={['Nothing', 'Radix Indigo']}>
          <Img src="/images/agent-v6/iss-nothing-4x4.webp" alt="The ISS tracker widget in the Nothing theme: dark grey with a red marker" width={720} height={720} />
          <Img src="/images/agent-v6/iss-radix-indigo-4x4.webp" alt="The same ISS tracker in the Radix indigo scale" width={720} height={720} />
        </MediaRow>
      ),
      caption: 'The same ISS tracker, one scale swapped for another and nothing else changed.',
    },

    // ------------------------------------------------------------ 4
    {
      title: 'Evals',
      body: <p>Measuring the agent turned out to matter as much as rewriting it. The suite we had could not see the failures users hit, so we built one from what users actually asked for and ran it on the phone.</p>,
    },
    {
      title: 'The previous suite',
      level: 2,
      body: <p>Forty-two YAML cases run through the loop locally. A clear prompt should produce code, a vague one should ask, a two-turn case should clarify then build. The assertions were <em>has code</em>, <em>at least 400 characters</em>, <em>contains import React</em>. It never compiled or rendered anything, so it could not see a widget that built and then spun forever. And its prompts were ours.</p>,
      media: (
        <Ascii label="The old evaluation suite stopped at the agent's text output; compiling, rendering and the phone were never reached">{`
  [ prompt ] ---> [ loop ] ---> «a|[ assert ]»  :  «d|[ compile ] ... [ render ]»
  written by us   local,        «a|has code»     :   «d|never reached»
                  mocked DB     «a|400+ chars»   :
                                               the suite stopped here;
                                               «r|one widget in ten spun forever»
                                               «r|past it, recorded as success»
`}</Ascii>
      ),
    },
    {
      title: 'Using the data we had',
      level: 2,
      body: <>
        <p>We took the first prompt of every production conversation, hashed the user ids, scrubbed anything personal, and had a model label each by category, topic and whether it needed live data or the Nothing look.</p>
        <p>Most requests are variations on about ten widget types, and a third of second prompts are corrections. From that we wrote the test set: 100 prompts weighted like real use, and ten-turn chains that edit one widget again and again.</p>
      </>,
      media: (
        <Ascii label="Share of 23,712 production prompts by family, and what second prompts ask for; 37% are corrections">{`
  23,712 first prompts from 6,463 people, by family

  Time & routine        «d|████████████████████» 28.8%  clocks, timers, to-dos
  Play & personality    «d|██████████████████» 25.4%    games, toys, pets, music
  Live info             «d|█████████████████» 24.1%     weather, sports, travel
  Phone tools           «d|███████████» 15.2%           status, controls, tools
  Unclassified          «d|███» 4.2%
  Bigger than a widget  «d|██» 2.3%                     full apps and dashboards

  What the second prompt asks for          «r|corrections, 37% in all»

  Add a feature           «d|██████████████████████» 31.2%
  Change the look         «d|██████████» 14.5%
  Broken, won't load      «r|████████» 10.9%
  Doesn't fit             «r|██████» 8.8%
  Taps don't work         «r|████» 6.3%
  Live data wrong         «r|████» 6.1%
  Can't reach phone data  «r|███» 4.8%
`}</Ascii>
      ),
      caption: 'Every production conversation’s first prompt, Sep 2025 – Oct 2026.',
    },
    {
      title: 'A new eval system',
      level: 2,
      body: <p>The tests run on a phone, through the product. A debug service in the app posts each prompt, waits for the build, renders the widget in the real host and saves the first frame. Volume beat cleverness: one assertion misses a spinner, a hundred screenshots do not.</p>,
      media: (
        <Ascii label="The phone bench: a debug service posts prompts through the real product path and saves each widget's first frame">{`
  [ prompts ] ---> «a|[ BenchService ]» ---> [ run ] ---> [ build ] ---> [ render ]
  100, or          «a|in the debug app»      the real    Metro, on     real host,
  chains of 10     «a|4 in flight»           API         the server    first frame

  about 90 minutes for 100 widgets; the report is a page of frames
  with time, tokens and cost under each
`}</Ascii>
      ),
    },
    {
      title: 'Edge cases',
      level: 2,
      body: <p>Twenty widgets built by the legacy agent, then the environment switched to the new one with the database kept: it continued every one and repaired the five left broken, given ordinary edits. The reverse was checked too. The legacy agent stayed behind a one-line switch, so a rollback was a deploy, not a revert.</p>,
      media: (
        <Ascii label="Twenty widgets built by the legacy agent, then continued by the new agent with the database kept; six shown, with the five the legacy agent left broken">{`
  versions by the legacy agent, then by the new agent

${strips}

  «r|v» left broken by the legacy agent   «a|v» built by the new agent

  turns built and rendered     legacy   «d|█████████░░» 49 of 57
                               new      «g|███████████» 30 of 30

  ten-turn edit chains: new 50 of 50; legacy failed in 3 of 5 chains
`}</Ascii>
      ),
    },

    // ------------------------------------------------------------ 5
    {
      title: 'Caching',
      body: <p>The prompt study showed people ask for the same things: a clock, a pomodoro, a water tracker. Variations on a small set. That makes a different first turn possible, where the agent is kept for the long tail.</p>,
    },
    {
      title: 'A library of widgets',
      level: 2,
      body: <p>A stronger model, Claude Opus 5.5, builds each common widget type ahead of time and reviews its own render until it passes. Every user-facing value sits in one settings block and the whole look in one theme file, so a first prompt edits a reviewed template rather than starting from nothing. Each template is compiled once, and the bundle is shared.</p>,
    },
    {
      title: 'Picking with Jev',
      level: 2,
      body: <p>A decision model returns a probability for each allowed answer instead of writing text. One call to Jev asks three questions at once: which template, which look, and whether settings alone will do. It beat embeddings on every count, at the same speed, and its third answer saves a wasted settings call on the prompts that need the agent.</p>,
      media: (
        <Ascii label="Jev decisions against embeddings and the old chat picker on 34 test prompts: template, look and route accuracy, and time">{`
  +-----------------------+----------+----------+----------+--------+
  |                       | template |     look |    route |   time |
  +-----------------------+----------+----------+----------+--------+
  | «a|Jev, decisions»        | «a|34 of 34» | «a|34 of 34» | «a|32 of 33» |  «a|0.4 s» |
  | Embeddings            | 31 of 34 |        - |        - |  0.5 s |
  | Chat call, old picker | 33 of 34 |        - |        - |  1.8 s |
  +-----------------------+----------+----------+----------+--------+
`}</Ascii>
      ),
      caption: '34 test prompts, labelled by hand; two runs gave the same answers.',
    },
    {
      title: 'Results',
      level: 2,
      body: <p>On the phone a world clock went from 51 seconds to 27, and to 21 with the pre-built bundle. The agent&apos;s share of the cost fell to a quarter: 20 of 30 test prompts needed only the settings call. Delivery is now the wait; the same bundle installs in 9 seconds over USB.</p>,
      media: (
        <Ascii label="Two routes for a first prompt: from scratch through the agent in about 49 seconds, or through a template library in 21 to 27 seconds and a quarter of the cost">{`
  «d|From scratch»                                        about 49 s

  [ prompt ] ---> [ agent ] ---> [ compile ] ---> [ phone ]
                  about 20 s     Metro, 5-15 s    download, install

  «d|From the library»                                    «g|21-27 s»

  [ prompt ] ---> «a|[ Jev ]» ---> [ settings ] ---> [ bundle ] ---> «g|[ phone ]»
                  «a|0.4 s»        about 3 s         pre-built,
                    :                                no compile
                    '...... new data or a new feature:
                            the agent edits the template instead
`}</Ascii>
      ),
      caption: 'A teammate’s spike, October 2026, behind flags.',
    },
  ],
}
