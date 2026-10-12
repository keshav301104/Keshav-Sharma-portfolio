'use client'
import { useCosmos } from '../../lib/store'
import { chapterHeading, fade } from '../../lib/story'
import { CONTACT } from '../../data/milestones'

/* ------------------------------------------------------------------ *
 * Chapter VIII: Transmission (how to reach you). The end of the page.
 *
 * We've come out of the wormhole into another universe. The camera
 * drifts into a star-forming nebula, then turns around: inside the
 * sphere behind us is our own universe, everything this page has
 * travelled through. The cosmic clock finally reads 13.8 billion years.
 * Time to fix a meeting: until a slot is picked, it's in a superposition.
 * ------------------------------------------------------------------ */

const r2 = (n: number) => Math.round(n * 100) / 100
const rise = (o: number) => ({ opacity: r2(o), transform: `translateY(${r2((1 - o) * 14)}px)` })

function Pill({ href, children, download }: { href: string; children: React.ReactNode; download?: boolean }) {
  return (
    <a
      href={href}
      target={download ? undefined : '_blank'}
      rel="noopener noreferrer"
      download={download}
      className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/25 px-3.5 py-1.5 font-mono text-[10px] md:px-4 md:py-2 uppercase tracking-[0.22em] text-white transition-colors hover:border-white hover:bg-white hover:text-black"
    >
      {children}
    </a>
  )
}

export default function Transmission() {
  const t = useCosmos((s) => s.progress.transmission ?? 0)
  const arrival = fade(t, 0.01, 0.06, 0.18, 0.26)
  const panel = fade(t, 0.5, 0.62)

  return (
    <div className="absolute inset-0">
      {/* Just through */}
      <p
        className="pointer-events-none absolute inset-x-6 top-1/2 -translate-y-1/2 text-center font-display text-3xl italic text-white/90 [text-shadow:0_0_24px_rgba(0,0,0,0.9)] md:text-5xl"
        style={{ opacity: r2(arrival) }}
      >
        Another universe. Same laws of physics.
      </p>

      {/* Label under the far mouth once we've turned round (Wormhole.tsx positions it) */}
      <div id="wormhole-home" className="pointer-events-none absolute left-0 top-0 opacity-0 max-md:hidden">
        <p className="-translate-x-1/2 whitespace-nowrap text-center font-mono text-[9px] uppercase tracking-[0.3em] text-white/75 [text-shadow:0_0_12px_rgba(0,0,0,0.95)] md:text-[10px]">
          Home · the Milky Way, where this page began
        </p>
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 via-45% to-transparent to-60% md:bg-gradient-to-r md:from-black/75 md:via-black/35 md:via-35% md:to-transparent md:to-55%"
        style={{ opacity: r2(panel) }}
      />

      <div
        className="absolute inset-x-6 bottom-[12vh] md:bottom-auto md:left-[6vw] md:right-auto md:top-1/2 md:w-[40vw] md:max-w-[560px] md:-translate-y-1/2"
        style={{ display: panel > 0 ? 'block' : 'none' }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-sky-200/80" style={rise(panel)}>
          {chapterHeading('transmission')}
        </p>
        {/* The clock in the corner now reads 13.8 billion years: today. */}
        <p className="mt-3 hidden font-display text-xl italic text-white/55 md:mt-4 md:block md:text-2xl" style={rise(panel)}>
          13.8 billion years later, here we are.
        </p>
        <h2 className="mt-3 text-balance font-display text-[2rem] leading-[1.05] md:mt-3 md:text-[3.4rem]" style={rise(panel)}>
          Right now, our meeting is in a quantum superposition.
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70 md:mt-5 md:text-base" style={rise(fade(t, 0.55, 0.67))}>
          It could happen at any time. Pick a slot to collapse the wave function and lock our coordinates in spacetime.
        </p>

        <div style={rise(fade(t, 0.6, 0.72))}>
          <a
            href={CONTACT.booking || `mailto:${CONTACT.email}?subject=Let%27s%20lock%20our%20coordinates`}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto mt-5 inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-black transition-colors hover:bg-sky-100 md:mt-7 md:text-[11px]"
          >
            Pick a slot · collapse the wave function <span aria-hidden="true">↗</span>
          </a>
          <div className="mt-5 flex flex-wrap items-center gap-2 md:mt-6 md:gap-2.5">
            <Pill href={CONTACT.resume}>
              Resume <span aria-hidden="true">↓</span>
            </Pill>
            {CONTACT.links.map((l) => (
              <Pill key={l.label} href={l.href}>
                {l.label} <span aria-hidden="true">↗</span>
              </Pill>
            ))}
          </div>
          <a
            href={`mailto:${CONTACT.email}`}
            className="pointer-events-auto mt-4 inline-block break-all font-mono text-[11px] tracking-[0.08em] text-white/70 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white md:mt-5 md:text-xs"
          >
            {CONTACT.email}
          </a>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 md:mt-10" style={rise(fade(t, 0.7, 0.82))}>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="pointer-events-auto font-mono text-[10px] uppercase tracking-[0.3em] text-white/70 transition-colors hover:text-white"
          >
            ↑ Back to the Big Bang
          </button>
          <p className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-white/35 md:block">© 2026 Keshav Sharma</p>
        </div>
      </div>
    </div>
  )
}