'use client'
import CosmosCanvas from './components/cosmos/CosmosCanvas'
import SmoothScroll from './components/SmoothScroll'
import Chapter from './components/Chapter'
import CosmicClock from './components/hud/CosmicClock'
import FirstLight from './components/chapters/FirstLight'
import EventHorizon from './components/chapters/EventHorizon'
import Observations from './components/chapters/Observations'
import Accretion from './components/chapters/Accretion'
import Orbits from './components/chapters/Orbits'
import Milestones from './components/chapters/Milestones'
import Transmission from './components/chapters/Transmission'
import { useCosmos } from './lib/store'
import { fade } from './lib/story'

/** One line of narration: a cosmic timestamp, a headline, and a quieter second line. */
function Beat({ opacity, time, line, sub }: { opacity: number; time: string; line: string; sub?: string }) {
  return (
    <div
      className="absolute bottom-[12vh] flex max-w-2xl flex-col items-center gap-3 px-10 py-8"
      style={{
        opacity,
        transform: `translateY(${(1 - opacity) * 12}px)`, // rises slightly as it fades in
        textShadow: '0 0 24px rgba(0,0,0,0.9)',
        // a soft dark halo so the words stay readable over the bright plasma
        background: 'radial-gradient(ellipse at center, rgba(12,4,0,0.5), transparent 70%)',
      }}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-white/60">{time}</p>
      <p className="font-display text-3xl leading-tight text-white md:text-5xl">{line}</p>
      {sub && <p className="font-display text-lg italic text-white/65 md:text-2xl">{sub}</p>}
    </div>
  )
}

/** The words that appear over the Big Bang as you scroll, following the real timeline of the universe. */
function OriginStory() {
  const p = useCosmos((s) => s.progress.origin ?? 0)

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center text-center">
      {/* The singularity */}
      <div
        className="absolute bottom-[12vh] flex flex-col items-center gap-4"
        style={{ opacity: fade(p, -1, 0, 0.02, 0.05) }}
      >
        <p className="font-display text-2xl italic text-white/80 md:text-3xl">In the beginning, there was a point.</p>
        <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-white/50">Scroll to begin</p>
        <span className="h-12 w-px animate-pulse bg-gradient-to-b from-white/70 to-transparent" />
      </div>

      <Beat
        opacity={fade(p, 0.15, 0.19, 0.26, 0.29)}
        time="The plasma era"
        line="Space itself inflates."
        sub="For 380,000 years the universe is a blinding fog. Nothing can be seen."
      />

      <Beat
        opacity={fade(p, 0.32, 0.35, 0.39, 0.42)}
        time="Recombination"
        line="The fog clears."
        sub="Light travels freely for the first time."
      />

      <Beat opacity={fade(p, 0.42, 0.44, 0.49, 0.52)} time="Cosmic dawn" line="The first stars ignite." />

      {/* Once the name has formed */}
      <div
        className="absolute bottom-[13vh] flex flex-col items-center gap-3 px-6"
        style={{ opacity: fade(p, 0.86, 0.94) }}
      >
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-sky-200/80">
          AI Engineer · Founding Engineer at Importex
        </p>
        <p className="max-w-md font-display text-xl italic text-white/70 md:text-2xl">
          I build intelligent systems from first principles.
        </p>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <SmoothScroll>
      <CosmosCanvas />
      <CosmicClock />
      <main className="relative z-10 text-white">
        <Chapter id="origin" length={7}>
          <OriginStory />
        </Chapter>

        <Chapter id="first-light" length={4}>
          <FirstLight />
        </Chapter>

        {/* Experience first: Importex, then earlier roles as its moons */}
        <Chapter id="accretion" length={7}>
          <Accretion />
        </Chapter>

        <Chapter id="orbits" length={5}>
          <Orbits />
        </Chapter>

        {/* Skills: two screens of scrolling per group of six */}
        <Chapter id="horizon" length={8}>
          <EventHorizon />
        </Chapter>

        {/* Projects: all eleven plates slide past in about six screens */}
        <Chapter id="projects" length={7}>
          <Observations />
        </Chapter>

        {/* Milestones: the approach to a wormhole, then through it */}
        <Chapter id="wormhole" length={6}>
          <Milestones />
        </Chapter>

        {/* Contact, on the far side. The clock reaches 13.8 billion years. */}
        <Chapter id="transmission" length={4}>
          <Transmission />
        </Chapter>
      </main>
    </SmoothScroll>
  )
}