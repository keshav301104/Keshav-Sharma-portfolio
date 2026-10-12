'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCosmos } from '../lib/store'

gsap.registerPlugin(ScrollTrigger)

type ChapterProps = {
  id: string
  /** How tall the chapter is, in screen-heights. 4 = four scrolls long. Use 2 or more for animated chapters. */
  length?: number
  children?: React.ReactNode
}

/**
 * One chapter of the story.
 *
 * It is `length` screens tall, but its content is "sticky": it stays pinned
 * on screen while you scroll through it. The scroll distance is turned into
 * a 0 → 1 progress number, saved in the store under this chapter's id,
 * and the 3D scene + overlay text animate from that number.
 */
export default function Chapter({ id, length = 2, children }: ChapterProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const { setProgress, setActive } = useCosmos.getState()

    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top top', // chapter top hits screen top → progress 0
      end: 'bottom bottom', // chapter bottom hits screen bottom → progress 1
      onUpdate: (self) => {
        setProgress(id, self.progress)
        // The first chapter starts exactly at the top of the page, and the last ends exactly at
        // the bottom; ScrollTrigger counts both edges as "outside", so mark them here.
        if (self.progress <= 0.001 && self.start <= 1) setActive(id)
        if (self.progress >= 0.999 && self.end >= ScrollTrigger.maxScroll(window) - 2) setActive(id)
      },
      onToggle: (self) => self.isActive && setActive(id),
    })

    // Correct starting value if the page is reloaded mid-scroll.
    setProgress(id, trigger.progress)
    return () => trigger.kill()
  }, [id])

  return (
    <section ref={ref} id={id} className="relative" style={{ height: `${length * 100}vh` }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">{children}</div>
    </section>
  )
}