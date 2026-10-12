'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useCosmos } from '../../lib/store'
import { chapterHeading, fade } from '../../lib/story'
import { GROUPS, PROJECTS, type Project } from '../../data/projects'

/* ------------------------------------------------------------------ *
 * Chapter VI: Observations (your projects).
 *
 * Astronomers keep their discoveries as "plates": one photograph, one
 * catalogue entry. Your eleven projects are laid out as plates on a
 * long horizontal strip, in front of a spiral galaxy (cosmos/Galaxy.tsx).
 * The chapter opens on the galaxy alone; then the plates glide in from
 * the right, and scrolling down slides the strip sideways, so all eleven
 * pass by in about six screens. The index at the bottom jumps straight
 * to any of them.
 *
 * The strip is moved directly (not through React) on every scroll
 * update, so it stays perfectly smooth.
 * ------------------------------------------------------------------ */

const r2 = (n: number) => Math.round(n * 100) / 100
const ARRIVE_END = 0.1 // the plates glide in over the first 10% of the chapter
const TRACK_START = 0.12
const TRACK_END = 0.94
const trackProgress = (q: number) => Math.min(1, Math.max(0, (q - TRACK_START) / (TRACK_END - TRACK_START)))
const GH_RAW = 'https://raw.githubusercontent.com/keshav301104/'

function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/25 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-white transition-colors hover:border-white hover:bg-white hover:text-black"
    >
      {children} <span aria-hidden="true">↗</span>
    </a>
  )
}

