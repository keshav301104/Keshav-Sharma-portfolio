/* ------------------------------------------------------------------ *
 * The plan for Chapters VII (Wormhole) and VIII (Transmission), shared
 * by cosmos/Wormhole.tsx (which flies the camera in these chapters and
 * draws the wormhole) and the text overlays.
 *
 * The wormhole's mouth hangs in the same space as the galaxy (see
 * WORMHOLE_MOUTH in lib/voyage.ts); you can already spot it, small,
 * behind the project plates.
 *
 * The camera's position is measured along the wormhole's tunnel, `L`:
 *   L > 0   our universe (L = distance from the mouth, in throat radii)
 *   L = 0   the throat itself
 *   L < 0   the other universe, on the far side
 *
 * Chapter VII (progress w):
 *   0.00 – 0.12  the camera turns from the galaxy to the mouth and heads for it
 *   0.12 – 0.82  slow approach: the milestones appear one by one
 *   0.82 – 1.00  the plunge through the throat
 * Chapter VIII (progress t):
 *   0.00 – 0.35  drifting away from the far mouth, into the nebula
 *   0.20 – 0.70  the camera turns around to look back: our whole
 *                universe, the one you just left, inside the sphere
 * ------------------------------------------------------------------ */

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const smooth = (x: number) => x * x * (3 - 2 * x)

export const APPROACH_END = 0.82
export const MILESTONES_START = 0.12

/** Where the camera is along the tunnel. */
export function tunnelPosition(w: number, t: number) {
  if (t > 0) return -2.6 - 6 * smooth(clamp01(t / 0.45))
  if (w < APPROACH_END) {
    // Distance shrinks evenly on a log scale, so the mouth grows steadily on screen.
    const a = smooth(clamp01((w - 0.02) / (APPROACH_END - 0.02)))
    return 45 * Math.pow(3.4 / 45, a)
  }
  return 3.4 - 6 * ease(clamp01((w - APPROACH_END) / (1 - APPROACH_END)))
}

/** How far the camera has turned around (0 = facing ahead, π = looking back at the mouth). */
export const turnAround = (t: number) => Math.PI * ease(clamp01((t - 0.2) / 0.5))

/** Drawn from halfway through Chapter VI (a small crystal ball behind the plates) to the end of the page. */
export const wormholeOpacity = (q: number, w: number, t: number) => (w > 0 || t > 0 ? 1 : clamp01((q - 0.3) / 0.2))

/** Which milestone is on stage in Chapter VII (-1 before the first), and how far through it. */
export function milestoneAt(w: number, count: number) {
  if (w < MILESTONES_START) return { index: -1, local: 0 }
  const span = (APPROACH_END - MILESTONES_START) / count
  const k = (Math.min(w, APPROACH_END - 1e-6) - MILESTONES_START) / span
  const index = Math.min(Math.floor(k), count - 1)
  return { index, local: k - index }
}

/**
 * How far the picture is shifted to make room for text, as fractions of the screen
 * ([x, y]: positive x moves the scene left, positive y moves it up), like lib/voyage.ts.
 * The mouth sits right of the text (desktop) or near the top (phones); while plunging
 * through, and while flying away on the far side, the view is centred; when we look
 * back from the far side, the mouth returns to its place beside the text.
 */
export function wormholeOffset(wide: boolean, w: number, t: number): [number, number] {
  const home: [number, number] = wide ? [-0.21, 0] : [0, 0.25]
  const centring = t > 0 ? 1 - smooth(clamp01((t - 0.45) / 0.3)) : smooth(clamp01((w - APPROACH_END) / 0.1))
  return [home[0] * (1 - centring), home[1] * (1 - centring)]
}