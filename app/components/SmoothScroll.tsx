'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCosmos } from '../lib/store'

gsap.registerPlugin(ScrollTrigger)

/**
 * Makes scrolling feel weighty and smooth (Lenis), and keeps GSAP's
 * ScrollTrigger in sync with it so every chapter knows exactly
 * how far the visitor has travelled.
 *
 * Visitors with "reduce motion" turned on get normal native scrolling.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const setGlobal = useCosmos.getState().setGlobal
    const updateGlobal = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setGlobal(max > 0 ? window.scrollY / max : 0)
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      window.addEventListener('scroll', updateGlobal, { passive: true })
      return () => window.removeEventListener('scroll', updateGlobal)
    }

    const lenis = new Lenis({
      duration: 1.4, // how long a scroll "glides" (seconds)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // ease-out-expo
      smoothWheel: true,
    })

    lenis.on('scroll', () => {
      ScrollTrigger.update()
      updateGlobal()
    })

    // Drive Lenis from GSAP's clock so both run on the exact same frame.
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}