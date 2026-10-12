import { SKILL_GROUPS } from '../data/skills'

/* ------------------------------------------------------------------ *
 * The timing plan for Chapter V (Event Horizon), shared by the black
 * hole (cosmos/BlackHole.tsx), the camera (lib/voyage.ts) and the text
 * (chapters/EventHorizon.tsx).
 *
 *   0.00 – 0.10  the camera flies from the planet to the black hole
 *   0.10 – 0.90  four groups of skills, an equal share each
 *   0.90 – 1.00  the camera flies on, toward the galaxy of Chapter VI
 *
 * Each group falls in TOGETHER, as one stream of six clumps of hot gas
 * (one per skill), so the whole chapter takes about five scrolls.
 * Inside a group (local progress u, 0 → 1):
 *   0.00 – 0.15  the six clumps gather on the outer disc, names attached
 *   0.15 – 0.90  the stream spirals in, each clump just behind the one before
 *   0.90 – 1.00  the last one is swallowed; the next group takes the stage
 * ------------------------------------------------------------------ */

export const INTRO_END = 0.1
export const OUTRO_START = 0.9
export const PER_GROUP = SKILL_GROUPS[0].skills.length
const GROUP_SPAN = (OUTRO_START - INTRO_END) / SKILL_GROUPS.length
const GATHER_END = 0.15
const FALL_LENGTH = 0.5 // each clump's fall takes half the group's time
const STAGGER = 0.05 // each clump starts this much after the one before

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

/** Which group is on stage (-1 during the approach), and how far through it. */
export function groupAt(h: number) {
  if (h < INTRO_END) return { group: -1, local: 0 }
  const k = (Math.min(h, OUTRO_START - 1e-6) - INTRO_END) / GROUP_SPAN
  const group = Math.min(Math.floor(k), SKILL_GROUPS.length - 1)
  return { group, local: k - group }
}

/** How much of group `g`'s stream has gathered on the disc (0 → 1). */
export const gathered = (h: number, g: number) => clamp01((h - INTRO_END - g * GROUP_SPAN) / GROUP_SPAN / GATHER_END)

/**
 * How far skill `i` of group `g` has fallen at chapter progress `h`:
 * below 0 = still orbiting, 0 → 1 = falling, above 1 = swallowed.
 */
export function fallProgress(h: number, g: number, i: number) {
  const local = (h - INTRO_END - g * GROUP_SPAN) / GROUP_SPAN
  return (local - GATHER_END - i * STAGGER) / FALL_LENGTH
}

/** How many skills have crossed the horizon so far. */
export function swallowedCount(h: number) {
  let n = 0
  SKILL_GROUPS.forEach((group, g) => group.skills.forEach((_, i) => (n += fallProgress(h, g, i) >= 1 ? 1 : 0)))
  return n
}

/** Orbit radius of a clump while it falls (t = 0 → 1): a slow spiral, then a plunge to the horizon (r = 1). */
export function clumpRadius(i: number, t: number) {
  const start = 10.8 + (i % 2) * 0.7
  const f = clamp01(t)
  return 1 + (start - 1) * (1 - f * f)
}

/** The black hole is drawn from the moment Chapter V begins until the camera is well on its way to the galaxy. */
export const blackHoleOpacity = (h: number, projects: number) => clamp01(h / 0.02) * (1 - clamp01(projects / 0.12))