/** For GENESIS (no public screenshot): a DNA double helix, drawn with code. */
function HelixArt() {
  const points = Array.from({ length: 34 }, (_, k) => {
    const x = 10 + k * 14
    const s = Math.sin(k * 0.42)
    return { x, a: r2(80 + 46 * s), b: r2(80 - 46 * s), front: Math.cos(k * 0.42) > 0 }
  })
  const strand = (key: 'a' | 'b') => points.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p[key]}`).join(' ')
  return (
    <svg viewBox="0 0 480 160" className="h-full w-full" aria-hidden="true">
      {points.map((p) => (
        <line key={p.x} x1={p.x} x2={p.x} y1={p.a} y2={p.b} stroke={p.front ? '#ff9aa8' : '#9cc4ff'} strokeOpacity={0.45} strokeWidth={2} />
      ))}
      <path d={strand('a')} fill="none" stroke="#ffd2da" strokeWidth={2.4} />
      <path d={strand('b')} fill="none" stroke="#bcd6ff" strokeWidth={2.4} />
    </svg>
  )
}

function Plate({ project, index }: { project: Project; index: number }) {
  const group = GROUPS[project.group]
  // A gentle 3D tilt that follows the mouse.
  const tilt = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return
    const box = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - box.left) / box.width - 0.5
    const y = (e.clientY - box.top) / box.height - 0.5
    e.currentTarget.style.transform = `perspective(1200px) rotateY(${(x * 6).toFixed(2)}deg) rotateX(${(-y * 5).toFixed(2)}deg)`
  }
  const untilt = (e: React.PointerEvent<HTMLElement>) => (e.currentTarget.style.transform = '')

  return (
    <article
      onPointerMove={tilt}
      onPointerLeave={untilt}
      className="pointer-events-auto relative w-[84vw] shrink-0 border border-white/[0.12] bg-[#04050a]/70 p-4 transition-transform duration-200 ease-out md:w-[min(31vw,480px)] md:p-5"
    >
      {/* Plate corner marks, like a photographic plate holder */}
      {['-left-px -top-px border-l border-t', '-right-px -top-px border-r border-t', '-left-px -bottom-px border-b border-l', '-right-px -bottom-px border-b border-r'].map((c) => (
        <span key={c} className={`absolute h-3 w-3 border-white/60 ${c}`} />
      ))}

      <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.25em] text-white/50 md:text-[10px]">
        <span>
          Plate {String(index + 1).padStart(2, '0')} / {PROJECTS.length}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: group.colour }} />
          {group.name}
        </span>
      </div>

      <div className="relative mt-3 h-[17vh] overflow-hidden border border-white/10 bg-black md:h-[21vh]">
        {project.image ? (
          <Image
            src={GH_RAW + project.image.path}
            alt={project.image.caption}
            fill
            sizes="(max-width: 768px) 84vw, 500px"
            loading="eager"
            className="object-cover object-top transition-transform duration-700 hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center bg-[radial-gradient(ellipse_at_center,#1a0f1d,#000_70%)]">
            <HelixArt />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.6)]" />
        <p className="absolute bottom-2 left-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/70 [text-shadow:0_0_8px_#000]">
          {project.image ? project.image.caption : 'Visualisation'}
        </p>
      </div>

      <h3 className="mt-3 font-display text-3xl leading-none md:mt-4 md:text-[2.4rem]">{project.name}</h3>
      <p className="mt-2 text-sm leading-snug text-white/75 md:text-[15px]">{project.pitch}</p>

      {/* Highlights: on desktop screens tall enough to hold them */}
      <ul className="mt-3 hidden space-y-1.5 [@media(min-height:760px)]:md:block">
        {project.highlights.slice(0, 2).map((h) => (
          <li key={h} className="flex gap-2.5 text-[13px] leading-snug text-white/60">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-white/50" />
            {h}
          </li>
        ))}
      </ul>

      {project.stats && (
        <dl className="mt-3 flex gap-6">
          {project.stats.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-2xl leading-none">{s.value}</dd>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/45">{s.label}</p>
            </div>
          ))}
        </dl>
      )}

      <p className="mt-3 font-mono text-[9px] uppercase leading-relaxed tracking-[0.14em] text-sky-200/70 md:text-[10px]">{project.stack.join(' · ')}</p>
      {project.credit && <p className="mt-1 font-mono text-[10px] text-white/45">{project.credit}</p>}

      <div className="mt-3 flex flex-wrap gap-2.5 md:mt-4">
        <ArrowLink href={project.repo}>Source</ArrowLink>
        {project.demo && <ArrowLink href={project.demo}>Live demo</ArrowLink>}
      </div>
    </article>
  )
}

/** Scroll the page so plate `index` is in view. */
function jumpTo(index: number) {
  const section = document.getElementById('projects')
  if (!section) return
  const t = index / (PROJECTS.length - 1)
  const q = TRACK_START + t * (TRACK_END - TRACK_START)
  window.scrollTo({ top: section.offsetTop + q * (section.offsetHeight - window.innerHeight), behavior: 'smooth' })
}

export default function Observations() {
  const q = useCosmos((s) => s.progress.projects ?? 0)
  const track = useRef<HTMLDivElement>(null)
  const active = Math.round(trackProgress(q) * (PROJECTS.length - 1))
  const shown = fade(q, 0, 0.04, 0.96, 1)

  // Slide the strip sideways as the page scrolls (directly, every update).
  useEffect(() => {
    const move = (progress: number) => {
      const el = track.current
      if (!el) return
      const shift = Math.max(0, el.scrollWidth - window.innerWidth)
      // Glide in from the right at the start, then slide left as the page scrolls.
      const arrive = Math.min(1, progress / ARRIVE_END)
      const enter = (1 - arrive) * (1 - arrive) * (1 - arrive) * window.innerWidth
      el.style.transform = `translate3d(${(enter - trackProgress(progress) * shift).toFixed(1)}px, 0, 0)`
    }
    move(useCosmos.getState().progress.projects ?? 0)
    const unsubscribe = useCosmos.subscribe((s) => move(s.progress.projects ?? 0))
    const onResize = () => move(useCosmos.getState().progress.projects ?? 0)
    window.addEventListener('resize', onResize)
    return () => {
      unsubscribe()
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ opacity: r2(shown) }}>
      {/* A dark floor under the plates so the text never fights the galaxy */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[80vh] bg-gradient-to-t from-black/80 via-black/40 to-transparent"
        style={{ opacity: r2(Math.min(1, q / ARRIVE_END)) }}
      />

      <header className="absolute left-6 right-6 top-[9vh] md:left-[6vw] md:top-[8vh]">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-sky-200/80">{chapterHeading('projects')}</p>
        <h2 className="mt-2 font-display text-3xl leading-[1.05] md:mt-3 md:text-5xl">
          Eleven things I&apos;ve built <span className="italic text-white/60">and put in the sky.</span>
        </h2>
      </header>

      <div ref={track} className="absolute left-0 top-[22vh] flex items-start gap-5 px-6 will-change-transform md:top-[24vh] md:gap-8 md:px-[6vw]">
        {PROJECTS.map((p, i) => (
          <Plate key={p.id} project={p} index={i} />
        ))}
      </div>

      {/* Index: jump to any plate */}
      <nav
        aria-label="Projects"
        className="pointer-events-auto absolute bottom-[3vh] left-6 right-6 flex items-center gap-1 md:left-auto md:right-[7vw] md:gap-2"
      >
        {PROJECTS.map((p, i) => (
          <button
            key={p.id}
            onClick={() => jumpTo(i)}
            title={p.name}
            className={`group flex flex-1 flex-col items-start gap-1.5 md:w-11 md:flex-none ${i === active ? 'text-white' : 'text-white/35 hover:text-white/80'}`}
          >
            <span className={`block h-px w-full transition-colors ${i === active ? 'bg-white' : 'bg-white/25 group-hover:bg-white/60'}`} />
            <span className="hidden font-mono text-[10px] tabular-nums md:block">{String(i + 1).padStart(2, '0')}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}