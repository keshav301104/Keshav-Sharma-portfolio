'use client'
import { useEffect, useRef } from 'react'
import { useCosmos } from '../../lib/store'
import { chapterHeading, fade } from '../../lib/story'
import { ALL_SKILLS, SKILL_GROUPS, type Skill } from '../../data/skills'
import { INTRO_END, OUTRO_START, PER_GROUP, clumpRadius, fallProgress, groupAt, swallowedCount } from '../../lib/horizon'

/* ------------------------------------------------------------------ *
 * Chapter V: Event Horizon (your skills).
 *
 * You are the black hole (drawn by cosmos/BlackHole.tsx). Your skills
 * fall into it a whole group at a time: six clumps of hot gas, each with
 * its skill's name riding on it. This overlay keeps score:
 *
 *   - the group on stage, with its six skills
 *   - each skill is "in orbit", "falling" (with its live distance, in
 *     horizon radii r_s) or "inside" (swallowed, for good)
 *   - as each crosses the horizon, its name collapses into the shadow
 *     and a ring of light pulses outward
 *   - a marker under the shadow says whose black hole this is, and counts
 *     how many skills it has swallowed
 *
 * Desktop: list on the left, black hole on the right.
 * Phones:  black hole on top, list below.
 * ------------------------------------------------------------------ */

const r2 = (n: number) => Math.round(n * 100) / 100
const TOTAL = SKILL_GROUPS.reduce((n, g) => n + g.skills.length, 0)

type State = 'orbit' | 'falling' | 'inside'

function SkillRow({ skill, state, t, index }: { skill: Skill; state: State; t: number; index: number }) {
  return (
    <li
      className={`group pointer-events-auto relative border-l py-1 pl-4 transition-[opacity,border-color] duration-500 md:py-1.5 ${
        state === 'falling' ? 'border-amber-200 opacity-100' : state === 'inside' ? 'border-white/25 opacity-75' : 'border-white/15 opacity-60'
      }`}
    >
      <div className="flex items-baseline justify-between gap-4">
        <p className={`font-display text-lg leading-tight md:text-2xl ${state === 'falling' ? 'text-amber-50' : 'text-white'}`}>{skill.name}</p>
        <p className="shrink-0 font-mono text-[9px] uppercase tracking-[0.2em] text-white/50">
          {state === 'falling' ? (
            <span className="tabular-nums normal-case text-amber-200">
              r = {clumpRadius(index, t).toFixed(1)} r<sub>s</sub>
            </span>
          ) : state === 'inside' ? (
            'Inside'
          ) : (
            'In orbit'
          )}
        </p>
      </div>
      <p className="mt-0.5 hidden font-mono text-[10px] uppercase tracking-[0.14em] text-white/55 md:block md:text-[11px]">{skill.detail}</p>
      {skill.seen && <p className="mt-1 hidden text-xs text-sky-100/60 md:group-hover:block">Built in · {skill.seen.join(', ')}</p>}
    </li>
  )
}

