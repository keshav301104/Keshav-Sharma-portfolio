'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getChapterProgress } from '../../lib/store'

/* ------------------------------------------------------------------ *
 * The first 380,000 years of the universe, painted on the whole screen.
 *
 * 1. Inflation      – the singularity balloons out to fill all of space.
 * 2. Plasma era     – the universe is a white-hot, OPAQUE fog of charged
 *                     particles. Light can't travel, so you can't see
 *                     through it. As space stretches, it cools:
 *                     white → yellow → orange → deep red.
 * 3. Recombination  – atoms form, the fog turns transparent, and light
 *                     travels freely for the first time. What's left is
 *                     a faint afterglow: the Cosmic Microwave Background.
 *
 * It's one rectangle covering the screen. All the detail is computed
 * per-pixel by the fragment shader using layered noise ("fbm").
 * ------------------------------------------------------------------ */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    // Ignore the camera: this rectangle is glued to the screen.
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uAspect;
  varying vec2 vUv;

  // --- Noise: smooth random values that make cloudy, natural shapes ---
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  // fbm = several layers of noise at finer and finer scales (like real turbulence).
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 6; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
    return v;
  }

  // Colour of something glowing at temperature t (1 = white-hot, 0 = dull red).
  vec3 blackbody(float t) {
    vec3 red    = vec3(0.55, 0.05, 0.03);
    vec3 orange = vec3(1.0, 0.38, 0.08);
    vec3 yellow = vec3(1.0, 0.82, 0.45);
    vec3 white  = vec3(1.0, 0.97, 0.92);
    if (t < 0.33) return mix(red, orange, t / 0.33);
    if (t < 0.66) return mix(orange, yellow, (t - 0.33) / 0.33);
    return mix(yellow, white, (t - 0.66) / 0.34);
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0); // centred, not stretched
    float r = length(p);

    // 1. Inflation: a sphere of light whose radius grows exponentially.
    float inflate = smoothstep(0.05, 0.11, uProgress);
    float radius = inflate * inflate * 2.5;

    // Space stretches, so the cloudy structures grow bigger over time.
    float zoom = 1.0 + max(uProgress - 0.05, 0.0) * 9.0;
    vec2 q = p * 3.2 / zoom;

    // Domain warping: noise that bends other noise → swirling turbulent plasma.
    vec2 warp = vec2(fbm(q + uTime * 0.05), fbm(q + vec2(5.2, 1.3) - uTime * 0.04));
    float n = fbm(q + 2.2 * warp + uTime * 0.03);

    // Ragged, boiling edge on the expanding sphere.
    float edge = radius * (0.85 + 0.3 * n);
    float inside = 1.0 - smoothstep(edge * 0.75, edge, r);

    // 2. Cooling: temperature falls from white-hot to red during the plasma era.
    float cooling = smoothstep(0.065, 0.3, uProgress);
    // Hot and cold patches: strongest while the plasma is young and violent.
    float patches = mix(1.1, 0.4, cooling);
    float temperature = clamp(0.92 - cooling + (n - 0.5) * patches, 0.0, 1.0);
    vec3 color = blackbody(temperature);

    // Brightness: blinding at the start (the bloom effect turns this into glare), dimmer as it cools.
    float brightness = mix(2.1, 0.9, cooling) * (0.55 + 0.9 * n);
    brightness += (1.0 - smoothstep(0.0, 0.12, r)) * (1.0 - cooling) * 1.5; // hottest at the centre

    // 3. Recombination: the fog turns transparent, very quickly.
    float clear = smoothstep(0.29, 0.35, uProgress);
    float fog = inside * (1.0 - clear);

    // ...leaving the faint, mottled afterglow of the CMB, which fades as we move on.
    float cmb = clear * (1.0 - smoothstep(0.36, 0.46, uProgress)) * smoothstep(0.45, 0.75, n) * 0.22;
    vec3 cmbColor = mix(vec3(0.4, 0.06, 0.05), vec3(0.85, 0.35, 0.12), n);

    // Exposure curve: very bright plasma keeps its colour instead of clipping to plain white.
    vec3 plasma = 1.0 - exp(-color * brightness * 1.15);
    vec3 finalColor = plasma * fog + cmbColor * cmb;
    float alpha = clamp(fog + cmb, 0.0, 1.0);
    if (alpha < 0.002) discard;
    gl_FragColor = vec4(finalColor / max(alpha, 0.001), alpha);
  }
`

export default function PrimordialPlasma() {
  const material = useRef<THREE.ShaderMaterial>(null)
  const mesh = useRef<THREE.Mesh>(null)
  const smoothed = useRef(0)
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uProgress: { value: 0 }, uAspect: { value: 1 } }),
    []
  )

  useFrame((state, delta) => {
    if (!material.current || !mesh.current) return
    smoothed.current = THREE.MathUtils.damp(smoothed.current, getChapterProgress('origin'), 4, delta)
    // Performance: only run this heavy per-pixel shader while the fog (or its afterglow) exists.
    mesh.current.visible = smoothed.current > 0.04 && smoothed.current < 0.48
    const u = material.current.uniforms
    u.uTime.value = state.clock.elapsedTime
    u.uProgress.value = smoothed.current
    u.uAspect.value = state.size.width / state.size.height
  })

  return (
    // renderOrder 10 = drawn last, on top of the particles, so the fog really hides them.
    <mesh ref={mesh} frustumCulled={false} renderOrder={10}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}