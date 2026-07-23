import React from 'react'
import { Img } from '@/components/Img'
import { Video } from '@/components/Video'
import { DemoFrame } from '@/components/workflow/DemoFrame'
import { Kbd } from '@/components/workflow/Kbd'
import { TryMeCursor } from '@/components/workflow/TryMeCursor'
import { OldPluginDemo } from '@/components/workflow/OldPluginDemo'
import { FirstVersionDemo } from '@/components/workflow/FirstVersionDemo'
import { MainDemo } from '@/components/workflow/MainDemo'

export type Project = {
  slug: string
  title: string
  tagline: string
  date: string
  hidden?: boolean
  content: React.ReactNode
}

const sideBySideWrap: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  marginTop: '3.5rem',
  marginBottom: '3.5rem',
}

const inFlex: React.CSSProperties = { marginTop: 0, marginBottom: 0, flex: 1, minWidth: 0 }

export const projects: Project[] = [
  {
    slug: 'nothing-ai-builder',
    title: 'Nothing Gen UI',
    tagline: 'A ground-up rewrite of the Gen UI product at Nothing',
    date: '2026',
    content: (
      <>
        <p>Nothing&apos;s Gen UI lets non-technical users create and deploy AI-powered phone widgets. My team was tasked with rebuilding the entire app in a single sprint to raise the bar across the board. I had sole responsibility for the frontend.</p>
        <p><Img src="/images/nothing-ai-builder/overview.webp" alt="Overview of the Essential App Builder editor" width={2000} height={1405} /></p>
        <p>The editor is split into a chat panel for prompting the agent, a code view, and a live preview, with a gallery of every widget you have created so far.</p>

        <h2>Mobile</h2>
        <p>The original had room to improve on mobile, which matters for a widget builder whose whole point is putting widgets on a phone. Getting mobile right was a key focus of the rewrite.</p>
        <div style={sideBySideWrap}>
          <Video src="/videos/nothing-ai-builder/old-mobile-flow.mp4" width={1080} height={2400} wrapperStyle={inFlex} />
          <Video src="/videos/nothing-ai-builder/web-mobile-flow.mp4" width={1080} height={2400} wrapperStyle={inFlex} />
        </div>
        <p>The old version is on the left, the new one on the right. The rewrite adds a bottom toggle to switch between chat and preview, and improves spacing and contrast throughout so the app stays legible at phone size. It also introduces a top bar that surfaces the information that matters most, such as the current version, alongside a burger menu that holds navigation.</p>

        <h2>Deploy Flow</h2>
        <p>Once happy with the preview you can deploy the widget to your phone. The backend compiles the React Native code into a real app that lives in the widget drawer.</p>
        <Video src="/videos/nothing-ai-builder/old-deploy-flow.mp4" width={1920} height={1222} />
        <p>The original ran everything in sequence: a starting screen, streamed build logs while the server compiled the app, then a form to name the widget, then a completion screen. Four surfaces one after another, and 40 seconds in this video. The logs served no purpose for a non-technical user, since nothing on that screen was theirs to act on, so they only added waiting time and risked confusing them.</p>
        <Video src="/videos/nothing-ai-builder/new-deploy-flow.mp4" width={1920} height={1440} />
        <p>The rewrite starts the compile the moment Deploy is clicked and lets it run in the background. To parallelise the work the form is shown straight away, so the build happens while the user fills it in. Once the form is done, a success, failed, or under-review (when publishing) screen appears. That is two surfaces instead of four, and the same process takes 12 seconds in this video.</p>

        <h2>Widget Size</h2>
        <p>The app offered two sizes, square and landscape, but the choice was hidden in the message input as an ambiguous toggle. User feedback showed people missed it entirely and assumed square, the default, was the only option.</p>
        <Video src="/videos/nothing-ai-builder/size-prompt.mp4" width={1920} height={1398} />
        <p>Change the size after the widget exists and the agent re-optimises for the new grid, rewriting the layout rather than squashing the old one into it.</p>
        <Video src="/videos/nothing-ai-builder/new-resize-flow.mp4" width={1920} height={1270} />
        <p>The video shows how the rewrite makes it an explicit selection on the first prompt, bringing intentionality to the widget's design from the start.</p>

        <h2>Version History</h2>
        <p>Every prompt produces a new version of the widget, so the app keeps a full version history. You can restore any earlier one, which clones the version you pick into a fresh version at the top of the history. The version number ticks up and the preview switches to show that new latest version.</p>
        <Video src="/videos/nothing-ai-builder/old-restore-flow.mp4" width={1920} height={1254} />
        <p>The problem was that Restore read as Preview. People expected clicking it to simply display that version in the editor, and visually that is what happens. But it also adds a new version: with 14 versions, restoring v2 quietly creates a v15 that clones v2. It was easy to assume you were only previewing and never notice the version number had gone up.</p>
        <Video src="/videos/nothing-ai-builder/new-restore-flow.mp4" width={1920} height={1268} />
        <p>The fix puts Preview and Restore in a dropdown as separate choices, so Restore is no longer taken for a preview. That still left what Restore actually does unclear, so a dialog now appears once to explain what happens when you click it.</p>

        <h2>Gallery</h2>
        <p>The rewrite fetches only what fits on screen, shows skeleton cards on slow connections, and uses optimistic updates for rename and delete. Fully keyboard-navigable with semantic HTML throughout.</p>
        <Video src="/videos/nothing-ai-builder/gallery-view.mp4" width={1920} height={1180} />

        <h2>Preview Architecture</h2>
        <p>The widget preview runs inside an iframe so a broken widget can&apos;t crash the editor. In the original that iframe had its own backend connection and state, which could drift out of sync with the parent silently. The rewrite makes the main app the single owner of state. The iframe&apos;s only job is to receive files via postMessage, bundle them, and report back.</p>

        <h2>Engineering</h2>
        <p>The rewrite uses Tailwind exclusively with design tokens for colour and typography. ESLint bans any, so every prop and API response is fully typed. useEffect was replaced almost entirely with TanStack Query, keeping data in the cache rather than spread across component state. Components are organised by feature, so each area of the app owns its own hooks and utils.</p>

        <h2>Tooltips</h2>
        <p>Icon-only buttons are ambiguous, so every one got a tooltip explaining what it does.</p>
        <p><Img src="/images/nothing-ai-builder/tooltip.webp" alt="Tooltip explaining an icon button in the editor toolbar" width={2000} height={1130} /></p>

        <h2>Fun</h2>
        <p>Some fun widgets made along the way.</p>
        <div style={sideBySideWrap}>
          <Video src="/videos/nothing-ai-builder/tetris-fun.mp4" width={1080} height={2400} wrapperStyle={inFlex} />
          <Img src="/images/nothing-ai-builder/widgets.webp" alt="Windows 98 themed widgets on device" width={900} height={2000} wrapperStyle={inFlex} />
        </div>
      </>
    ),
  },
  {
    slug: 'workflow-figma-plugin',
    title: 'Workflow Figma Plugin',
    tagline: 'The Figma plugin that pushed design files into the Workflow app',
    date: '2025',
    content: (
      <>
        <TryMeCursor />
        <p>
          <a href="https://www.workflow.design/" target="_blank" rel="noopener noreferrer" className="!no-underline">Workflow</a>{' '}is a web app for reviewing design work. Designers push their Figma files in, and the team leaves feedback, tracks tasks and signs off in one place. I worked on the Figma plugin, which gets a designer&apos;s file out of Figma and into the app.
        </p>
        <p>
          To upload a file the plugin needs the file&apos;s share link, and Figma gives plugins no direct way to read it. Getting that link into the plugin was the hard part.
        </p>
        <Video src="/videos/workflow/figma-flow.mp4" width={1280} height={800} />

        <h2>The manual version</h2>
        <p>
          The first plugin told the user what to do. A looping walkthrough showed them how to open Figma&apos;s Share menu, copy the file link, and paste it into a field by hand.
        </p>
        <p>
          It worked but was slow and easy to get lost in. This screen was where we lost the most users.
        </p>
        <DemoFrame designWidth={712} designHeight={620}>
          <OldPluginDemo />
        </DemoFrame>

        <h2>Reading the clipboard automatically</h2>
        <p>
          Then we found a shortcut. Figma&apos;s <Kbd keys={['⌘', 'L']} /> copies a link to the current selection straight to your clipboard. So instead of walking the user through the Share menu, we could ask for one keystroke and grab the link ourselves.
        </p>
        <p>
          The plugin used the browser&apos;s navigator.clipboard API (since deprecated) to poll the clipboard, watch for a string that looked like a Figma URL, and save it the moment it appeared. One shortcut, no pasting, no menus.
        </p>
        <p>
          In the demo, <Kbd keys={['shift', 'L']} /> stands in for <Kbd keys={['⌘', 'L']} />, since <Kbd keys={['⌘', 'L']} /> focuses the browser&apos;s address bar.
        </p>
        <DemoFrame designWidth={712} designHeight={620}>
          <FirstVersionDemo />
        </DemoFrame>

        <h2>Adding a paste step</h2>
        <p>
          Then Figma stopped plugins reading the clipboard. The seamless version stopped working, so we added a paste back into the flow. Pressing <Kbd keys={['⌘', 'V']} /> dropped the link into a hidden input the plugin could read.
        </p>
        <p>
          That created a problem. Before, the plugin could confirm the user had run <Kbd keys={['⌘', 'L']} />, because it saw the Figma URL land in the clipboard. Now it was blind to the clipboard, so it had no way to know the link had been copied.
        </p>
        <p>
          There was a second issue. Because of how Figma routes keyboard events, once you hold <Kbd keys={['⌘']} /> the plugin stops receiving the keys pressed after it, including the <Kbd keys={['L']} />. So it couldn&apos;t listen for <Kbd keys={['⌘', 'L']} /> directly.
        </p>
        <p>
          The fix was to guide the order. The plugin asks the user to hold <Kbd keys={['L']} /> first, which it can see, then press the modifier. That lets it validate each key, confirm the shortcut ran, and know the user is ready for the final <Kbd keys={['⌘', 'V']} />.
        </p>
        <p>
          In the demo, <Kbd keys={['shift']} /> stands in for <Kbd keys={['⌘']} /> on the middle step, and the final paste is a real <Kbd keys={['⌘', 'V']} />.
        </p>
        <DemoFrame designWidth={712} designHeight={620}>
          <MainDemo />
        </DemoFrame>
      </>
    ),
  },
  {
    slug: 'paintball',
    title: 'Automated Paintball Gun',
    tagline: 'I built a motorised turret that paints with a paintball gun',
    date: '2023',
    content: (
      <>
        <p>I wanted to know if a machine could make decent paintball art. So I bought a cheap gun, built a turret out of spare parts and stepper motors, and tried to make it accurate enough to find out.</p>
        <h2>Concept Design</h2>
        <p><Img src="/images/paintball/paintball1.webp" alt="Paint ball Project" width={1596} height={902} /></p>
        <p><Img src="/images/paintball/paintball3.webp" alt="Paint ball Project" width={1950} height={1186} /></p>
        <p><Img src="/images/paintball/paintball2.webp" alt="Paint ball Project" width={1632} height={1108} /></p>
        <p>The gun is made entirely from 3D printed parts (excluding bearings, motors, etc). Much of the design was split into sections due to print bed size limits. Blue/orange parts are 3D printed, teal is electronics.</p>
        <p>Key features:</p>
        <ol>
          <li>Vertical axis motor mount runs on a pulley system with a gear ratio of 150:10.</li>
          <li>Horizontal axis motor mount uses the same pulley system.</li>
          <li>Three motor controllers and an Arduino. Two motors for motion, one to pull the trigger.</li>
          <li>Vertical axis limit switch lets the turret home itself.</li>
          <li>Laser pointer adaptor is a quick-fit attachment to verify aim before a real print.</li>
        </ol>
        <p><Img src="/images/paintball/paintball4.webp" alt="Paint ball Project" width={1488} height={972} /></p>
        <p>The first sub-assembly. Rather than bypassing the trigger with an electronically controlled air valve, I used a stepper motor driving a lead screw to pull it mechanically.</p>
        <p>The two grey rings are bearings. Oversized for this application, but they add stability.</p>
        <h2>Actual Design</h2>
        <p><Img src="/images/paintball/paintball5.webp" alt="Paint ball Project" width={1852} height={1378} /></p>
        <p><Img src="/images/paintball/paintball6.webp" alt="Paint ball Project" width={2000} height={1406} /></p>
        <p><Img src="/images/paintball/paintball7.webp" alt="Paint ball Project" width={1858} height={1384} /></p>
        <h2>Software</h2>
        <p>Software was written using the Arduino language. The logic is straightforward. Inputs:</p>
        <ol>
          <li>Canvas height</li>
          <li>Canvas width</li>
          <li>Turrets x position from the bottom left corner of the Canvas</li>
          <li>Turrets y position from the bottom left corner of the Canvas</li>
        </ol>
        <p>This input then allows me to compute for a given x,z coordinate on the canvas what angle change is needed by the turret to aim.</p>
        <p>The resolution is determined by the smallest angle the turret can turn (vertically and horizontally). The gear ratio between the motor cog and the large cog is 150:10. Using the stepper drivers I am microstepping by 1/16, which gives 48,000 steps per full turret rotation, giving a resolution of 0.0075 degrees per step.</p>
        <h2>Videos</h2>
        <p>Testing the trigger system</p>
        <div className="video-wrap"><iframe width="100%" height="400" src="https://www.youtube.com/embed/OoE_Ep4ovDs" frameBorder={0} allowFullScreen /></div>
        <p>Testing the movement system</p>
        <div className="video-wrap"><iframe width="100%" height="400" src="https://www.youtube.com/embed/3OJhmOg1Wus" frameBorder={0} allowFullScreen /></div>
      </>
    ),
  },
  {
    slug: 'infinity',
    title: 'Infinity Ring',
    tagline: 'A company I founded making gymnastic rings with built-in strap storage',
    date: '2022',
    content: (
      <>
        <p>Founded and run the company Infinity Ring. Based off my personal experience using gymnastic rings, I found a solution to the problem of storing the rope between work out sessions.</p>
        <p>Project involved designing prototypes, setting up relationships with manufacturers. Generating a brand logo, name and mission. Managing finances and driving marketing forward.</p>
        <h2>Concept</h2>
        <p><Img src="/images/infinityring/infinityring1.webp" alt="Infinity Ring Project" width={1350} height={1350} /></p>
        <p>Conventional gymnastic rings come with a tedious storage problem. No matter how neatly you wrap the straps, they end up as 6 metres of tangled mess in your bag.</p>
        <p>Infinity Ring solves this. The inside of each ring is cored out to store the strap internally. A sliding external sleeve locks it in place, making packing and storing straightforward.</p>
        <h2>Design</h2>
        <p><Img src="/images/infinityring/infinityring3.webp" alt="Infinity Ring Project" width={2000} height={1182} /></p>
        <p>The product offering includes two rings, two straps with buckles and a door/tree anchor.</p>
        <p><Img src="/images/infinityring/infinityring2.webp" alt="Infinity Ring Project" width={1350} height={1350} /></p>
        <p><Img src="/images/infinityring/infinityring4.webp" alt="Infinity Ring Project" width={2000} height={1333} /></p>
        <p>One of the early prototypes. Getting the surface finish right so the plastic remained translucent took significant iteration. User testing confirmed this as a key selling point. You can see whether the ring contains rope, and it looks good.</p>
      </>
    ),
  },
  {
    slug: 'van',
    title: 'Building a Campervan',
    tagline: 'I converted a Toyota Hiace into a campervan from scratch',
    date: '2021',
    content: (
      <>
        <p>I bought an old work van and converted it from scratch. Solar electrics, cabinets, bed and a desk. The build took a month. Hardest parts were keeping the carpentry clean on a tight budget and planning the layout before committing to any cuts.</p>
        <h2>Buying a van</h2>
        <p><Img src="/images/van/van1.webp" alt="Campervan project" width={2000} height={1417} /></p>
        <p>Priorities: empty shell, reliable, cheap, big enough for surfboards but not a nightmare to park. The obvious choice is a VW T4, but a Toyota Hiace gets you the same for half the price and with a better engine.</p>
        <h2>Clean up</h2>
        <p><Img src="/images/van/van6.webp" alt="Campervan project" width={2000} height={1125} /></p>
        <p>The first step was to strip all the wooden panelling and treat any surface rust.</p>
        <h2>Design</h2>
        <p><Img src="/images/van/van2.webp" alt="Campervan project" width={2000} height={1570} /></p>
        <p>Taking measurements, I made a 3D model of the van. This allowed me to settle on a design, figure out costings and how much material needed.</p>
        <h2>Building</h2>
        <p><Img src="/images/van/van4.webp" alt="Campervan project" width={1500} height={2000} /></p>
        <p>Adding the wall panels was the most time consuming step. It takes multiple cuts to make them fit right.</p>
        <p><Img src="/images/van/van9.webp" alt="Campervan project" width={2000} height={1500} /></p>
        <p><Img src="/images/van/van10.webp" alt="Campervan project" width={2000} height={1125} /></p>
        <p><Img src="/images/van/van3.webp" alt="Campervan project" width={2000} height={1500} /></p>
        <h2>Finished Product</h2>
        <p><Img src="/images/van/van7.webp" alt="Campervan project" width={2000} height={1500} /></p>
        <p><Img src="/images/van/van11.webp" alt="Campervan project" width={2000} height={1500} /></p>
      </>
    ),
  },
  {
    slug: 'doge',
    title: 'Doge Rocket App',
    tagline: 'A Flappy Bird clone I built with SpaceX rocket physics',
    date: '2022',
    content: (
      <>
        <p>Doge Rocket is a game similar to Flappy Bird. Inspired by SpaceX rocket physics, I simulated a rocket using the same basic mechanics and built it into a game where you fly to the moon while avoiding clouds.</p>
        <h2>Design</h2>
        <p><Img src="/images/doge/doge2moon.webp" alt="Doge Rocket App" width={1660} height={1018} /></p>
        <p><Img src="/images/doge/doge2moon2.webp" alt="Doge Rocket App" width={2000} height={1024} /></p>
      </>
    ),
  },
  {
    slug: 'masks',
    title: 'Making Masks for the NHS',
    tagline: 'I 3D printed face shields for NHS staff during Covid',
    date: '2020',
    content: (
      <>
        <p>At the start of Covid-19, PPE shortages left hospital staff without basic protection. I proposed a solution to the head of my company: a small investment to procure 3D printers, adapt an existing face mask design, and run a production line.</p>
        <h2>Design</h2>
        <p><Img src="/images/masks/masks3.webp" alt="NHS Masks Project" width={2000} height={1500} /></p>
        <p>There were multiple 3D designs out there. I found <a href="https://3dverkstan.se/protective-visor/">3DVerkstan&apos;s design</a> to be the most optimal, in terms of material use and output.</p>
        <h2>Design Process</h2>
        <p><Img src="/images/masks/masks2.webp" alt="NHS Masks Project" width={2000} height={1736} /></p>
        <p>I spent days increasing output by trying different print settings. Such as print arrangements on the bed, trying to reduce unproductive nozzle movement. Thinning out the actual product design.</p>
        <p>I also added custom GCODE so the printer could automatically remove the print from the bed and start the next one. This doubled output. No human required, the printers ran all night.</p>
        <div className="video-wrap"><iframe width="100%" height="400" src="https://www.youtube.com/embed/X5QgLEhHpdw" frameBorder={0} allowFullScreen /></div>
        <p><Img src="/images/masks/masks5.webp" alt="NHS Masks Project" width={2000} height={1500} /></p>
        <p>We produced over 2000 masks, we sold 1500 to the NHS and donated 500+ to care homes.</p>
        <p><Img src="/images/masks/masks4.webp" alt="NHS Masks Project" width={2000} height={1500} /></p>
      </>
    ),
  },
  {
    slug: 'centrifuge',
    title: 'Hawksley Centrifuge Design',
    tagline: 'I designed a lab centrifuge from brief to certified prototype',
    date: '2019',
    content: (
      <>
        <p>First project after university. The brief was to analyse the centrifuge market in the small labs sector, identify key design opportunities and deliver a product.</p>
        <p>The final result was a fully working prototype with a costed bill of materials. I worked closely with manufacturers and suppliers throughout. I also identified all medical regulations required to certify the centrifuge, conducted the conformity tests in-house and produced the necessary documentation.</p>
        <h2>Renders</h2>
        <p><Img src="/images/centrifuge/render2.webp" alt="Centrifuge Design Project" width={2000} height={905} /></p>
        <p><Img src="/images/centrifuge/render1.webp" alt="Centrifuge Design Project" width={2000} height={1294} /></p>
        <h2>Design Process</h2>
        <p><Img src="/images/centrifuge/centrifugeImage.webp" alt="Centrifuge Design Project" width={1949} height={1348} /></p>
        <h2>Prototypes</h2>
        <p><Img src="/images/centrifuge/proto3.webp" alt="Centrifuge Design" width={2000} height={1500} /></p>
        <p><Img src="/images/centrifuge/proto4.webp" alt="Centrifuge Design" width={2000} height={1500} /></p>
        <p><Img src="/images/centrifuge/proto5.webp" alt="Centrifuge Design" width={1500} height={2000} /></p>
        <p><Img src="/images/centrifuge/centrifugeImage2.webp" alt="Centrifuge Design" width={1296} height={1048} /></p>
      </>
    ),
  },
  {
    slug: 'muracle',
    title: 'Automated Mural Painter',
    tagline: 'My final year project, a robot that paints murals on walls',
    date: '2019',
    content: (
      <>
        <p>Final Year Project brief: design a product that automates a task, then produce a business plan and Kickstarter video.</p>
        <p>Murals are expensive. Most people can&apos;t afford one. We wanted to build something that could paint a wall on its own, without it looking like a machine did it.</p>
        <div className="video-wrap"><iframe width="100%" height="400" src="https://www.youtube.com/embed/bsFB_Ysv0cc" frameBorder={0} allowFullScreen /></div>
        <h2>Prototypes</h2>
        <p><Img src="/images/muracle/prototype1.webp" alt="Muracle Design Project" width={2000} height={1500} /></p>
        <p><Img src="/images/muracle/prototype2.webp" alt="Muracle Design Project" width={1500} height={2000} /></p>
        <h2>Design Process</h2>
        <p><Img src="/images/muracle/MPDesignProject.webp" alt="Muracle Design Project" width={1190} height={841} /></p>
        <p><Img src="/images/muracle/MPDesignProject2.webp" alt="Muracle Design Project" width={1190} height={841} /></p>
        <p><Img src="/images/muracle/MPDesignProject3.webp" alt="Muracle Design Project" width={1190} height={841} /></p>
        <p><Img src="/images/muracle/MPDesignProject4.webp" alt="Muracle Design Project" width={1190} height={841} /></p>
        <p><Img src="/images/muracle/MPDesignProject5.webp" alt="Muracle Design Project" width={1190} height={841} /></p>
        <p><Img src="/images/muracle/MPDesignProject6.webp" alt="Muracle Design Project" width={1190} height={841} /></p>
        <p><Img src="/images/muracle/MPDesignProject7.webp" alt="Muracle Design Project" width={1190} height={841} /></p>
        <p><Img src="/images/muracle/MPDesignProject8.webp" alt="Muracle Design Project" width={1190} height={841} /></p>
        <p><Img src="/images/muracle/MPDesignProject9.webp" alt="Muracle Design Project" width={1190} height={841} /></p>
        <p><Img src="/images/muracle/MPDesignProject10.webp" alt="Muracle Design Project" width={1190} height={841} /></p>
        <p><Img src="/images/muracle/MPDesignProject11.webp" alt="Muracle Design Project" width={1190} height={841} /></p>
        <p><Img src="/images/muracle/MPDesignProject12.webp" alt="Muracle Design Project" width={1190} height={841} /></p>
        <p><Img src="/images/muracle/MPDesignProject13.webp" alt="Muracle Design Project" width={1190} height={841} /></p>
      </>
    ),
  },
  {
    slug: 'panl',
    title: 'Panl, the Frustrating Puzzle App',
    tagline: 'I taught myself Swift to build this sliding-tile puzzle app',
    date: '2019',
    content: (
      <>
        <p>Inspired by a fun board game, I taught myself Swift and the Xcode environment. I created my own version of the game with added complexity.</p>
        <h2>Design</h2>
        <p><Img src="/images/panlImage1.webp" alt="Panl App" width={1760} height={980} /></p>
        <p><Img src="/images/panlImage2.webp" alt="Panl App" width={2000} height={1109} /></p>
      </>
    ),
  },
  {
    slug: 'vacuum',
    title: 'Designing a Roomba-like Vacuum',
    tagline: 'I redesigned a Roomba in a completely different brand\'s style',
    date: '2018',
    content: (
      <>
        <p>Analyse an existing vacuum, select a brand, and redesign it in that brand&apos;s style. Easier and cheaper to manufacture, with improved functionality where possible.</p>
        <h2>Design Analysis</h2>
        <p><Img src="/images/vacuumPage1.webp" alt="Vacuum Design Project" width={1754} height={1239} /></p>
        <p><Img src="/images/vacuumPage2.webp" alt="Vacuum Design Project" width={1754} height={1239} /></p>
        <p><Img src="/images/vacuumPage3.webp" alt="Vacuum Design Project" width={1754} height={1239} /></p>
        <h2>Brand Selection</h2>
        <p><Img src="/images/vacuumPage4.webp" alt="Vacuum Design Project" width={1754} height={1239} /></p>
        <h2>Early Concept Design</h2>
        <p><Img src="/images/vacuumPage5.webp" alt="Vacuum Design Project" width={1754} height={1239} /></p>
        <p><Img src="/images/vacuumPage6.webp" alt="Vacuum Design Project" width={1754} height={1239} /></p>
        <p><Img src="/images/vacuumPage7.webp" alt="Vacuum Design Project" width={1754} height={1239} /></p>
        <h2>Design Development</h2>
        <p><Img src="/images/vacuumPage8.webp" alt="Vacuum Design Project" width={1754} height={1239} /></p>
        <p><Img src="/images/vacuumPage9.webp" alt="Vacuum Design Project" width={1754} height={1239} /></p>
        <p><Img src="/images/vacuumPage10.webp" alt="Vacuum Design Project" width={1754} height={1239} /></p>
        <p><Img src="/images/vacuumPage11.webp" alt="Vacuum Design Project" width={1754} height={1239} /></p>
        <h2>Final Design</h2>
        <p><Img src="/images/vacuumPage12.webp" alt="Vacuum Design Project" width={1754} height={1239} /></p>
        <p><Img src="/images/vacuumPage13.webp" alt="Vacuum Design Project" width={1754} height={1239} /></p>
        <p><Img src="/images/vacuumPage14.webp" alt="Vacuum Design Project" width={1754} height={1239} /></p>
      </>
    ),
  },
]

export const projectsBySlug = Object.fromEntries(projects.map(p => [p.slug, p]))
