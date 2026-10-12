/* ------------------------------------------------------------------ *
 * The structure of the story: chapters, timing helpers, cosmic time.
 * Anything that is "about the story" rather than "about drawing" lives here.
 * ------------------------------------------------------------------ */

/**
 * Every chapter of the site, in scroll order. The HUD rail shows all of them.
 * The order follows the real history of the universe AND reads like a CV:
 * who I am → experience → skills → projects → milestones → contact.
 */
export const CHAPTERS = [
  { id: 'origin', numeral: 'I', title: 'Origin' },
  { id: 'first-light', numeral: 'II', title: 'First Light' },
  { id: 'accretion', numeral: 'III', title: 'Accretion' },
  { id: 'orbits', numeral: 'IV', title: 'Orbits' },
  { id: 'horizon', numeral: 'V', title: 'Event Horizon' },
  { id: 'projects', numeral: 'VI', title: 'Observations' },
  { id: 'wormhole', numeral: 'VII', title: 'Wormhole' },
  { id: 'transmission', numeral: 'VIII', title: 'Transmission' },
] as const

export type ChapterId = (typeof CHAPTERS)[number]['id']

/** "Chapter III · Accretion": used in every chapter's small heading, so reordering never breaks them. */
export const chapterHeading = (id: ChapterId) => {
  const c = CHAPTERS.find((ch) => ch.id === id)!
  return `Chapter ${c.numeral} · ${c.title}`
}

/**
 * A 0 → 1 → 0 "window" for fading things in and out with scroll.
 * Fades in between progress `a` and `b`, stays visible, then fades out between `c` and `d`.
 * Leave out c and d to fade in and stay.
 */
export const fade = (p: number, a: number, b: number, c = 2, d = 3) =>
  Math.max(0, Math.min(1, (p - a) / (b - a), (d - p) / (d - c)))

/* ---------------------------- Cosmic time ---------------------------- */

const SECONDS = { minute: 60, hour: 3600, day: 86400, year: 3.156e7 }
const SUPERSCRIPT: Record<string, string> = {
  '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
}

/** log10 of a number of years, in seconds (the clock works on a logarithmic scale). */
const yrs = (years: number) => Math.log10(years * SECONDS.year)

/**
 * The cosmic clock, chapter by chapter: [chapter progress, log10(seconds since the Big Bang)].
 * Between keyframes we blend the *logarithm*, so in Chapter I the clock races through
 * tiny fractions of a second, then seconds, days, years and millions of years.
 * It only reaches today (13.8 billion years) at the very end of the site.
 */
const CLOCK: Record<ChapterId, [number, number][]> = {
  origin: [
    [0.05, -43], // Planck time: the earliest moment physics can describe
    [0.1, -32], // inflation ends
    [0.34, yrs(380_000)], // recombination: the fog clears
    [0.46, yrs(100e6)], // cosmic dawn: the first stars
    [0.9, yrs(200e6)],
  ],
  'first-light': [[0, yrs(200e6)], [1, yrs(400e6)]], // the first galaxies, the light JWST was built to catch
  accretion: [[0, yrs(400e6)], [0.16, yrs(9.2e9)], [1, yrs(9.25e9)]], // the Earth forms
  orbits: [[0, yrs(9.25e9)], [1, yrs(9.3e9)]], // the young Earth and its Moon
  horizon: [[0, yrs(9.3e9)], [0.15, yrs(13.7e9)], [1, yrs(13.75e9)]], // black holes keep feeding, to this day
  projects: [[0, yrs(13.75e9)], [1, yrs(13.79e9)]], // telescopes, and people to point them
  wormhole: [[0, yrs(13.79e9)], [1, yrs(13.799e9)]], // milestones: shortcuts through space
  transmission: [[0, yrs(13.799e9)], [0.6, yrs(13.8e9)]], // now: the clock finally reads 13.8 billion years
}

/** Chapter + its progress → log10(seconds). Returns null before the Big Bang. */
function logSecondsAt(chapter: ChapterId, progress: number): number | null {
  const keys = CLOCK[chapter]
  if (progress < keys[0][0]) return chapter === 'origin' ? null : keys[0][1]
  for (let i = 1; i < keys.length; i++) {
    const [p1, s1] = keys[i]
    if (progress <= p1) {
      const [p0, s0] = keys[i - 1]
      return s0 + ((progress - p0) / (p1 - p0)) * (s1 - s0)
    }
  }
  return keys[keys.length - 1][1]
}

/** A human-friendly reading for the HUD clock, e.g. "10⁻³² seconds", "380,000 years", "9.2 billion years". */
export function cosmicTime(chapter: ChapterId, progress: number): string {
  const log = logSecondsAt(chapter, progress)
  if (log === null) return 't = 0'

  const s = Math.pow(10, log)
  const round = (n: number) => (n < 10 ? n.toFixed(1) : Math.round(n).toLocaleString('en-US'))

  if (s < 1) return `10${String(Math.round(log)).replace(/./g, (c) => SUPERSCRIPT[c] ?? c)} seconds`
  if (s < SECONDS.minute) return `${round(s)} seconds`
  if (s < SECONDS.hour) return `${round(s / SECONDS.minute)} minutes`
  if (s < SECONDS.day) return `${round(s / SECONDS.hour)} hours`
  if (s < SECONDS.year) return `${round(s / SECONDS.day)} days`

  const years = s / SECONDS.year
  if (years < 1e6) return `${round(years)} years`
  if (years < 1e9) return `${round(years / 1e6)} million years`
  if (years >= 13.7999e9) return '13.8 billion years · now'
  // Rounded DOWN to 2 decimals, so the clock can never show 13.8 before the end.
  return `${Math.floor((years / 1e9) * 100) / 100} billion years`
}