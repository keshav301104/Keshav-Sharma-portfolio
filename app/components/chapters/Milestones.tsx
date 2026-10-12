'use client'
import { useCosmos } from '../../lib/store'
import { chapterHeading, fade } from '../../lib/story'
import { MILESTONES } from '../../data/milestones'
import { APPROACH_END, MILESTONES_START, milestoneAt } from '../../lib/wormhole'

/* ------------------------------------------------------------------ *
 * Chapter VII: Wormhole (your milestones).
 *
 * The camera closes in on a wormhole (cosmos/Wormhole.tsx) while your
 * milestones appear one at a time. Then it plunges through the throat
 * into another universe, and the text clears out of the way.
 *
 * Desktop: text on the left, wormhole on the right.
 * Phones:  wormhole on top, text below.
 * ------------------------------------------------------------------ */

const r2 = (n: number) => Math.round(n * 100) / 100
const rise = (o: number) => ({ opacity: r2(o), transform: `translateY(${r2((1 - o) * 14)}px)` })

export default function Milestones() {
  const w = useCosmos((s) => s.progress.wormhole ?? 0)
  const { index, local } = milestoneAt(w, MILESTONES.length)
  const intro = fade(w, 0.02, 0.05, MILESTONES_START - 0.02, MILESTONES_START)
  const panel = fade(w, MILESTONES_START, MILESTONES_START + 0.01, APPROACH_END - 0.02, APPROACH_END + 0.01)
  const card = index < 0 ? 0 : fade(local, 0.04, 0.18, 0.86, 0.98)
  const plunge = fade(w, 0.86, 0.9, 0.96, 0.995)
  const m = MILESTONES[Math.max(index, 0)]

  return (
    <div className="absolute inset-0">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 via-45% to-transparent to-60% md:bg-gradient-to-r md:from-black/70 md:via-black/30 md:via-35% md:to-transparent md:to-50%"
        style={{ opacity: r2(Math.max(intro, panel)) }}
      />

      <div className="absolute inset-x-6 bottom-[6vh] top-[52vh] md:inset-y-0 md:left-[6vw] md:right-auto md:flex md:w-[38vw] md:max-w-[540px] md:flex-col md:justify-center">
        {/* Arrival */}
        <div className="absolute inset-x-0 bottom-0 md:static" style={{ ...rise(intro), display: intro > 0 ? 'block' : 'none' }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-sky-200/80">{chapterHeading('wormhole')}</p>
          <h2 className="mt-4 text-balance font-display text-4xl leading-[1.05] md:text-6xl">
            Some moments fold space.
            <span className="block italic text-white/65">They got me here faster than the long way round.</span>
          </h2>
          <p className="mt-5 max-w-md text-sm text-white/60 md:text-base">
            Inside that sphere is another universe. Keep scrolling: we&apos;re going through.
          </p>
        </div>

        {/* One milestone at a time */}
        <div style={{ opacity: r2(panel), display: panel > 0 ? 'block' : 'none' }}>
          <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
            <span className="text-sky-200/80">{chapterHeading('wormhole')}</span>
            <span className="tabular-nums">
              {String(Math.max(index, 0) + 1).padStart(2, '0')} / {String(MILESTONES.length).padStart(2, '0')}
            </span>
          </div>

          <article key={index} className="mt-5 md:mt-8" style={rise(card)}>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-sky-100/70 md:text-[11px]">{m.kicker}</p>
            <h3 className="mt-3 text-balance font-display text-3xl leading-[1.05] md:text-5xl">{m.title}</h3>
            {m.when && <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">{m.when}</p>}
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75 md:mt-5 md:text-base">{m.body}</p>
            {m.link && (
              <a
                href={m.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto mt-5 inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white transition-colors hover:border-white hover:bg-white hover:text-black md:mt-7"
              >
                {m.link.label} <span aria-hidden="true">↗</span>
              </a>
            )}
          </article>

          {/* Progress through the milestones */}
          <div className="mt-6 flex gap-2 md:mt-10">
            {MILESTONES.map((_, i) => (
              <span key={i} className={`h-px w-8 transition-colors duration-500 ${i <= index ? 'bg-white' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* The plunge */}
      <p
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-mono text-[10px] uppercase tracking-[0.5em] text-white/80 [text-shadow:0_0_14px_rgba(0,0,0,0.9)]"
        style={{ opacity: r2(plunge) }}
      >
        Crossing the throat
      </p>
    </div>
  )
}