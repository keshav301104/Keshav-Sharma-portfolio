'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction, type ChromaticAberrationEffect } from 'postprocessing'
import * as THREE from 'three'
import { getChapterProgress } from '../../lib/store'

/* ------------------------------------------------------------------ *
 * Camera-lens effects applied to the finished image, like a real
 * telescope or film camera would add:
 *
 *  - Bloom:               bright things (stars, plasma) glow and bleed light
 *  - Chromatic aberration: colours split at the edges for a moment
 *                          when inflation tears space open
 *  - Noise:               fine film grain, so it feels shot, not drawn
 *  - Vignette:            edges darken, pulling your eye to the centre
 * ------------------------------------------------------------------ */

export default function Effects() {
  const aberration = useRef<ChromaticAberrationEffect>(null)
  const offset = useMemo(() => new THREE.Vector2(0, 0), [])
  const isPhone = useMemo(() => window.innerWidth < 768, [])

  useFrame(() => {
    if (!aberration.current) return
    const p = getChapterProgress('origin')
    // A burst of colour-splitting right at inflation, fading as the plasma settles.
    const burst = THREE.MathUtils.smoothstep(p, 0.045, 0.07) * (1 - THREE.MathUtils.smoothstep(p, 0.07, 0.18))
    const amount = 0.0004 + burst * 0.006
    aberration.current.offset.set(amount, amount * 0.6)
  })

  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={1.1} luminanceThreshold={0.35} luminanceSmoothing={0.3} radius={0.75} />
      <ChromaticAberration ref={aberration} offset={offset} radialModulation modulationOffset={0.2} />
      <Noise opacity={isPhone ? 0.025 : 0.045} blendFunction={BlendFunction.OVERLAY} />
      <Vignette offset={0.25} darkness={0.75} />
    </EffectComposer>
  )
}