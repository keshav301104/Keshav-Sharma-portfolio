'use client'
import { useCosmos } from '../../lib/store'
import { fade } from '../../lib/story'
import JwstMirror, { alignmentPercent } from './JwstMirror'

/* ------------------------------------------------------------------ *
 * Chapter II: First Light.
 *
 * In astronomy, "first light" is the very first image a new telescope
 * takes. Here, it's the first proper look at you: your name dissolves
 * back into the stars (BigBang.tsx), the mirror assembles your portrait,
 * and your introduction appears beside it, line by line.
 * ------------------------------------------------------------------ */

/** Fades in and rises a little, driven by a 0 → 1 value. */
const rise = (o: number) => ({ opacity: o, transform: `translateY(${(1 - o) * 16}px)` })

const FACTS = [
  { label: 'Now', value: 'Founding Engineer · Importex' },
  { label: 'Studying', value: 'B.Tech CSE (Data Analytics) · VIT-AP, 2027' },
  { label: 'Leading', value: 'President · SEDS Aurora space club' },
  { label: 'Recognition', value: 'NASA Space Apps · Best Use of Science, Andhra Pradesh' },
]

export default function FirstLight() {
  const q = useCosmos((s) => s.progress['first-light'] ?? 0)
  const aligned = alignmentPercent(q)

  return (
    <div className="absolute inset-0 flex items-center justify-center px-6 pb-10 pt-14 md:p-0">
      <div className="grid w-full max-w-6xl items-center gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-16">
        {/* The mirror + its telemetry readout */}
        <div className="mx-auto w-[min(44vw,22vh,220px)] md:w-full md:max-w-[440px]">
          <JwstMirror progress={q} />
          <p
            className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-amber-200/70 md:mt-6"
            style={{ opacity: fade(q, 0.3, 0.36) }}
          >
            {aligned < 100 ? `Aligning mirror segments · ${aligned}%` : 'Mirror aligned · first light ✦'}
          </p>
        </div>

        {/* The introduction */}
        <div className="text-center md:text-left">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.35em] text-sky-200/80 md:text-[11px]"
            style={rise(fade(q, 0.12, 0.2))}
          >
            Chapter II · First Light
          </p>

          <h2 className="mt-3 text-balance font-display text-3xl leading-[1.05] md:mt-5 md:text-6xl">
            <span className="block" style={rise(fade(q, 0.16, 0.26))}>
              Every telescope has a first light.
            </span>
            <span className="block italic text-white/60" style={rise(fade(q, 0.22, 0.32))}>
              This is mine.
            </span>
          </h2>

          <p
            className="mt-3 hidden font-mono text-[11px] leading-relaxed text-white/40 md:block"
            style={rise(fade(q, 0.26, 0.36))}
          >
            (In astronomy, a telescope&apos;s &ldquo;first light&rdquo; is the very first image it captures.)
          </p>

          <p
            className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/75 md:mx-0 md:mt-7 md:text-lg"
            style={rise(fade(q, 0.5, 0.6))}
          >
            I&apos;m Keshav, an AI engineer who designs systems that reason, plan and act: multi-agent workflows,
            retrieval pipelines that cite their sources, and the backends that keep them running. Since July 2026
            I&apos;ve been the Founding Engineer at Importex, building its platform from zero to one.
          </p>

          <dl className="mx-auto mt-5 grid max-w-xl grid-cols-2 gap-x-6 gap-y-3 text-left md:mx-0 md:mt-8 md:gap-y-5">
            {FACTS.map((f, i) => (
              <div key={f.label} className="border-l border-white/15 pl-3" style={rise(fade(q, 0.58 + i * 0.04, 0.66 + i * 0.04))}>
                <dt className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/45 md:text-[10px]">{f.label}</dt>
                <dd className="mt-1 text-xs leading-snug text-white/85 md:text-sm">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}