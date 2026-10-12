'use client'
import { useCosmos } from '../../lib/store'
import { chapterHeading, fade } from '../../lib/story'
import { EARLIER_ROLES, focusedRole } from '../../data/experience'

/* ------------------------------------------------------------------ *
 * Chapter IV: Orbits (your earlier roles).
 *
 * Every world keeps what shaped it in orbit. Each earlier role is a moon
 * around the Importex planet (drawn by cosmos/Moons.tsx), with a tracking
 * reticle locked on. Scrolling moves the focus from the most recent role outward.
 *
 * The chapter is split in equal halves, one per role. Inside each (local t):
 *   0.06 – 0.16  card fades in       0.86 – 0.96  card fades out
 * ------------------------------------------------------------------ */

const r2 = (n: number) => Math.round(n * 100) / 100

export default function Orbits() {
  const o = useCosmos((s) => s.progress.orbits ?? 0)
  const focus = focusedRole(o)
  const local = o * EARLIER_ROLES.length - focus
  const role = EARLIER_ROLES[focus]
  const isLast = focus === EARLIER_ROLES.length - 1
  const cardOpacity = fade(local, 0.06, 0.16, isLast ? 0.9 : 0.86, isLast ? 1 : 0.96)

  return (
    <div className="absolute inset-0">
      {/* Tracking reticles: Moons.tsx locks each one onto its moon every frame
          (--s = the moon's size on screen, --f = 1 when it's the moon in focus). */}
      {EARLIER_ROLES.map((r, i) => (
        <div
          key={r.id}
          id={`orbit-label-${r.id}`}
          className="pointer-events-none absolute left-0 top-0 opacity-0"
          style={{ '--s': '40px', '--f': '0' } as React.CSSProperties}
        >
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ width: 'calc(var(--s) + 18px)', height: 'calc(var(--s) + 18px)' }}
          >
            {['left-0 top-0 border-l border-t', 'right-0 top-0 border-r border-t', 'left-0 bottom-0 border-l border-b', 'right-0 bottom-0 border-r border-b'].map(
              (corner) => (
                <span key={corner} className={`absolute h-2.5 w-2.5 border-sky-100/90 ${corner}`} />
              )
            )}
          </div>
          {/* On phones only the moon in focus is named, so labels never pile up */}
          <div
            className="absolute top-0 -translate-y-1/2 whitespace-nowrap font-mono uppercase max-md:opacity-[var(--f)]"
            style={{ left: 'calc(var(--s) / 2 + 20px)' }}
          >
            <p className="text-[10px] tracking-[0.25em] text-white md:text-[11px]">{r.company}</p>
            <p className="mt-0.5 text-[9px] tracking-[0.2em] text-sky-100/50" style={{ opacity: 'var(--f)' }}>
              Moon {['I', 'II', 'III', 'IV'][i]} · {r.dates}
            </p>
          </div>
        </div>
      ))}

      {/* A soft dark backdrop behind the text */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent md:bg-gradient-to-l md:from-black/70 md:via-black/30 md:via-35% md:to-transparent md:to-55%"
        style={{ opacity: r2(fade(o, 0, 0.06, 0.95, 1)) }}
      />

      <div className="absolute inset-x-6 bottom-[5vh] top-[44vh] md:bottom-auto md:left-[57vw] md:right-[6vw] md:top-1/2 md:-translate-y-1/2">
        <div style={{ opacity: r2(fade(o, 0.02, 0.1, 0.95, 1)) }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-sky-200/80">{chapterHeading('orbits')}</p>
          <h2 className="mt-4 hidden text-balance font-display text-5xl leading-[1.05] md:block">
            Every world keeps what shaped it <span className="italic text-white/65">in orbit.</span>
          </h2>
        </div>

        <article
          key={role.id}
          className="mt-3 md:mt-10"
          style={{ opacity: r2(cardOpacity), transform: `translateY(${r2((1 - fade(local, 0.06, 0.16)) * 14)}px)` }}
        >
          <div className="border-l border-sky-200/30 pl-4">
            <p className="font-display text-2xl leading-tight md:text-4xl">
              {role.role} · {role.company}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">{role.dates}</p>
          </div>

          <ul className="mt-4 space-y-1.5 md:mt-6 md:space-y-2.5">
            {role.points.map((p, i) => (
              // Phones show the first three points, so the whole card fits on a small screen.
              <li key={p} className={`${i >= 3 ? 'hidden md:flex' : 'flex'} gap-3 text-sm leading-snug text-white/80 md:text-base`}>
                <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-sky-200/80" />
                {p}
              </li>
            ))}
          </ul>

          <p className="mt-4 font-mono text-[10px] uppercase leading-relaxed tracking-[0.15em] text-sky-200/70 md:mt-6">
            {role.stack.join(' · ')}
          </p>

          {role.letter && (
            <a
              href={role.letter.href}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto mt-4 inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white transition-colors hover:border-white hover:bg-white hover:text-black md:mt-6"
            >
              {role.letter.label} <span aria-hidden="true">↗</span>
            </a>
          )}
        </article>
      </div>
    </div>
  )
}