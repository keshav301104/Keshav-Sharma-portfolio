import { swallowedCount } from './horizon'

/* ------------------------------------------------------------------ *
 * Where everything sits in space, and where the camera should be.
 *
 * Shared by the 3D scenes and the text overlays so they always agree.
 *
 *   III  Accretion    a young star inside a ringed dust disc (like the real
 *                     HL Tauri, photographed by the ALMA telescope). A planet
 *                     forms in one of the gaps; the camera dives toward it.
 *   IV   Orbits       the disc has cleared; the planet, now a living world,
 *                     and its moons, lit by that same star.
 *   V    Horizon      a black hole, out in the same space: the camera flies
 *                     from the planet to it, circles it, then flies on.
 *   VI   Observations a spiral galaxy behind the project plates.
 *   VII  Wormhole     a wormhole's mouth hangs beside the galaxy; from here
 *                     cosmos/Wormhole.tsx flies the camera into it.
 *
 * Everything shares ONE space and one camera, so every chapter change is
 * a real camera move, never a swap of pictures.
 * ------------------------------------------------------------------ */

export type Vec3 = [number, number, number]
export type Pose = { position: Vec3; target: Vec3 }

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
export const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const smooth = (x: number) => x * x * (3 - 2 * x)

const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
const blend = (a: Pose, b: Pose, t: number): Pose => ({ position: lerp3(a.position, b.position, t), target: lerp3(a.target, b.target, t) })
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const scale = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k]
const normalize = (a: Vec3): Vec3 => scale(a, 1 / Math.hypot(...a))

const TAN_HALF_FOV = Math.tan((50 / 2) * (Math.PI / 180))
/** Distance at which something `width` wide fills the usable part of the screen. */
const fitDistance = (width: number, aspect: number, wide: boolean) => (width * 1.15) / (2 * TAN_HALF_FOV * aspect * (wide ? 0.5 : 1))

/** Where the Big Bang camera leaves off. */
const HOME: Pose = { position: [0, 0, 14], target: [0, 0, 0] }

/* ------------------------ The young star system ------------------------ */

/** The young star at the heart of the dust disc. */
export const SYSTEM_CENTRE: Vec3 = [0, -1, -45]
/** Outer edge of the dust disc. */
export const DISC_RADIUS = 21
/** The planet forms in the gap at this distance from the star. */
export const PLANET_ORBIT = 9

/** How much of the planet has formed (0 → 1) at accretion progress `a`. */
export const planetGrowth = (a: number) => ease(clamp01((a - 0.14) / 0.62))
/** How far the molten planet has cooled into a living world (0 → 1). */
export const planetCooling = (a: number) => smooth(clamp01((a - 0.5) / 0.4))
/** Surface temperature in kelvin: molten rock (~1,800 K) down to Earth's average (288 K). */
export const surfaceKelvin = (a: number) => Math.round(1800 - (1800 - 288) * planetCooling(a))
/** The disc slowly clears once the planet has formed (the young star blows the gas away). */
export const discPresence = (a: number, o: number) => (1 - 0.55 * smooth(clamp01((a - 0.7) / 0.3))) * (1 - smooth(clamp01(o / 0.25)))

/** The planet's angle around the star: it creeps along its orbit as you scroll. */
const planetAngle = (a: number, o: number) => 1.95 + a * 0.22 + o * 0.08

/** Where the planet is, given accretion (`a`) and orbits (`o`) progress. */
export function planetPosition(a: number, o: number): Vec3 {
  const angle = planetAngle(a, o)
  return add(SYSTEM_CENTRE, [Math.cos(angle) * PLANET_ORBIT, 0, Math.sin(angle) * PLANET_ORBIT])
}

/** A point `d` away from `centre`, `elev` radians above the disc, `az` radians around it. */
function orbitPoint(centre: Vec3, d: number, elev: number, az: number): Vec3 {
  return add(centre, [Math.sin(az) * Math.cos(elev) * d, Math.sin(elev) * d, Math.cos(az) * Math.cos(elev) * d])
}

/**
 * The direction to look at the planet from: from the side, slightly toward the
 * star, so most of the planet is in daylight with a crisp day/night line.
 */