export default function EventHorizon() {
  const h = useCosmos((s) => s.progress.horizon ?? 0)
  const { group, local } = groupAt(h)
  const shown = Math.max(group, 0)
  const swallowed = swallowedCount(h)
  const intro = fade(h, 0.02, 0.06, INTRO_END - 0.02, INTRO_END + 0.01)
  const panel = fade(h, INTRO_END, INTRO_END + 0.015, OUTRO_START - 0.01, OUTRO_START + 0.02)
  // Each group's panel fades out and the next fades in around the hand-over.
  const swap = group < 0 ? 0 : fade(local, 0, 0.06, 0.95, 1)
  // The most recently swallowed skill (for the "collapse into the shadow" effect).
  const lastSwallowed = swallowed > 0 ? ALL_SKILLS[swallowed - 1].name : ''

  // Each time a skill crosses the horizon (scrolling forward), play the swallow effect.
  const toast = useRef<HTMLParagraphElement>(null)
  const ring = useRef<HTMLSpanElement>(null)
  const previous = useRef(swallowed)
  useEffect(() => {
    if (swallowed > previous.current) {
      toast.current?.animate(
        [
          { opacity: 1, transform: 'translate(-50%, -50%) scale(1)', filter: 'blur(0px)' },
          { opacity: 0, transform: 'translate(-50%, -50%) scale(0.12)', filter: 'blur(3px)' },
        ],
        { duration: 1300, easing: 'cubic-bezier(0.55, 0, 0.9, 0.45)' }
      )
      ring.current?.animate(
        [
          { opacity: 0.9, transform: 'translate(-50%, -50%) scale(0.9)' },
          { opacity: 0, transform: 'translate(-50%, -50%) scale(2.6)' },
        ],
        { duration: 1500, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' }
      )
    }
    previous.current = swallowed
  }, [swallowed])

  return (
    <div className="absolute inset-0">
      {/* Text sits on a soft shadow so it reads over the bright disc */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 via-45% to-transparent to-60% md:bg-gradient-to-r md:from-black/70 md:via-black/35 md:via-35% md:to-transparent md:to-50%"
        style={{ opacity: r2(Math.max(intro, panel)) }}
      />

      {/* "This is me": under the shadow (BlackHole.tsx positions it) */}
      <div id="bh-marker" className="pointer-events-none absolute left-0 top-0 opacity-0">
        <div className="-translate-x-1/2 text-center [text-shadow:0_0_18px_rgba(0,0,0,0.95)]">
          <span className="mx-auto block h-6 w-px bg-gradient-to-b from-transparent to-white/60" />
          <p className="mt-1 whitespace-nowrap font-display text-2xl leading-none md:text-4xl">Keshav Sharma</p>
          <p className="mt-2 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.25em] text-amber-100/70 md:text-[10px]">
            The black hole · <span className="tabular-nums text-white">{swallowed}</span> / {TOTAL} skills inside
          </p>
        </div>
      </div>

      {/* The swallow effect, centred on the shadow (BlackHole.tsx positions it; --shadow = its size) */}
      <div id="bh-core" className="pointer-events-none absolute left-0 top-0">
        <span
          ref={ring}
          className="absolute left-0 top-0 rounded-full border border-amber-100/70 opacity-0"
          style={{ width: 'var(--shadow, 120px)', height: 'var(--shadow, 120px)', transform: 'translate(-50%, -50%)' }}
        />
        <p
          ref={toast}
          className="absolute left-0 top-0 whitespace-nowrap font-display text-lg text-white opacity-0 md:text-2xl"
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          {lastSwallowed}
        </p>
      </div>

      {/* Names riding on the six clumps (BlackHole.tsx moves them, reddens and stretches them as they fall) */}
      {Array.from({ length: PER_GROUP }, (_, i) => (
        // Alternate names sit above and below their clumps, so neighbours don't collide.
        <div key={i} id={`bh-label-${i}`} className="group pointer-events-none absolute left-0 top-0 opacity-0" data-flip="false">
          <p
            className={`${i % 2 ? 'translate-y-[40%]' : '-translate-y-[140%]'} translate-x-2 whitespace-nowrap font-mono text-[9px] uppercase text-white [text-shadow:0_0_10px_rgba(0,0,0,0.95)] group-data-[flip=true]:-translate-x-[calc(100%+8px)] md:text-[10px]`}
          >
            {SKILL_GROUPS[shown].skills[i]?.name}
          </p>
        </div>
      ))}

      <div className="absolute inset-x-6 bottom-[4vh] top-[50vh] md:inset-y-0 md:left-[6vw] md:right-auto md:flex md:w-[38vw] md:max-w-[560px] md:flex-col md:justify-center">
        {/* The approach */}
        <div className="absolute inset-x-0 bottom-0 md:static" style={{ opacity: r2(intro), display: intro > 0 ? 'block' : 'none' }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-amber-200/80">{chapterHeading('horizon')}</p>
          <h2 className="mt-4 text-balance font-display text-4xl leading-[1.05] md:text-6xl">
            This black hole is me.
            <span className="block italic text-white/65">Everything I learn falls in. Nothing gets out.</span>
          </h2>
          <p className="mt-5 max-w-md text-sm text-white/60 md:text-base">
            Four groups of skills, each falling in as one stream: stretched by the tide, then swallowed whole.
          </p>
        </div>

        {/* The group on stage */}
        <div style={{ opacity: r2(panel * swap), display: panel > 0 ? 'block' : 'none' }}>
          <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
            <span className="text-amber-200/80">{chapterHeading('horizon')}</span>
            <span className="tabular-nums">
              {String(shown + 1).padStart(2, '0')} / {String(SKILL_GROUPS.length).padStart(2, '0')}
            </span>
          </div>
          <h3 className="mt-3 font-display text-3xl leading-none md:mt-5 md:text-5xl">{SKILL_GROUPS[shown].title}</h3>
          <p className="mt-2 hidden text-sm italic leading-snug text-white/60 md:mt-3 md:block md:text-base">
            {SKILL_GROUPS[shown].tagline}
          </p>
          <ul className="mt-3 space-y-0.5 md:mt-6 md:space-y-1">
            {SKILL_GROUPS[shown].skills.map((skill, i) => {
              const t = fallProgress(h, shown, i)
              const state: State = t >= 1 ? 'inside' : t >= 0 ? 'falling' : 'orbit'
              return <SkillRow key={skill.name} skill={skill} state={state} t={Math.max(t, 0)} index={i} />
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}