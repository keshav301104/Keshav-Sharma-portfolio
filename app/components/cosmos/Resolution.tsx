'use client'
import { useFrame } from '@react-three/fiber'
import { getChapterProgress } from '../../lib/store'

/* ------------------------------------------------------------------ *
 * Keeps the frame rate smooth during the heaviest chapters.
 *
 * The black hole (V), the wormhole (VII) and the far side (VIII) are ray
 * traced: every pixel follows a ray of light through curved space. On a
 * sharp "retina" screen that's 3–4× more pixels to trace, so during those
 * chapters the canvas draws 1 pixel per CSS pixel (the glow hides the
 * difference); everywhere else it goes back to full sharpness.
 *
 * It lives in one place, so two scenes never fight over the setting.
 * ------------------------------------------------------------------ */

export default function Resolution() {
  useFrame((state) => {
    const horizon = getChapterProgress('horizon')
    const heavy = (horizon > 0 && horizon < 1) || getChapterProgress('wormhole') > 0
    const wanted = heavy ? 1 : state.viewport.initialDpr
    if (state.viewport.dpr !== wanted) state.setDpr(wanted)
  })
  return null
}