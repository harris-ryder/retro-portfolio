import React from 'react'
import { GeistPixelSquare } from 'geist/font/pixel'
import { Img } from '@/components/Img'
import { Video } from '@/components/Video'
import { Embed } from '@/components/Embed'
import { MediaRow } from '@/components/MediaRow'
import { DemoFrame } from '@/components/workflow/DemoFrame'
import { Kbd } from '@/components/workflow/Kbd'
import { TryMeCursor } from '@/components/workflow/TryMeCursor'
import { OldPluginDemo } from '@/components/workflow/OldPluginDemo'
import { FirstVersionDemo } from '@/components/workflow/FirstVersionDemo'
import { MainDemo } from '@/components/workflow/MainDemo'
import { promptLego } from '@/data/prompt-lego'

export type Project = {
  slug: string
  title: string
  // the line under Overview in the article's side column
  tagline: string
  date: string
  // the side column's Company and Contribution lines
  company?: string
  contribution?: string
  // not listed on the home page (the article is still reachable by URL)
  hidden?: boolean
  // written but not published: not listed, and its URL is a 404
  draft?: boolean
  // the article, one section per screen
  sections: Section[]
  // rendered once alongside the sections, e.g. the Try-me cursor overlay
  extras?: React.ReactNode
}

export type Section = {
  title: string
  media?: React.ReactNode
  body?: React.ReactNode
  // nothing to add: the side column keeps the previous section's text up
  // through this one (see FrameArticle)
  keepText?: boolean
}

// a run of same-sized boards, one per section under a shared title
const boards = (title: string, pages: number[], page: (n: number) => React.ReactNode): Section[] =>
  pages.map(n => ({ title, media: page(n) }))

const vacuumPage = (n: number) => <Img src={`/images/vacuumPage${n}.webp`} alt={`Vacuum design board ${n}`} width={1754} height={1239} />
const muraclePage = (n: number) => <Img src={`/images/muracle/MPDesignProject${n === 1 ? '' : n}.webp`} alt={`Muracle design board ${n}`} width={1190} height={841} />

