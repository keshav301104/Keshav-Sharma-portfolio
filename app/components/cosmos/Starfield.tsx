'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getChapterProgress } from '../../lib/store'

/* ------------------------------------------------------------------ *
 * The distant stars on a huge sphere around the camera.
 *
 * They only fade in after the first stars ignite (origin ~0.38 → 0.55),
 * because before that there were no stars at all. From Chapter III the
 * Milky Way backdrop (MilkyWay.tsx) replaces them.
 *
 * Star colours follow real star types: hot blue (O/B), white (A/F),
 * yellow like our Sun (G), and cooler orange (K).
 * ------------------------------------------------------------------ */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aPhase;
  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aSize * uPixelRatio;
    // Atmospheric-style twinkle: each star flickers at its own speed.
    vTwinkle = 0.7 + 0.3 * sin(uTime * (0.6 + aPhase * 2.2) + aPhase * 60.0);
    vColor = aColor;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.0, d);
    float glow = pow(core, 2.5);
    if (glow < 0.01) discard;
    gl_FragColor = vec4(vColor * vTwinkle, glow * uOpacity);
  }
`

function seededRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const STAR_TYPES = [
  { color: [0.65, 0.78, 1.25], weight: 0.18 }, // hot blue
  { color: [0.95, 0.97, 1.1], weight: 0.42 }, // white
  { color: [1.1, 1.0, 0.8], weight: 0.25 }, // yellow, Sun-like
  { color: [1.15, 0.75, 0.5], weight: 0.15 }, // cool orange
]

function buildStars(count: number) {
  const rand = seededRandom(301104)
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const phases = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    // A random point on a big sphere (radius 70–110) all around the camera.
    const z = rand() * 2 - 1
    const angle = rand() * Math.PI * 2
    const ring = Math.sqrt(1 - z * z)
    const radius = 70 + rand() * 40
    positions.set([Math.cos(angle) * ring * radius, Math.sin(angle) * ring * radius, z * radius], i * 3)

    // Pick a star type by weight.
    let roll = rand()
    const type = STAR_TYPES.find((t) => (roll -= t.weight) < 0) ?? STAR_TYPES[1]
    const brightness = 0.35 + Math.pow(rand(), 3) * 1.4 // most stars faint, a few bright
    colors.set(type.color.map((c) => c * brightness), i * 3)

    sizes[i] = 1.2 + Math.pow(rand(), 4) * 4.5
    phases[i] = rand()
  }

  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  g.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
  g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  g.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
  return g
}

export default function Starfield() {
  const group = useRef<THREE.Group>(null)
  const material = useRef<THREE.ShaderMaterial>(null)
  const opacity = useRef(0)

  const geometry = useMemo(() => buildStars(window.innerWidth < 768 ? 2500 : 6000), [])
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uPixelRatio: { value: 1 }, uOpacity: { value: 0 } }),
    []
  )

  useFrame((state, delta) => {
    if (!material.current || !group.current) return
    const p = getChapterProgress('origin')
    // From Chapter III the Milky Way (MilkyWay.tsx) takes over the sky, with sharper, truer stars.
    const target = THREE.MathUtils.smoothstep(p, 0.38, 0.55) * (1 - THREE.MathUtils.smoothstep(getChapterProgress('accretion'), 0, 0.12))
    opacity.current = THREE.MathUtils.damp(opacity.current, target, 3, delta)

    const u = material.current.uniforms
    u.uTime.value = state.clock.elapsedTime
    u.uPixelRatio.value = state.gl.getPixelRatio()
    u.uOpacity.value = opacity.current

    // The sky drifts very slowly, like the Earth turning under it.
    group.current.rotation.y += delta * 0.006
    group.current.rotation.x += delta * 0.002
  })

  return (
    <group ref={group}>
      <points geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={material}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}