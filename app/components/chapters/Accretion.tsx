'use client'
import { useCosmos } from '../../lib/store'
import { chapterHeading, fade } from '../../lib/story'
import { planetGrowth, surfaceKelvin } from '../../lib/voyage'

/* ------------------------------------------------------------------ *
 * Chapter III: Accretion (your role at Importex).
 *
 * Planets aren't found, they're built: dust grains collide and stick,
 * grain by grain, until a world forms. That's what founding engineering
 * is like. Beside this text, a planet forms in a gap of a young star's
 * dust disc (cosmos/DustDisc.tsx + cosmos/World.tsx) as the camera dives in.
 *
 * Importex is private, so this describes the role, not the product.
 * ------------------------------------------------------------------ */

const r2 = (n: number) => Math.round(n * 100) / 100
const rise = (o: number) => ({ opacity: r2(o), transform: `translateY(${r2((1 - o) * 16)}px)` })

const POINTS = [
  'The first engineer, building the product from an empty repository to production',
  'Every layer is mine: architecture, backend, frontend and infrastructure',
  'I work directly with clients, turning how they operate into what we build',
]

export default function Accretion() {
  const a = useCosmos((s) => s.progress.accretion ?? 0)
  const out = fade(a, 0, 0.0001, 0.94, 1) // everything fades as the chapter ends
  const mass = Math.round(planetGrowth(a) * 100)
  const kelvin = surfaceKelvin(a).toLocaleString('en-US')

  return (
    <div className="absolute inset-0" style={{ opacity: r2(out) }}>
      {/* A soft dark backdrop behind the text */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 via-40% to-transparent to-60% md:bg-gradient-to-l md:from-black/60 md:via-black/25 md:via-35% md:to-transparent md:to-55%"
        style={{ opacity: r2(fade(a, 0.1, 0.2)) }}
      />
      {/* Readouts under the planet (left half on desktop, top area on phones) */}
      <div
        className="absolute left-6 top-[39vh] flex gap-8 font-mono text-[10px] uppercase tracking-[0.25em] text-amber-100/70 md:left-[7vw] md:top-auto md:bottom-[12vh]"
        style={{ opacity: r2(fade(a, 0.14, 0.22)) }}
      >
        <div>
          <p className="text-white/40">Accreted mass</p>
          <p className="mt-1 text-sm tabular-nums text-white">{mass}%</p>
        </div>
        <div>
          <p className="text-white/40">Surface temp</p>
          <p className="mt-1 text-sm tabular-nums text-white">{kelvin} K</p>
        </div>
      </div>

      {/* The story: right side on desktop, lower part on phones */}
      <div className="absolute inset-x-6 bottom-[5vh] top-[46vh] md:bottom-auto md:left-[57vw] md:right-[6vw] md:top-1/2 md:-translate-y-1/2">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-amber-200/80" style={rise(fade(a, 0.12, 0.2))}>
          {chapterHeading('accretion')}
        </p>
        <h2 className="mt-3 text-balance font-display text-3xl leading-[1.05] md:mt-5 md:text-[3.4rem]">
          <span className="block" style={rise(fade(a, 0.14, 0.24))}>
            Planets aren&apos;t found.
          </span>
          <span className="block italic text-white/65" style={rise(fade(a, 0.2, 0.3))}>
            They&apos;re built, grain by grain.
          </span>
        </h2>

        <div className="mt-6 border-l border-amber-200/30 pl-4 md:mt-10" style={rise(fade(a, 0.34, 0.44))}>
          <p className="font-display text-2xl leading-tight md:text-4xl">Founding Engineer · Importex</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
            Jul 2026 – Present · Miami, USA · Remote
          </p>
        </div>

        <ul className="mt-5 space-y-2 md:mt-7 md:space-y-3">
          {POINTS.map((p, i) => (
            <li
              key={p}
              className="flex gap-3 text-sm leading-snug text-white/80 md:text-base"
              style={rise(fade(a, 0.48 + i * 0.06, 0.56 + i * 0.06))}
            >
              <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-amber-200/80" />
              {p}
            </li>
          ))}
        </ul>

        <p
          className="mt-6 font-display text-xl italic text-white/60 max-md:[@media(max-height:700px)]:hidden md:mt-9 md:text-3xl"
          style={rise(fade(a, 0.72, 0.82))}
        >
          More like a CTO than an engineer: zero to one, end to end.
        </p>
      </div>
    </div>
  )
}