function planetViewDirection(planet: Vec3, turn: number): Vec3 {
  const toSun = normalize([SYSTEM_CENTRE[0] - planet[0], 0, SYSTEM_CENTRE[2] - planet[2]])
  const side: Vec3 = [-toSun[2], 0, toSun[0]] // along the orbit
  const c = Math.cos(turn)
  const s = Math.sin(turn)
  const dir = add(add(scale(toSun, 0.25 * c + 0.9 * s), scale(side, -0.9 * c - 0.2 * s)), [0, 0.32, 0])
  return normalize(dir)
}

/**
 * Chapter III: arrive at the disc, look across it, then dive toward the planet.
 */
export function accretionPose(a: number, aspect: number, wide: boolean): Pose {
  const overview: Pose = {
    position: orbitPoint(SYSTEM_CENTRE, Math.max(40, fitDistance(30, aspect, wide)), 0.5, 0.15 + a * 0.3),
    target: SYSTEM_CENTRE,
  }
  const planet = planetPosition(a, 0)
  const close: Pose = { position: add(planet, scale(planetViewDirection(planet, 0), closeDistance(wide))), target: planet }
  const arrive = ease(clamp01(a / 0.14))
  const dive = ease(clamp01((a - 0.4) / 0.48))
  return blend(blend(HOME, overview, arrive), close, dive)
}

/** How close the camera comes to the finished planet (further on phones, where the screen is narrow). */
const closeDistance = (wide: boolean) => (wide ? 5.2 : 9)

/** Chapter IV: pull back from the planet to see its moons, circling slowly. */
export function orbitsPose(o: number, aspect: number, wide: boolean): Pose {
  const planet = planetPosition(1, o)
  const out = ease(clamp01(o / 0.3))
  const near = closeDistance(wide)
  const d = near + (Math.max(8.5, fitDistance(7.2, aspect, wide)) - near) * out
  return { position: add(planet, scale(planetViewDirection(planet, o * 0.5), d)), target: planet }
}

/* ------------------------------ The black hole ------------------------------ */

/** Where the black hole sits, and how big one of its "horizon radii" is in scene units. */
export const BH_CENTRE: Vec3 = [-40, 10, -120]
export const BH_SCALE = 1.6
const ZOOM = 1 / TAN_HALF_FOV

/**
 * How far (in horizon radii) the camera circles from the black hole, so its disc
 * (about 11.5 radii across the bright part) fills the right half on desktop or the top on phones.
 * Every swallowed skill adds mass, so the hole grows and the camera ends up a little closer.
 */
function blackHoleDistance(aspect: number, wide: boolean, swallowed: number) {
  const radius = wide ? Math.min(0.92, aspect * 0.5) : Math.min(0.46, aspect * 0.88)
  return (11.5 * ZOOM) / radius / (1 + 0.008 * swallowed)
}

/**
 * Chapter V: fly from the planet to the black hole, circle it nearly edge-on
 * (like the shot in Interstellar) while the skills fall in, then fly on to the galaxy.
 */
const INTRO = 0.1 // the first 10% of Chapter V is the flight in
export function horizonPose(h: number, aspect: number, wide: boolean): Pose {
  const approach = 1 - Math.pow(1 - clamp01(h / INTRO), 3)
  const d = blackHoleDistance(aspect, wide, swallowedCount(h)) * (1 + 2.2 * (1 - approach)) * BH_SCALE
  const elevation = ((15 + 8 * (1 - approach) - 3 * h) * Math.PI) / 180
  const orbit: Pose = { position: orbitPoint(BH_CENTRE, d, elevation, 0.4 + h * 1.4), target: BH_CENTRE }
  if (h < INTRO) return blend(orbitsPose(1, aspect, wide), orbit, ease(clamp01(h / INTRO)))
  if (h > 0.9) return blend(orbit, galaxyPose(0, aspect), ease(clamp01((h - 0.9) / 0.1)))
  return orbit
}

/* ------------------------------ The galaxy ------------------------------ */

