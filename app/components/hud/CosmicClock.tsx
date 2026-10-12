'use client'
import { useCosmos } from '../../lib/store'
import { CHAPTERS, cosmicTime } from '../../lib/story'

/* ------------------------------------------------------------------ *
 * The instrument panel that floats over the whole site:
 *
 *   top-left      your monogram (click → back to the start)
 *   top-right     which chapter you're in
 *   bottom-left   the cosmic clock: time since the Big Bang
 *   right edge    a rail with one tick per chapter, filling as you scroll
 *
 * `mix-blend-mode: difference` inverts the text against whatever is
 * behind it, so it stays readable over black space AND white-hot plasma.
 * ------------------------------------------------------------------ */

export default function CosmicClock() {
  const active = useCosmos((s) => s.active)
  const progress = useCosmos((s) => s.progress[s.active] ?? 0)
  const global = useCosmos((s) => s.global)

  const chapterIndex = Math.max(0, CHAPTERS.findIndex((c) => c.id === active))
  const chapter = CHAPTERS[chapterIndex]
  // The clock runs through the whole site: each chapter covers its own stretch of cosmic history.
  const time = cosmicTime(chapter.id, progress)

  return (
    <div className="pointer-events-none fixed inset-0 z-50 text-white mix-blend-difference">
      {/* Monogram */}
      <a
        href="#origin"
        className="pointer-events-auto absolute left-5 top-5 flex items-center gap-3 md:left-8 md:top-7"
        aria-label="Back to the beginning"
      >
        <span className="font-display text-2xl leading-none">K·S</span>
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.3em] text-white/70 sm:inline">
          Keshav Sharma
        </span>
      </a>

      {/* Current chapter */}
      <div className="absolute right-5 top-5 text-right md:right-8 md:top-7">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">Chapter {chapter.numeral}</p>
        <p className="font-display text-lg italic leading-tight">{chapter.title}</p>
      </div>

      {/* Cosmic clock. On phones it shows only in Chapter I, where it moves fastest, and in
          the last chapter, where it reaches today; other chapters need the bottom of a small screen. */}
      <div
        className={`absolute bottom-5 left-5 md:bottom-7 md:block md:left-8 ${active === 'origin' || active === 'transmission' ? '' : 'hidden'}`}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">Since the Big Bang</p>
        <p className="font-mono text-sm tabular-nums md:text-base">{time}</p>
      </div>

      {/* Chapter rail (desktop only) */}
      <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-4 md:flex">
        <div className="absolute right-[3px] top-0 h-full w-px bg-white/15" />
        <div
          className="absolute right-[3px] top-0 w-px bg-white"
          style={{ height: `${Math.min(1, global) * 100}%` }}
        />
        {CHAPTERS.map((c, i) => (
          <div key={c.id} className="relative flex items-center gap-3">
            <span
              className={`font-mono text-[10px] uppercase tracking-[0.25em] transition-opacity duration-500 ${
                i === chapterIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {c.numeral}
            </span>
            <span
              className={`block h-[7px] w-[7px] rounded-full border border-white transition-colors duration-500 ${
                i <= chapterIndex ? 'bg-white' : 'bg-black'
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}