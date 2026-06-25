import React from 'react'

export type Project = {
  slug: string
  title: string
  tagline: string
  date: string
  hidden?: boolean
  content: React.ReactNode
}

const videoStyle = {
  border: '1px solid rgba(50,50,50,0.12)',
  boxShadow: '0 4px 12px -2px #0000000d, 0 1px 3px 0 #00000008',
  display: 'block',
  marginTop: '3.5rem',
  marginBottom: '3.5rem',
  borderRadius: '12px',
  width: '100%',
}

export const projects: Project[] = [
  {
    slug: 'nothing-ai-builder',
    title: 'Nothing Gen UI',
    hidden: true,
    tagline: 'A ground-up rewrite of the Gen UI product at Nothing',
    date: '2026',
    content: (
      <>
        <p>Nothing&apos;s Gen UI lets non-technical users create and deploy AI-powered phone widgets. The original shipped with the core loop working but a lot of rough edges. My team was tasked with rebuilding the entire app in 2 weeks. I had sole responsibility for the frontend.</p>

        <h2>Gallery</h2>
        <p>The old gallery fetched the full list at once with no pagination or virtualisation. The rewrite fetches only what fits on screen, shows skeleton cards on slow connections, and uses optimistic updates for rename and delete. Fully keyboard-navigable with semantic HTML throughout.</p>
        <video src="/videos/nothing-ai-builder/gallery-view.mp4" autoPlay muted loop playsInline style={videoStyle} />

        <h2>Deploy Flow</h2>
        <p>Once happy with the preview you can deploy the widget to your phone. The backend compiles the React Native code into a real app that lives in the widget drawer.</p>
        <p>The old flow surfaced every AWS log line, noise that means nothing to the user. The new flow hides those logs and starts the build the moment the modal opens, so by the time the user fills in the name and description it is already done.</p>
        <video src="/videos/nothing-ai-builder/old-deploy-flow.mp4" autoPlay muted loop playsInline style={videoStyle} />
        <video src="/videos/nothing-ai-builder/new-deploy-flow.mp4" autoPlay muted loop playsInline style={videoStyle} />

        <h2>Mobile</h2>
        <p>The original app prioritised desktop, which made little sense for a phone company. Mobile also exposed a lot of broken styles. Without shared tokens, ad-hoc component styling compounded into inconsistencies across every screen size. The rewrite enforces a token-based system with Storybook used to catch regressions before they ship.</p>
        <p>On mobile the editor switches between chat, code, and preview via a tab toggle, the deploy flow becomes a bottom drawer, and navigation collapses into a mobile-specific component.</p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '3.5rem', marginBottom: '3.5rem' }}>
          <video src="/videos/nothing-ai-builder/old-mobile-flow.mp4" autoPlay muted loop playsInline style={{ ...videoStyle, marginTop: 0, marginBottom: 0, flex: 1, minWidth: 0 }} />
          <video src="/videos/nothing-ai-builder/web-mobile-flow.mp4" autoPlay muted loop playsInline style={{ ...videoStyle, marginTop: 0, marginBottom: 0, flex: 1, minWidth: 0 }} />
        </div>

        <h2>Preview Architecture</h2>
        <p>The widget preview runs inside an iframe so a broken widget can&apos;t crash the editor. In the original that iframe had its own backend connection and state, which could drift out of sync with the parent silently. The rewrite makes the main app the single owner of state. The iframe&apos;s only job is to receive files via postMessage, bundle them, and report back.</p>

        <h2>Engineering</h2>
        <p>The original mixed Tailwind, inline styles, and one-off CSS in the same components. The rewrite uses Tailwind exclusively with design tokens for colour and typography. ESLint bans any, so every prop and API response is fully typed. useEffect was replaced almost entirely with TanStack Query, keeping data in the cache rather than spread across component state. Components are organised by feature, so each area of the app owns its own hooks and utils.</p>

        <h2>Widget Size</h2>
        <p>The agent optimises the widget for a specific size, so the wrong choice produces broken layouts on device. The old dropdown was easy to miss and gave no visual cue of what each option meant. The rewrite surfaces the choice explicitly with a visual of each size, and shows a dialog if you change it after the widget is built. Responsive design is not enough, the agent needs to rebuild for the new dimensions.</p>
        <video src="/videos/nothing-ai-builder/size-prompt.mp4" autoPlay muted loop playsInline style={videoStyle} />

        <h2>Fun</h2>
        <p>Some fun widgets made along the way.</p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '3.5rem', marginBottom: '3.5rem' }}>
          <video src="/videos/nothing-ai-builder/tetris-fun.mp4" autoPlay muted loop playsInline style={{ ...videoStyle, marginTop: 0, marginBottom: 0, flex: 1, minWidth: 0 }} />
          <img src="/images/nothing-ai-builder/widgets.jpg" alt="Windows 98 themed widgets on device" style={{ ...videoStyle, marginTop: 0, marginBottom: 0, flex: 1, minWidth: 0, objectFit: 'cover' }} />
        </div>
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
        <p><img src="/images/paintball/paintball1.png" alt="Paint ball Project" /></p>
        <p><img src="/images/paintball/paintball3.png" alt="Paint ball Project" /></p>
        <p><img src="/images/paintball/paintball2.png" alt="Paint ball Project" /></p>
        <p>The gun is made entirely from 3D printed parts (excluding bearings, motors, etc). Much of the design was split into sections due to print bed size limits. Blue/orange parts are 3D printed, teal is electronics.</p>
        <p>Key features:</p>
        <ol>
          <li>Vertical axis motor mount runs on a pulley system with a gear ratio of 150:10.</li>
          <li>Horizontal axis motor mount uses the same pulley system.</li>
          <li>Three motor controllers and an Arduino. Two motors for motion, one to pull the trigger.</li>
          <li>Vertical axis limit switch lets the turret home itself.</li>
          <li>Laser pointer adaptor is a quick-fit attachment to verify aim before a real print.</li>
        </ol>
        <p><img src="/images/paintball/paintball4.png" alt="Paint ball Project" /></p>
        <p>The first sub-assembly. Rather than bypassing the trigger with an electronically controlled air valve, I used a stepper motor driving a lead screw to pull it mechanically.</p>
        <p>The two grey rings are bearings. Oversized for this application, but they add stability.</p>
        <h2>Actual Design</h2>
        <p><img src="/images/paintball/paintball5.png" alt="Paint ball Project" /></p>
        <p><img src="/images/paintball/paintball6.png" alt="Paint ball Project" /></p>
        <p><img src="/images/paintball/paintball7.png" alt="Paint ball Project" /></p>
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
        <p><img src="/images/infinityring/infinityring1.png" alt="Infinity Ring Project" /></p>
        <p>Conventional gymnastic rings come with a tedious storage problem. No matter how neatly you wrap the straps, they end up as 6 metres of tangled mess in your bag.</p>
        <p>Infinity Ring solves this. The inside of each ring is cored out to store the strap internally. A sliding external sleeve locks it in place, making packing and storing straightforward.</p>
        <h2>Design</h2>
        <p><img src="/images/infinityring/infinityring3.jpg" alt="Infinity Ring Project" /></p>
        <p>The product offering includes two rings, two straps with buckles and a door/tree anchor.</p>
        <p><img src="/images/infinityring/infinityring2.png" alt="Infinity Ring Project" /></p>
        <p><img src="/images/infinityring/infinityring4.jpg" alt="Infinity Ring Project" /></p>
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
        <p><img src="/images/van/van1.png" alt="Campervan project" /></p>
        <p>Priorities: empty shell, reliable, cheap, big enough for surfboards but not a nightmare to park. The obvious choice is a VW T4, but a Toyota Hiace gets you the same for half the price and with a better engine.</p>
        <h2>Clean up</h2>
        <p><img src="/images/van/van6.png" alt="Campervan project" /></p>
        <p>The first step was to strip all the wooden panelling and treat any surface rust.</p>
        <h2>Design</h2>
        <p><img src="/images/van/van2.png" alt="Campervan project" /></p>
        <p>Taking measurements, I made a 3D model of the van. This allowed me to settle on a design, figure out costings and how much material needed.</p>
        <h2>Building</h2>
        <p><img src="/images/van/van4.png" alt="Campervan project" /></p>
        <p>Adding the wall panels was the most time consuming step. It takes multiple cuts to make them fit right.</p>
        <p><img src="/images/van/van9.png" alt="Campervan project" /></p>
        <p><img src="/images/van/van10.png" alt="Campervan project" /></p>
        <p><img src="/images/van/van3.png" alt="Campervan project" /></p>
        <h2>Finished Product</h2>
        <p><img src="/images/van/van7.png" alt="Campervan project" /></p>
        <p><img src="/images/van/van11.png" alt="Campervan project" /></p>
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
        <p><img src="/images/doge/doge2moon.png" alt="Doge Rocket App" /></p>
        <p><img src="/images/doge/doge2moon2.png" alt="Doge Rocket App" /></p>
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
        <p><img src="/images/masks/masks3.png" alt="NHS Masks Project" /></p>
        <p>There were multiple 3D designs out there. I found <a href="https://3dverkstan.se/protective-visor/">3DVerkstan&apos;s design</a> to be the most optimal, in terms of material use and output.</p>
        <h2>Design Process</h2>
        <p><img src="/images/masks/masks2.png" alt="NHS Masks Project" /></p>
        <p>I spent days increasing output by trying different print settings. Such as print arrangements on the bed, trying to reduce unproductive nozzle movement. Thinning out the actual product design.</p>
        <p>I also added custom GCODE so the printer could automatically remove the print from the bed and start the next one. This doubled output. No human required, the printers ran all night.</p>
        <div className="video-wrap"><iframe width="100%" height="400" src="https://www.youtube.com/embed/X5QgLEhHpdw" frameBorder={0} allowFullScreen /></div>
        <p><img src="/images/masks/masks5.png" alt="NHS Masks Project" /></p>
        <p>We produced over 2000 masks, we sold 1500 to the NHS and donated 500+ to care homes.</p>
        <p><img src="/images/masks/masks4.png" alt="NHS Masks Project" /></p>
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
        <p><img src="/images/centrifuge/render2.png" alt="Centrifuge Design Project" /></p>
        <p><img src="/images/centrifuge/render1.png" alt="Centrifuge Design Project" /></p>
        <h2>Design Process</h2>
        <p><img src="/images/centrifuge/centrifugeImage.png" alt="Centrifuge Design Project" /></p>
        <h2>Prototypes</h2>
        <p><img src="/images/centrifuge/proto3.png" alt="Centrifuge Design" /></p>
        <p><img src="/images/centrifuge/proto4.png" alt="Centrifuge Design" /></p>
        <p><img src="/images/centrifuge/proto5.png" alt="Centrifuge Design" /></p>
        <p><img src="/images/centrifuge/centrifugeImage2.png" alt="Centrifuge Design" /></p>
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
        <p><img src="/images/muracle/prototype1.png" alt="Muracle Design Project" /></p>
        <p><img src="/images/muracle/prototype2.png" alt="Muracle Design Project" /></p>
        <h2>Design Process</h2>
        <p><img src="/images/muracle/MPDesignProject.png" alt="Muracle Design Project" /></p>
        <p><img src="/images/muracle/MPDesignProject2.png" alt="Muracle Design Project" /></p>
        <p><img src="/images/muracle/MPDesignProject3.png" alt="Muracle Design Project" /></p>
        <p><img src="/images/muracle/MPDesignProject4.png" alt="Muracle Design Project" /></p>
        <p><img src="/images/muracle/MPDesignProject5.png" alt="Muracle Design Project" /></p>
        <p><img src="/images/muracle/MPDesignProject6.png" alt="Muracle Design Project" /></p>
        <p><img src="/images/muracle/MPDesignProject7.png" alt="Muracle Design Project" /></p>
        <p><img src="/images/muracle/MPDesignProject8.png" alt="Muracle Design Project" /></p>
        <p><img src="/images/muracle/MPDesignProject9.png" alt="Muracle Design Project" /></p>
        <p><img src="/images/muracle/MPDesignProject10.png" alt="Muracle Design Project" /></p>
        <p><img src="/images/muracle/MPDesignProject11.png" alt="Muracle Design Project" /></p>
        <p><img src="/images/muracle/MPDesignProject12.png" alt="Muracle Design Project" /></p>
        <p><img src="/images/muracle/MPDesignProject13.png" alt="Muracle Design Project" /></p>
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
        <p><img src="/images/panlImage1.png" alt="Panl App" /></p>
        <p><img src="/images/panlImage2.png" alt="Panl App" /></p>
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
        <p><img src="/images/vacuumPage1.png" alt="Vacuum Design Project" /></p>
        <p><img src="/images/vacuumPage2.png" alt="Vacuum Design Project" /></p>
        <p><img src="/images/vacuumPage3.png" alt="Vacuum Design Project" /></p>
        <h2>Brand Selection</h2>
        <p><img src="/images/vacuumPage4.png" alt="Vacuum Design Project" /></p>
        <h2>Early Concept Design</h2>
        <p><img src="/images/vacuumPage5.png" alt="Vacuum Design Project" /></p>
        <p><img src="/images/vacuumPage6.png" alt="Vacuum Design Project" /></p>
        <p><img src="/images/vacuumPage7.png" alt="Vacuum Design Project" /></p>
        <h2>Design Development</h2>
        <p><img src="/images/vacuumPage8.png" alt="Vacuum Design Project" /></p>
        <p><img src="/images/vacuumPage9.png" alt="Vacuum Design Project" /></p>
        <p><img src="/images/vacuumPage10.png" alt="Vacuum Design Project" /></p>
        <p><img src="/images/vacuumPage11.png" alt="Vacuum Design Project" /></p>
        <h2>Final Design</h2>
        <p><img src="/images/vacuumPage12.png" alt="Vacuum Design Project" /></p>
        <p><img src="/images/vacuumPage13.png" alt="Vacuum Design Project" /></p>
        <p><img src="/images/vacuumPage14.png" alt="Vacuum Design Project" /></p>
      </>
    ),
  },
]

export const projectsBySlug = Object.fromEntries(projects.map(p => [p.slug, p]))