/** The spiral galaxy behind the project plates (far beyond the star system). */
export const GALAXY_CENTRE: Vec3 = [10, 22, -175]
export const GALAXY_RADIUS = 30

/** How far the camera has pulled back from the galaxy (0 = close-up opening shot, 1 = backdrop). */
const galaxyPull = (q: number) => ease(clamp01((q - 0.03) / 0.12))

/**
 * Chapter VI: open on the galaxy up close, then pull back as the plates glide in,
 * so it hangs in the upper corner behind them, drifting slowly as they scroll.
 */
export function galaxyPose(q: number, aspect: number): Pose {
  const near = aspect < 1 ? 82 : 58
  const far = aspect < 1 ? 125 : 108
  const d = near + (far - near) * galaxyPull(q) - q * 10
  // Seen from this side, our own Milky Way's band stays out of the picture.
  return { position: orbitPoint(GALAXY_CENTRE, d, 0.62 - q * 0.16, 0.5 + q * 0.7), target: GALAXY_CENTRE }
}

/* ------------------------------ The director ------------------------------ */

/** Progress of every chapter the camera director steers (0 = not reached yet, 1 = passed). */
export type DirectedProgress = { accretion: number; orbits: number; horizon: number; projects: number }

/** The camera pose the scroll position asks for. cosmos/Director.tsx glides toward it. */
export function desiredPose(p: DirectedProgress, aspect: number, wide: boolean): Pose {
  if (p.projects > 0) return galaxyPose(p.projects, aspect)
  if (p.horizon > 0) return horizonPose(p.horizon, aspect, wide)
  if (p.orbits > 0) return orbitsPose(p.orbits, aspect, wide)
  return accretionPose(p.accretion, aspect, wide)
}

/**
 * How far the picture is shifted to make room for text, as fractions of the screen:
 * [x, y], where positive x moves the scene left and positive y moves it up.
 *   III–IV  the planet sits on the left (desktop) or at the top (phones)
 *   V       the black hole sits on the right (desktop) or at the top (phones)
 *   VI      the galaxy moves to the upper right, above and behind the plates
 */
export function sceneOffset(p: DirectedProgress, wide: boolean): [number, number] {
  if (p.projects > 0 || p.horizon > 0.9) {
    const pull = galaxyPull(p.projects)
    return wide ? [-0.2 * pull, 0.27 * pull] : [0, 0.3 * pull]
  }
  // The black hole sits on the right (desktop) or near the top (phones), beside its text.
  if (p.horizon > 0) return wide ? [-0.21, 0.02] : [0, 0.25]
  const s = smooth(clamp01(p.accretion / 0.05))
  return wide ? [0.22 * s, 0] : [0, 0.2 * s]
}

/* ------------------------------ The wormhole ------------------------------ */

/** The throat's radius, in scene units. */
export const THROAT = 1.2

/**
 * Where the wormhole's mouth hangs: about 54 units from where Chapter VI's camera
 * ends up, off to the left of the galaxy (so it peeks out between the plates). `WORMHOLE_AXIS` points from the mouth
 * back toward that camera: Chapter VII flies straight down it.
 */
const lastGalaxyView = galaxyPose(1, 1.6)
const towardGalaxy = normalize([
  lastGalaxyView.target[0] - lastGalaxyView.position[0],
  lastGalaxyView.target[1] - lastGalaxyView.position[1],
  lastGalaxyView.target[2] - lastGalaxyView.position[2],
])
const sideways = normalize([-towardGalaxy[2], 0, towardGalaxy[0]]) // to the right, level with the horizon
const mouthDirection = normalize(add(add(towardGalaxy, scale(sideways, -0.75)), [0, 0.12, 0]))
export const WORMHOLE_MOUTH: Vec3 = add(lastGalaxyView.position, scale(mouthDirection, 45 * THROAT))
export const WORMHOLE_AXIS: Vec3 = scale(mouthDirection, -1)

/** The camera's position for tunnel position `L` (in throat radii; negative = the far side, mirrored). */
export function tunnelPoint(L: number): Vec3 {
  return add(WORMHOLE_MOUTH, scale(WORMHOLE_AXIS, THROAT * Math.sqrt(1 + L * L)))
}