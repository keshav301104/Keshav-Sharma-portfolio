/* ------------------------------------------------------------------ *
 * Your earlier roles, for Chapter IV (Orbits).
 *
 * Each one is a moon circling the Importex planet. The closer the orbit,
 * the more recent the role. `orbit` controls the 3D moon: its distance
 * from the planet, the tilt of its orbit, its size and its rock colour.
 *
 * Importex itself lives in chapters/Accretion.tsx.
 * ------------------------------------------------------------------ */

export type Role = {
  id: string
  company: string
  role: string
  dates: string
  points: string[]
  stack: string[]
  letter?: { href: string; label: string }
  orbit: { radius: number; tilt: [number, number, number]; size: number; color: [number, number, number] }
}

export const EARLIER_ROLES: Role[] = [
  {
    id: 'tritone',
    company: 'Tritone Analytics',
    role: 'AI / Data Engineer Intern',
    dates: 'Jan 2026 – Mar 2026',
    points: [
      'Built LLM pipelines that normalise large, messy, unstructured datasets',
      'Deployed agent workflows that took over manual data validation',
      'Added RAG search over vector databases, served through FastAPI',
      'Cross-referenced artist catalogues against a 6.7 GB rights dataset with chunked processing',
    ],
    stack: ['LangGraph', 'FastAPI', 'Vector DBs', 'OpenAI', 'pandas'],
    letter: { href: '/tritone-lor.pdf', label: 'Letter of recommendation' },
    orbit: { radius: 2.4, tilt: [0.2, 0, 0.08], size: 0.19, color: [0.62, 0.6, 0.58] },
  },
  {
    id: 'sabudh',
    company: 'Sabudh Foundation',
    role: 'AI / Data Science Intern',
    dates: 'Jan 2025 – Apr 2025',
    points: [
      'Built machine-learning and deep-learning pipelines in TensorFlow',
      'Explored and engineered features on 100K+ records',
      'Built dashboards that cut manual analysis by 30%',
    ],
    stack: ['TensorFlow', 'Python', 'pandas', 'scikit-learn'],
    orbit: { radius: 3.3, tilt: [-0.14, 0, -0.1], size: 0.25, color: [0.66, 0.6, 0.52] },
  },
]

/** Which role is in focus at Orbits-chapter progress `o` (each gets an equal half). */
export const focusedRole = (o: number) => Math.min(EARLIER_ROLES.length - 1, Math.floor(o * EARLIER_ROLES.length))