export const projects: Project[] = [
  {
    slug: 'nothing-ai-builder',
    title: 'Essential Apps',
    tagline: 'A ground-up rewrite of the Essential Apps interface',
    date: '2026',
    company: 'Nothing',
    contribution: 'Design, Lead front-end engineering',
    sections: [
      {
        title: 'Overview',
        // the Work index's clip of the editor
        media: <Video src="/videos/thumbs/nothing-ai-builder.mp4" width={960} height={540} />,
        body: <>
          <p>Essential Apps&apos; mission is to unlock people&apos;s freedom to create widgets customised to their needs. Using a chat interface users can describe their desired widget and deploy it to their phone.</p>
          <p>I was responsible for the re-write of the web client, which took four weeks. I worked on this solely, collaborating with a designer.</p>
        </>,
      },
      {
        title: 'Mobile',
        media: (
          <MediaRow labels={['Before', 'After']}>
            <Video src="/videos/nothing-ai-builder/old-mobile-flow.mp4" width={1080} height={2114} />
            <Video src="/videos/nothing-ai-builder/web-mobile-flow.mp4" width={1080} height={2114} />
          </MediaRow>
        ),
        body: <>
          <p>The rewrite improved the mobile web experience, with better contrast and a smoother overall UX.</p>
        </>,
      },
      {
        title: 'Deploy flow',
        media: (
          <MediaRow labels={['Before', 'After']} stack>
            <Video src="/videos/nothing-ai-builder/old-deploy-flow.mp4" width={1920} height={1222} />
            <Video src="/videos/nothing-ai-builder/new-deploy-flow.mp4" width={1920} height={1440} />
          </MediaRow>
        ),
        body: <>
          <p>Deploying an app triggers compiling the code and deploying it to mobile.</p>
          <p>The original ran four screens in sequence, including build logs that meant nothing to a non-technical user, and averaged 40 seconds.</p>
          <p>After the rewrite the flow compiles in the background while the user names the widget, cutting that to two screens and 12 seconds.</p>
        </>,
      },
      {
        title: 'Widget size',
        media: <Video src="/videos/nothing-ai-builder/size-prompt.mp4" width={1882} height={1358} />,
        body: <>
          <p>The app offered two sizes, square and landscape, but the choice was hidden in the message input as an ambiguous toggle. Feedback showed users assumed the only option was square.</p>
          <p>The rewrite makes it an explicit selection on the first prompt, bringing intentionality to the widget&apos;s design from the start.</p>
        </>,
      },
      {
        title: 'Resizing',
        media: <Video src="/videos/nothing-ai-builder/new-resize-flow.mp4" width={1920} height={1270} />,
        body: <p>Change the size after the widget exists and the agent re-optimises for the new grid, rewriting the layout rather than squashing the old one into it.</p>,
      },
      {
        title: 'Version history',
        media: (
          <MediaRow labels={['Before', 'After']} stack>
            <Video src="/videos/nothing-ai-builder/old-restore-flow.mp4" width={1920} height={1254} />
            <Video src="/videos/nothing-ai-builder/new-restore-flow.mp4" width={1920} height={1268} />
          </MediaRow>
        ),
        body: <>
          <p>Every prompt creates a new version of the widget, and any earlier version can be restored. Before, the Restore button read as Preview to many users, and what restoring actually did was neither clear in the UI nor explained.</p>
          <p>After, a dropdown makes the two choices explicit, Preview and Restore. Choosing Restore opens a dialog with a simple animation that shows how a restore works before the user commits.</p>
        </>,
      },
      {
        title: 'Gallery',
        media: <Video src="/videos/nothing-ai-builder/gallery-view.mp4" width={1888} height={1152} />,
        body: <p>The rewrite fetches only what fits on screen, shows skeleton cards on slow connections, and uses optimistic updates for rename and delete. Fully keyboard-navigable with semantic HTML throughout.</p>,
      },
      {
        title: 'Fun',
        media: (
          <MediaRow>
            <Video src="/videos/nothing-ai-builder/tetris-fun.mp4" width={1080} height={2400} />
            <Img src="/images/nothing-ai-builder/widgets.webp" alt="Windows 98 themed widgets on device" width={900} height={2000} />
          </MediaRow>
        ),
        body: <p>Some fun widgets made along the way.</p>,
      },
    ],
  },
  promptLego,
  {
    slug: 'essential-search',
    title: 'Essential Search',
    tagline: 'The swipe-up search that shipped with Phone (3)',
    date: '2025',
    company: 'Nothing',
    contribution: 'Backend optimisation, User research',
    sections: [
      {
        title: 'Overview',
        // the feature film, 1080p without its sound
        media: <Video src="/videos/essential-search/essential-search.mp4" width={1920} height={1080} />,
        body: <>
          <p>Essential Search shipped with Phone (3) in 2025. Swipe up on the home screen and one field searches for anything, answering in the Nothing style.</p>
          <p>It is on <a href="https://play.google.com/store/apps/details?id=com.nothing.essential.search&hl=en_GB" target="_blank" rel="noopener noreferrer" className={GeistPixelSquare.className}>Google Play</a>.</p>
        </>,
      },
    ],
  },
  {
    slug: 'playground',
    title: 'Playground',
    tagline: 'Nothing’s community site for making and sharing widgets',
    date: '2025',
    company: 'Nothing',
    contribution: 'Front-end engineering',
    sections: [
      {
        title: 'Overview',
        // 33s to 55s of the launch film, Introducing Playground (October 2025),
        // at 1080p without its sound
        media: <Video src="/videos/playground/introducing-playground.mp4" width={1920} height={1080} />,
        body: <>
          <p>Playground is where the Nothing community comes together to create. Widgets and Glyph Toys are made in the browser, then shared for everyone else to use and play with.</p>
          <p>It is live at <a href="https://playground.nothing.tech/" target="_blank" rel="noopener noreferrer" className={GeistPixelSquare.className}>playground.nothing.tech</a>.</p>
        </>,
      },
      {
        title: 'Key art',
        media: <Img src="/images/thumbs/essential-apps.webp" alt="Playground key art, a collage of pink, green and blue textures with PLAYGROUND across it in dot-matrix type" width={1200} height={800} />,
        keepText: true,
      },
    ],
  },
  {
    slug: 'modelnote',
    title: 'ModelNote',
    tagline: 'A review tool for feedback on 3D models',
    date: '2024',
    company: 'ModelNote',
    contribution: 'Creator',
    sections: [
      {
        title: 'Overview',
        // a screen recording of the app, cropped to its window, 1920 wide
        media: <Video src="/videos/modelnote/modelnote.mp4" width={1920} height={1184} />,
        body: <>
          <p>ModelNote is a 3D annotation app. Upload a model and reviewers leave comments pinned to it, with sketches drawn over the view and images attached. I founded it and built it together with <a href="https://x.com/florianherrengt" target="_blank" rel="noopener noreferrer" className={GeistPixelSquare.className}>Florian Herrengt</a>. I did the design and full-stack development.</p>
          <p>It is live at <a href="https://modelnote.io/" target="_blank" rel="noopener noreferrer" className={GeistPixelSquare.className}>modelnote.io</a>.</p>
        </>,
      },
    ],
  },
  {
    slug: 'apiject',
    title: 'Apiject',
    tagline: 'A prefilled, single-dose injector',
    date: '2023',
    company: 'Apiject',
    contribution: 'Creative Technologist',
    sections: [
      {
        title: 'Overview',
        // 14s to 19s of Apiject's film of the injector being assembled, without its sound
        media: <Video src="/videos/apiject/assembly.mp4" width={1920} height={1080} />,
        body: <>
          <p>Apiject is a medical technology company developing a prefilled, single-dose injector. I am a named inventor on four patents from my time there.</p>
          <p>More at <a href="https://apiject.com/" target="_blank" rel="noopener noreferrer" className={GeistPixelSquare.className}>apiject.com</a>.</p>
        </>,
      },
      {
        title: 'Patents',
        // the front pages of two of the patents, from the WIPO publications
        media: (
          <MediaRow>
            <Img src="/images/apiject/patent-wo2022053948.webp" alt="Front page of international patent publication WO 2022/053948, Pre-filled multi-fluid medical delivery assemblies" width={1000} height={1415} />
            <Img src="/images/apiject/patent-wo2022180488.webp" alt="Front page of international patent publication WO 2022/180488, Pre-filled multi-fluid medical delivery assemblies" width={1000} height={1415} />
          </MediaRow>
        ),
        keepText: true,
      },
    ],
  },
  {
    slug: 'workflow-figma-plugin',
    title: 'Workflow Figma Plugin',
    tagline: 'The Figma plugin that pushed design files into the Workflow app',
    date: '2025',
    company: 'Workflow',
    contribution: 'Product owner, design, full stack',
    extras: <TryMeCursor />,
    sections: [
      {
        title: 'Overview',
        media: <Video src="/videos/workflow/figma-flow.mp4" width={1280} height={800} />,
        body: <>
          <p>
            <a href="https://www.workflow.design/" target="_blank" rel="noopener noreferrer" className="!no-underline">Workflow</a>{' '}is an app for managing creative assets, including Figma files. Its Figma plugin lets users select work and upload it to the main app.
          </p>
          <p>
            I was responsible for building the Figma plugin, including its login and upload flows. That covered the design and full-stack development.
          </p>
          <p>
            This piece covers the challenges of improving the upload flow, which needs the file&apos;s Figma link passed into the plugin.
          </p>
          <p>
            The plugin is on the <a href="https://www.figma.com/community/plugin/1194400816695978796/workflow" target="_blank" rel="noopener noreferrer" className={GeistPixelSquare.className}>Figma Community</a>.
          </p>
        </>,
      },
      {
        title: 'The original version',
        media: (
          <DemoFrame designWidth={712} designHeight={620}>
            <OldPluginDemo />
          </DemoFrame>
        ),
        body: <>
          <p>
            The initial version asked for the link outright. A looping walkthrough gif showed how to open Figma&apos;s Share menu, copy the file link and paste it into a field.
          </p>
          <p>
            This step created real friction, and it was where we lost the most users.
          </p>
        </>,
      },
      {
        title: 'The first solution',
        media: (
          <DemoFrame designWidth={712} designHeight={620}>
            <FirstVersionDemo />
          </DemoFrame>
        ),
        body: <>
          <p>
            Then we discovered <Kbd keys={['⌘', 'L']} />, which copies the file&apos;s link to the user&apos;s clipboard. That meant we could drop the Share menu walkthrough and ask for a single keystroke instead.
          </p>
          <p>
            The plugin watched the clipboard through the browser&apos;s clipboard API and saved the link the moment a Figma URL appeared. One keystroke, no menus, no pasting.
          </p>
        </>,
      },
      {
        title: 'The second solution',
        media: (
          <DemoFrame designWidth={712} designHeight={620}>
            <MainDemo />
          </DemoFrame>
        ),
        body: <>
          <p>
            Then Figma blocked plugins from reading the clipboard, and the seamless version stopped working. So we brought a paste back into the flow. Pressing <Kbd keys={['⌘', 'V']} /> dropped the link into a hidden input the plugin could read.
          </p>
          <p>
            That raised a problem. Before, the plugin knew the user had pressed <Kbd keys={['⌘', 'L']} /> because it saw the link land in the clipboard. Now it was blind, with no way to tell whether a link had been copied at all.
          </p>
          <p>
            It couldn&apos;t simply listen for <Kbd keys={['⌘', 'L']} /> either. Once <Kbd keys={['⌘']} /> is held, Figma stops passing keystrokes to the plugin, so it never sees the <Kbd keys={['L']} />.
          </p>
          <p>
            The fix was to flip the order. The plugin asks the user to hold <Kbd keys={['L']} /> first, which it can see, then press <Kbd keys={['⌘']} />. That lets it check each key as it lands, confirm the shortcut ran, and know the user is ready for the final <Kbd keys={['⌘', 'V']} />.
          </p>
        </>,
      },
    ],
  },
  {
    slug: 'paintball',
    title: 'Automated Paintball Gun',
    tagline: 'I built a motorised turret that paints with a paintball gun',
    date: '2023',
    hidden: true,
    sections: [
      {
        title: 'Concept design',
        media: <Img src="/images/paintball/paintball1.webp" alt="Paint ball Project" width={1596} height={902} />,
        body: <>
          <p>I wanted to know if a machine could make decent paintball art. So I bought a cheap gun, built a turret out of spare parts and stepper motors, and tried to make it accurate enough to find out.</p>
          <p>The gun is made entirely from 3D printed parts (excluding bearings, motors, etc). Much of the design was split into sections due to print bed size limits. Blue/orange parts are 3D printed, teal is electronics.</p>
        </>,
      },
      {
        title: 'Concept design',
        media: (
          <MediaRow stack>
            <Img src="/images/paintball/paintball3.webp" alt="Paint ball Project" width={1950} height={1186} />
            <Img src="/images/paintball/paintball2.webp" alt="Paint ball Project" width={1632} height={1108} />
          </MediaRow>
        ),
        body: <>
          <p>Key features:</p>
          <ol>
            <li>Vertical axis motor mount runs on a pulley system with a gear ratio of 150:10.</li>
            <li>Horizontal axis motor mount uses the same pulley system.</li>
            <li>Three motor controllers and an Arduino. Two motors for motion, one to pull the trigger.</li>
            <li>Vertical axis limit switch lets the turret home itself.</li>
            <li>Laser pointer adaptor is a quick-fit attachment to verify aim before a real print.</li>
          </ol>
        </>,
      },
      {
        title: 'Trigger assembly',
        media: <Img src="/images/paintball/paintball4.webp" alt="Paint ball Project" width={1488} height={972} />,
        body: <>
          <p>The first sub-assembly. Rather than bypassing the trigger with an electronically controlled air valve, I used a stepper motor driving a lead screw to pull it mechanically.</p>
          <p>The two grey rings are bearings. Oversized for this application, but they add stability.</p>
        </>,
      },
      {
        title: 'Actual design',
        media: <Img src="/images/paintball/paintball5.webp" alt="Paint ball Project" width={1852} height={1378} />,
      },
      {
        title: 'Actual design',
        media: (
          <MediaRow stack>
            <Img src="/images/paintball/paintball6.webp" alt="Paint ball Project" width={2000} height={1406} />
            <Img src="/images/paintball/paintball7.webp" alt="Paint ball Project" width={1858} height={1384} />
          </MediaRow>
        ),
      },
      {
        title: 'Software',
        body: <>
          <p>Software was written using the Arduino language. The logic is straightforward. Inputs:</p>
          <ol>
            <li>Canvas height</li>
            <li>Canvas width</li>
            <li>Turrets x position from the bottom left corner of the Canvas</li>
            <li>Turrets y position from the bottom left corner of the Canvas</li>
          </ol>
          <p>This input then allows me to compute for a given x,z coordinate on the canvas what angle change is needed by the turret to aim.</p>
          <p>The resolution is determined by the smallest angle the turret can turn (vertically and horizontally). The gear ratio between the motor cog and the large cog is 150:10. Using the stepper drivers I am microstepping by 1/16, which gives 48,000 steps per full turret rotation, giving a resolution of 0.0075 degrees per step.</p>
        </>,
      },
      {
        title: 'Trigger test',
        media: <Embed src="https://www.youtube.com/embed/OoE_Ep4ovDs" title="Testing the trigger system" />,
        body: <p>Testing the trigger system</p>,
      },
      {
        title: 'Movement test',
        media: <Embed src="https://www.youtube.com/embed/3OJhmOg1Wus" title="Testing the movement system" />,
        body: <p>Testing the movement system</p>,
      },
    ],
  },
  {
    slug: 'infinity',
    title: 'Infinity Ring',
    tagline: 'A company I founded making gymnastic rings with built-in strap storage',
    date: '2022',
    hidden: true,
    sections: [
      {
        title: 'Concept',
        media: <Img src="/images/infinityring/infinityring1.webp" alt="Infinity Ring Project" width={1350} height={1350} />,
        body: <>
          <p>Founded and run the company Infinity Ring. Based off my personal experience using gymnastic rings, I found a solution to the problem of storing the rope between work out sessions.</p>
          <p>Project involved designing prototypes, setting up relationships with manufacturers. Generating a brand logo, name and mission. Managing finances and driving marketing forward.</p>
          <p>Conventional gymnastic rings come with a tedious storage problem. No matter how neatly you wrap the straps, they end up as 6 metres of tangled mess in your bag.</p>
          <p>Infinity Ring solves this. The inside of each ring is cored out to store the strap internally. A sliding external sleeve locks it in place, making packing and storing straightforward.</p>
        </>,
      },
      {
        title: 'Design',
        media: <Img src="/images/infinityring/infinityring3.webp" alt="Infinity Ring Project" width={2000} height={1182} />,
        body: <p>The product offering includes two rings, two straps with buckles and a door/tree anchor.</p>,
      },
      {
        title: 'Prototype',
        media: (
          <MediaRow stack>
            <Img src="/images/infinityring/infinityring2.webp" alt="Infinity Ring Project" width={1350} height={1350} />
            <Img src="/images/infinityring/infinityring4.webp" alt="Infinity Ring Project" width={2000} height={1333} />
          </MediaRow>
        ),
        body: <p>One of the early prototypes. Getting the surface finish right so the plastic remained translucent took significant iteration. User testing confirmed this as a key selling point. You can see whether the ring contains rope, and it looks good.</p>,
      },
    ],
  },
  {
    slug: 'van',
    title: 'Building a Campervan',
    tagline: 'I converted a Toyota Hiace into a campervan from scratch',
    date: '2021',
    hidden: true,
    sections: [
      {
        title: 'Buying a van',
        media: <Img src="/images/van/van1.webp" alt="Campervan project" width={2000} height={1417} />,
        body: <>
          <p>I bought an old work van and converted it from scratch. Solar electrics, cabinets, bed and a desk. The build took a month. Hardest parts were keeping the carpentry clean on a tight budget and planning the layout before committing to any cuts.</p>
          <p>Priorities: empty shell, reliable, cheap, big enough for surfboards but not a nightmare to park. The obvious choice is a VW T4, but a Toyota Hiace gets you the same for half the price and with a better engine.</p>
        </>,
      },
      {
        title: 'Clean up',
        media: <Img src="/images/van/van6.webp" alt="Campervan project" width={2000} height={1125} />,
        body: <p>The first step was to strip all the wooden panelling and treat any surface rust.</p>,
      },
      {
        title: 'Design',
        media: <Img src="/images/van/van2.webp" alt="Campervan project" width={2000} height={1570} />,
        body: <p>Taking measurements, I made a 3D model of the van. This allowed me to settle on a design, figure out costings and how much material needed.</p>,
      },
      {
        title: 'Building',
        media: <Img src="/images/van/van4.webp" alt="Campervan project" width={1500} height={2000} />,
        body: <p>Adding the wall panels was the most time consuming step. It takes multiple cuts to make them fit right.</p>,
      },
      {
        title: 'Building',
        media: (
          <MediaRow stack>
            <Img src="/images/van/van9.webp" alt="Campervan project" width={2000} height={1500} />
            <Img src="/images/van/van10.webp" alt="Campervan project" width={2000} height={1125} />
          </MediaRow>
        ),
      },
      {
        title: 'Building',
        media: <Img src="/images/van/van3.webp" alt="Campervan project" width={2000} height={1500} />,
      },
      {
        title: 'Finished product',
        media: (
          <MediaRow stack>
            <Img src="/images/van/van7.webp" alt="Campervan project" width={2000} height={1500} />
            <Img src="/images/van/van11.webp" alt="Campervan project" width={2000} height={1500} />
          </MediaRow>
        ),
      },
    ],
  },
  {
    slug: 'doge',
    title: 'Doge Rocket App',
    tagline: 'A Flappy Bird clone I built with SpaceX rocket physics',
    date: '2022',
    hidden: true,
    sections: [
      {
        title: 'Design',
        media: <Img src="/images/doge/doge2moon.webp" alt="Doge Rocket App" width={1660} height={1018} />,
        body: <p>Doge Rocket is a game similar to Flappy Bird. Inspired by SpaceX rocket physics, I simulated a rocket using the same basic mechanics and built it into a game where you fly to the moon while avoiding clouds.</p>,
      },
      {
        title: 'Design',
        media: <Img src="/images/doge/doge2moon2.webp" alt="Doge Rocket App" width={2000} height={1024} />,
      },
    ],
  },
  {
    slug: 'masks',
    title: 'Making Masks for the NHS',
    tagline: 'I 3D printed face shields for NHS staff during Covid',
    date: '2020',
    hidden: true,
    sections: [
      {
        title: 'Design',
        media: <Img src="/images/masks/masks3.webp" alt="NHS Masks Project" width={2000} height={1500} />,
        body: <>
          <p>At the start of Covid-19, PPE shortages left hospital staff without basic protection. I proposed a solution to the head of my company: a small investment to procure 3D printers, adapt an existing face mask design, and run a production line.</p>
          <p>There were multiple 3D designs out there. I found <a href="https://3dverkstan.se/protective-visor/">3DVerkstan&apos;s design</a> to be the most optimal, in terms of material use and output.</p>
        </>,
      },
      {
        title: 'Design process',
        media: <Img src="/images/masks/masks2.webp" alt="NHS Masks Project" width={2000} height={1736} />,
        body: <p>I spent days increasing output by trying different print settings. Such as print arrangements on the bed, trying to reduce unproductive nozzle movement. Thinning out the actual product design.</p>,
      },
      {
        title: 'Automatic removal',
        media: <Embed src="https://www.youtube.com/embed/X5QgLEhHpdw" title="Printers removing finished masks automatically" />,
        body: <p>I also added custom GCODE so the printer could automatically remove the print from the bed and start the next one. This doubled output. No human required, the printers ran all night.</p>,
      },
      {
        title: 'Production',
        media: (
          <MediaRow stack>
            <Img src="/images/masks/masks5.webp" alt="NHS Masks Project" width={2000} height={1500} />
            <Img src="/images/masks/masks4.webp" alt="NHS Masks Project" width={2000} height={1500} />
          </MediaRow>
        ),
        body: <p>We produced over 2000 masks, we sold 1500 to the NHS and donated 500+ to care homes.</p>,
      },
    ],
  },
  {
    slug: 'centrifuge',
    title: 'Hawksley Centrifuge Design',
    tagline: 'I designed a lab centrifuge from brief to certified prototype',
    date: '2019',
    hidden: true,
    sections: [
      {
        title: 'Renders',
        media: <Img src="/images/centrifuge/render2.webp" alt="Centrifuge Design Project" width={2000} height={905} />,
        body: <>
          <p>First project after university. The brief was to analyse the centrifuge market in the small labs sector, identify key design opportunities and deliver a product.</p>
          <p>The final result was a fully working prototype with a costed bill of materials. I worked closely with manufacturers and suppliers throughout. I also identified all medical regulations required to certify the centrifuge, conducted the conformity tests in-house and produced the necessary documentation.</p>
        </>,
      },
      {
        title: 'Renders',
        media: <Img src="/images/centrifuge/render1.webp" alt="Centrifuge Design Project" width={2000} height={1294} />,
      },
      {
        title: 'Design process',
        media: <Img src="/images/centrifuge/centrifugeImage.webp" alt="Centrifuge Design Project" width={1949} height={1348} />,
      },
      {
        title: 'Prototypes',
        media: (
          <MediaRow stack>
            <Img src="/images/centrifuge/proto3.webp" alt="Centrifuge Design" width={2000} height={1500} />
            <Img src="/images/centrifuge/proto4.webp" alt="Centrifuge Design" width={2000} height={1500} />
          </MediaRow>
        ),
      },
      {
        title: 'Prototypes',
        media: (
          <MediaRow stack>
            <Img src="/images/centrifuge/proto5.webp" alt="Centrifuge Design" width={1500} height={2000} />
            <Img src="/images/centrifuge/centrifugeImage2.webp" alt="Centrifuge Design" width={1296} height={1048} />
          </MediaRow>
        ),
      },
    ],
  },
  {
    slug: 'muracle',
    title: 'Automated Mural Painter',
    tagline: 'My final year project, a robot that paints murals on walls',
    date: '2019',
    hidden: true,
    sections: [
      {
        title: 'Kickstarter video',
        media: <Embed src="https://www.youtube.com/embed/bsFB_Ysv0cc" title="Muracle Kickstarter video" />,
        body: <>
          <p>Final Year Project brief: design a product that automates a task, then produce a business plan and Kickstarter video.</p>
          <p>Murals are expensive. Most people can&apos;t afford one. We wanted to build something that could paint a wall on its own, without it looking like a machine did it.</p>
        </>,
      },
      {
        title: 'Prototypes',
        media: (
          <MediaRow stack>
            <Img src="/images/muracle/prototype1.webp" alt="Muracle Design Project" width={2000} height={1500} />
            <Img src="/images/muracle/prototype2.webp" alt="Muracle Design Project" width={1500} height={2000} />
          </MediaRow>
        ),
      },
      ...boards('Design process', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], muraclePage),
    ],
  },
  {
    slug: 'panl',
    title: 'Panl, the Frustrating Puzzle App',
    tagline: 'I taught myself Swift to build this sliding-tile puzzle app',
    date: '2019',
    hidden: true,
    sections: [
      {
        title: 'Design',
        media: <Img src="/images/panlImage1.webp" alt="Panl App" width={1760} height={980} />,
        body: <p>Inspired by a fun board game, I taught myself Swift and the Xcode environment. I created my own version of the game with added complexity.</p>,
      },
      {
        title: 'Design',
        media: <Img src="/images/panlImage2.webp" alt="Panl App" width={2000} height={1109} />,
      },
    ],
  },
  {
    slug: 'vacuum',
    title: 'Designing a Roomba-like Vacuum',
    tagline: 'I redesigned a Roomba in a completely different brand\'s style',
    date: '2018',
    hidden: true,
    sections: [
      {
        title: 'Design analysis',
        media: vacuumPage(1),
        body: <p>Analyse an existing vacuum, select a brand, and redesign it in that brand&apos;s style. Easier and cheaper to manufacture, with improved functionality where possible.</p>,
      },
      ...boards('Design analysis', [2, 3], vacuumPage),
      ...boards('Brand selection', [4], vacuumPage),
      ...boards('Early concept design', [5, 6, 7], vacuumPage),
      ...boards('Design development', [8, 9, 10, 11], vacuumPage),
      ...boards('Final design', [12, 13, 14], vacuumPage),
    ],
  },
]

export const projectsBySlug = Object.fromEntries(projects.map(p => [p.slug, p]))
