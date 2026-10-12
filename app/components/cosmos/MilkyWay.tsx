'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getChapterProgress } from '../../lib/store'
import { BLACKBODY, NOISE, SKY } from '../../lib/glsl'

/* ------------------------------------------------------------------ *
 * The night sky for every chapter after the introduction.
 *
 * By the time planets form (Chapter III), our galaxy exists, so the
 * backdrop becomes the Milky Way as you'd see it from a dark desert:
 * a soft band of billions of stars, torn by dark dust lanes, with a
 * warm glow toward the galactic centre.
 *
 * It's painted per pixel on a huge sphere that travels with the camera,
 * so it behaves like a real sky: infinitely far away, no matter where
 * the camera flies. Stars are sized to exactly one or two pixels, so
 * they stay pin-sharp on any screen (no fuzzy dots).
 * ------------------------------------------------------------------ */

const vertexShader = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  uniform float uPix;
  varying vec3 vWorld;
  ${NOISE}
  ${BLACKBODY}
  ${SKY}
  void main() {
    vec3 d = normalize(vWorld - cameraPosition);
    gl_FragColor = vec4(milkyWay(d, uPix) * uOpacity, 1.0);
  }
`

export default function MilkyWay() {
  const mesh = useRef<THREE.Mesh>(null)
  const material = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({ uOpacity: { value: 0 }, uPix: { value: 0.001 } }), [])

  useFrame((state, delta) => {
    if (!mesh.current || !material.current) return
    // Fades in as Chapter III begins and stays for the rest of the page.
    const target = THREE.MathUtils.smoothstep(getChapterProgress('accretion'), 0, 0.12)
    const u = material.current.uniforms
    u.uOpacity.value = THREE.MathUtils.damp(u.uOpacity.value, target, 3, delta)
    mesh.current.visible = u.uOpacity.value > 0.003

    const camera = state.camera as THREE.PerspectiveCamera
    mesh.current.position.copy(camera.position)
    // The angle one screen pixel covers, so stars are always one or two pixels wide.
    u.uPix.value = THREE.MathUtils.degToRad(camera.fov) / (state.size.height * state.gl.getPixelRatio())
  })

  return (
    <mesh ref={mesh} visible={false} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[200, 48, 32]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  )
}