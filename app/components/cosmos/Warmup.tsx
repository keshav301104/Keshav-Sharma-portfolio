'use client'
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

/* ------------------------------------------------------------------ *
 * Gets every scene ready before you reach it, so chapter changes never stutter.
 *
 * Each scene (the dust disc, the planet, the black hole, the galaxy, the
 * wormhole...) runs its own program on the graphics card, a "shader".
 * Normally a shader is only compiled the first time its scene appears on
 * screen, and compiling the big ones (the black hole's ray tracer above all)
 * can freeze the page for a moment, right in the middle of a transition.
 *
 * So while you watch the Big Bang, this quietly:
 *   1. compiles every shader in the background (in parallel, where the
 *      browser supports it, so the page doesn't freeze while it happens)
 *   2. draws every scene once into a tiny off-screen picture, which also
 *      uploads all their shapes and textures to the graphics card
 * Nothing of this is ever shown.
 * ------------------------------------------------------------------ */

export default function Warmup() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)

  useEffect(() => {
    let cancelled = false
    // A tiny off-screen picture. Drawing into it (instead of the screen) also gives the
    // shaders exactly the settings they'll have for real, inside the lens-effects pipeline.
    const target = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType })

    const warm = async () => {
      const previous = gl.getRenderTarget()
      gl.setRenderTarget(target)
      const compiled = gl.compileAsync(scene, camera)
      gl.setRenderTarget(previous)
      await compiled
      if (cancelled) return

      // Show everything for one off-screen frame, then put it back exactly as it was.
      const hidden: THREE.Object3D[] = []
      scene.traverse((object) => {
        if (!object.visible) {
          hidden.push(object)
          object.visible = true
        }
      })
      gl.setRenderTarget(target)
      gl.render(scene, camera)
      gl.setRenderTarget(previous)
      hidden.forEach((object) => (object.visible = false))
    }

    // Wait one frame, so every scene has set itself up first.
    const frame = requestAnimationFrame(() => void warm())
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      target.dispose()
    }
  }, [gl, scene, camera])

  return null
}