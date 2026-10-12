'use client'
import { useId } from 'react'

/* ------------------------------------------------------------------ *
 * Your portrait as a segmented telescope mirror, inspired by the
 * James Webb Space Telescope (JWST).
 *
 * As you scroll (progress 0 → 1):
 *   0.04 – 0.38  19 gold hexagonal segments fly in and lock into place
 *   0.33 – 0.48  the gold fades and your photo appears in the segments,
 *                but each segment shows it slightly shifted (unaligned)
 *   0.38 – 0.55  the segments align, the copies merge into one sharp image
 *   ~0.56        a star flares with Webb's famous 6-pointed diffraction spikes
 *
 * That's the real story of Webb's "first light": its first images showed
 * a separate copy of a star from every segment, until engineers aligned
 * the mirrors so all the copies stacked into one.
 *
 * Everything is a single SVG, so it stays razor-sharp at any size.
 * ------------------------------------------------------------------ */

const SIZE = 52 // segment radius (centre to corner), in SVG units
const SQRT3 = Math.sqrt(3)
const EXTENT = 230 // half-width of the drawing area

/** The 19 cells of a hexagon-shaped honeycomb: the centre, a ring of 6, and a ring of 12. */
const SEGMENTS = (() => {
  const cells: { q: number; r: number; ring: number }[] = []
  for (let q = -2; q <= 2; q++) {
    for (let r = -2; r <= 2; r++) {
      const s = -q - r
      const ring = Math.max(Math.abs(q), Math.abs(r), Math.abs(s))
      if (ring <= 2) cells.push({ q, r, ring })
    }
  }
  return cells
    .map((c) => {
      // "Flat-top" hexagon grid → x/y position of each cell's centre.
      const x = SIZE * 1.5 * c.q
      const y = SIZE * SQRT3 * (c.r + c.q / 2)
      return { ...c, x, y, angle: Math.atan2(y, x) }
    })
    .sort((a, b) => b.ring - a.ring || a.angle - b.angle) // outer ring arrives first, centre last
})()

/**
 * Round to 2 decimals. Next.js draws this SVG twice: once on the server and once in the
 * browser, and the two must match exactly. Their sin/cos can differ in the 12th decimal,
 * so we round every number we put in the SVG (a hundredth of a unit is invisible anyway).
 */
const r2 = (n: number) => Math.round(n * 100) / 100

/** Corner points of one hexagon, shrunk slightly so thin dark gaps show between segments. */
const hexPoints = (cx: number, cy: number) =>
  Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 3) * k
    return `${r2(cx + SIZE * 0.95 * Math.cos(a))},${r2(cy + SIZE * 0.95 * Math.sin(a))}`
  }).join(' ')

/**
 * A repeatable pseudo-random number 0..1 for segment i (same every render, no Math.random).
 * It uses only whole-number maths (Math.imul), which gives identical results on every machine.
 */
const rnd = (i: number, salt: number) => {
  let h = Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(salt + 1, 0x85ebca6b)
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d)
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3)
const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

/** One spike of a diffraction star: a thin tapered triangle pointing right, rotated by `angle`. */
function Spike({ angle, length, width, gradient }: { angle: number; length: number; width: number; gradient: string }) {
  return (
    <polygon
      points={`0,${-width} ${length},0 0,${width}`}
      fill={`url(#${gradient})`}
      transform={`rotate(${angle})`}
    />
  )
}

export default function JwstMirror({ progress }: { progress: number }) {
  const id = useId().replace(/:/g, '') // unique ids so clip paths never clash
  const reveal = clamp01((progress - 0.33) / 0.15) // gold → photo
  const align = easeInOutCubic(clamp01((progress - 0.38) / 0.17)) // copies merge into one image
  const flare = Math.exp(-Math.pow((progress - 0.56) / 0.05, 2)) // brief bright moment
  const starGlow = Math.max(flare, progress > 0.56 ? 0.35 : 0) // stays as a faint glint afterwards

  return (
    <svg viewBox={`${-EXTENT} ${-EXTENT} ${EXTENT * 2} ${EXTENT * 2}`} className="h-auto w-full overflow-visible">
      <defs>
        {/* Webb's mirrors are coated in gold, which reflects infrared light. */}
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f8dc8c" />
          <stop offset="45%" stopColor="#d4a23c" />
          <stop offset="100%" stopColor="#7a4e10" />
        </linearGradient>
        <linearGradient id={`${id}-spike`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#bcd7ff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="30%" stopColor="#cfe2ff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#7fa8ff" stopOpacity="0" />
        </radialGradient>
        {SEGMENTS.map((s, i) => (
          <clipPath key={i} id={`${id}-seg-${i}`}>
            <polygon points={hexPoints(s.x, s.y)} />
          </clipPath>
        ))}
      </defs>

      {SEGMENTS.map((s, i) => {
        // Each segment flies in from its own random direction, spinning, then locks into place.
        const arrive = easeOutCubic(clamp01((progress - 0.04 - i * 0.008) / 0.2))
        const away = 1 - arrive
        const dir = rnd(i, 1) * Math.PI * 2
        const distance = 180 + rnd(i, 2) * 160
        const tx = r2(Math.cos(dir) * distance * away)
        const ty = r2(Math.sin(dir) * distance * away)
        const spin = r2((rnd(i, 3) - 0.5) * 140 * away)

        // Before alignment, each segment shows the photo slightly shifted: many blurry copies.
        const shiftX = r2((rnd(i, 4) - 0.5) * 70 * (1 - align))
        const shiftY = r2((rnd(i, 5) - 0.5) * 70 * (1 - align))

        return (
          <g
            key={i}
            opacity={r2(arrive)}
            transform={`translate(${tx} ${ty}) rotate(${spin} ${r2(s.x)} ${r2(s.y)})`}
          >
            <g clipPath={`url(#${id}-seg-${i})`}>
              <image
                href="/portrait.jpg"
                x={-EXTENT + shiftX}
                y={-EXTENT + shiftY}
                width={EXTENT * 2}
                height={EXTENT * 2}
                preserveAspectRatio="xMidYMid slice"
                opacity={r2(reveal)}
              />
            </g>
            <polygon
              points={hexPoints(s.x, s.y)}
              fill={`url(#${id}-gold)`}
              fillOpacity={r2((1 - reveal) * 0.95)}
              stroke="#f3cf7a"
              strokeOpacity={r2(0.9 - reveal * 0.6)}
              strokeWidth={1.2}
            />
          </g>
        )
      })}

      {/* Webb's signature star: 6 long spikes (from the hexagon shape) plus 2 faint horizontal ones. */}
      <g
        transform={`translate(${r2(EXTENT * 0.66)} ${r2(-EXTENT * 0.7)}) scale(${r2(0.4 + starGlow * 0.8)})`}
        opacity={r2(starGlow)}
      >
        <circle r={22} fill={`url(#${id}-glow)`} />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <Spike key={a} angle={a - 90} length={110} width={2.4} gradient={`${id}-spike`} />
        ))}
        <Spike angle={0} length={50} width={1.2} gradient={`${id}-spike`} />
        <Spike angle={180} length={50} width={1.2} gradient={`${id}-spike`} />
      </g>
    </svg>
  )
}

/** How aligned the mirror is right now, 0–100, for the telemetry readout. */
export const alignmentPercent = (progress: number) =>
  Math.round(easeInOutCubic(clamp01((progress - 0.38) / 0.17)) * 100)