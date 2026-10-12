'use client'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getChapterProgress } from '../../lib/store'

/* ------------------------------------------------------------------ *
 * The matter of the universe, from the singularity to your name.
 *
 * Timeline (origin chapter progress, 0 → 1):
 *   0.00 – 0.05  Singularity: a single pulsing point of light
 *   0.05 – 0.31  Inflation + plasma era (PrimordialPlasma hides the matter)
 *   0.31 – 0.35  Recombination: the fog clears, revealing the cosmic web
 *   0.34 – 0.46  The first stars ignite inside the densest knots
 *   0.48 – 0.90  Gravity spirals everything into your name
 * Then, as Chapter II (First Light) begins, the name dissolves back into the stars.
 *
 * Each particle stores 3 places on the GPU: the singularity (0,0,0),
 * its spot in the cosmic web (aWeb), and a pixel of your name (aTarget).
 * Scroll progress blends between them inside the vertex shader.
 * ------------------------------------------------------------------ */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uTextScale;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform vec2  uMouse;
  uniform float uDissolve; // 0 = name intact, 1 = scattered back into space (Chapter II)

  attribute vec3  aTarget;
  attribute vec3  aWeb;
  attribute vec4  aRandom;
  attribute float aKind; // 0 = empty void, 1 = filament, 2 = dense knot, 3 = first star

  varying vec3  vColor;
  varying float vAlpha;

  float easeOutExpo(float x) { return x >= 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * x); }
  float easeInOutCubic(float x) { return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0; }
  vec2 rotate2d(vec2 v, float a) { float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }

  void main() {
    float isStar = step(2.5, aKind);
    float stagger = aRandom.y * 0.08;

    // Expansion (happens inside the plasma fog) and the later collapse into your name.
    float bang = clamp((uProgress - 0.05 - stagger * 0.2) / 0.26, 0.0, 1.0);
    float form = clamp((uProgress - 0.48 - stagger) / 0.34, 0.0, 1.0);
    float e = easeOutExpo(bang);
    float f = easeInOutCubic(form);

    // Space keeps stretching slowly after the bang (Hubble expansion).
    float drift = 1.0 + 0.18 * clamp((uProgress - 0.3) / 0.2, 0.0, 1.0);
    vec3 web = aWeb * e * drift;
    vec3 target = aTarget * uTextScale + vec3(0.0, 0.7, 0.0);
    vec3 pos = mix(web, target, f);

    // Spiral inward while gravity pulls the matter together (peaks mid-way).
    pos.xy = rotate2d(pos.xy, (1.0 - f) * f * 5.0 * (0.4 + aRandom.z));

    // The whole web slowly turns, so it feels three-dimensional.
    pos.xz = rotate2d(pos.xz, uTime * 0.04 * (1.0 - f) * e);

    // Gentle breathing once the name has formed.
    pos += vec3(
      sin(uTime * 0.8 + aRandom.w * 6.283),
      cos(uTime * 0.6 + aRandom.x * 6.283),
      sin(uTime * 0.7 + aRandom.y * 6.283)
    ) * 0.025 * f;

    // The cursor is a tiny gravity well that pushes matter away
    // (sized relative to the name, so it looks the same on phones and big screens).
    vec2 d = pos.xy - uMouse;
    float push = smoothstep(uTextScale * 0.09, 0.0, length(d)) * f * (1.0 - uDissolve);
    pos.xy += normalize(d + 0.0001) * push * uTextScale * 0.04;
    pos.z += push * uTextScale * 0.07;

    // Chapter II: the name dissolves, each particle drifting outward and toward the camera.
    pos += normalize(aWeb + 0.001) * uDissolve * (3.0 + aRandom.x * 9.0);
    pos.z += uDissolve * aRandom.y * 5.0;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // --- The first stars switch on one by one, at slightly different moments ---
    float ignite = 0.34 + aRandom.y * 0.12;
    float starOn = isStar * smoothstep(ignite, ignite + 0.012, uProgress);
    float flare = isStar * exp(-pow((uProgress - ignite - 0.006) * 90.0, 2.0)); // brief flash at birth
    float twinkle = 0.75 + 0.25 * sin(uTime * (2.0 + aRandom.x * 4.0) + aRandom.w * 40.0);

    float size = uSize * (0.35 + aRandom.x * 1.1) * mix(1.0, 0.7, f);
    size *= 1.0 + starOn * (1.4 + flare * 3.0) * (1.0 - f * 0.5);
    gl_PointSize = min(size * uPixelRatio * (12.0 / -mvPosition.z), 34.0);

    // --- Colour ---
    // Dark ages: cooled hydrogen gas, faint red and violet, brighter in the dense knots.
    vec3 gas = mix(vec3(0.62, 0.12, 0.17), vec3(0.32, 0.2, 0.8), step(0.6, aRandom.z));
    gas *= 0.45 + aKind * 0.32;
    // Young, massive stars burn blue-white (values above 1 make the bloom glow).
    vec3 star = vec3(1.7, 1.95, 2.8) * twinkle * (1.0 + flare * 2.5);
    vec3 color = mix(gas, star, starOn);
    // The finished name: cool starlight, with the first stars still sparkling inside it.
    vec3 named = mix(vec3(0.7, 0.88, 1.5), vec3(0.95, 0.72, 1.6), step(0.78, aRandom.w));
    named *= 1.0 + starOn * 1.2 * twinkle;
    vColor = mix(color, named, f);

    vAlpha = smoothstep(0.05, 0.1, uProgress) * (1.0 - smoothstep(0.2, 1.0, uDissolve));
  }
`

const fragmentShader = /* glsl */ `
  varying vec3  vColor;
  varying float vAlpha;

  void main() {
    // Turn each square point into a soft round glow.
    float d = length(gl_PointCoord - 0.5);
    float glow = pow(smoothstep(0.5, 0.0, d), 1.6);
    if (glow < 0.01) discard;
    gl_FragColor = vec4(vColor, glow * vAlpha);
  }
`

/* The singularity: a pinpoint that flares just before inflation tears it open. */
const glowVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const glowFragment = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  varying vec2 vUv;

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);

    float visible = 1.0 - smoothstep(0.07, 0.1, uProgress);
    float pulse = 0.8 + 0.2 * sin(uTime * 3.0);
    float flare = smoothstep(0.035, 0.07, uProgress); // the point "charges up" before it bursts

    float core = exp(-r * r * mix(12000.0, 2500.0, flare)) * (2.0 + flare * 5.0);
    float halo = exp(-r * mix(45.0, 14.0, flare)) * (0.45 + flare * 1.5);
    float hazy = exp(-r * 12.0) * 0.06;
    float light = (core + halo + hazy) * pulse * visible;

    gl_FragColor = vec4(vec3(1.0, 0.95, 0.85) * light, clamp(light, 0.0, 1.0));
  }
`

/**
 * A tiny seeded random-number generator (mulberry32).
 * Same seed → same "random" numbers, so your universe looks identical on every visit.
 */
function seededRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Draws your name on a hidden canvas and returns random pixel positions inside the letters. */
function sampleName(lines: string[], count: number, rand: () => number) {
  const W = 1024
  const H = 512
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '900 180px "Arial Black", "Helvetica Neue", Arial, sans-serif'
  lines.forEach((line, i) => {
    ctx.fillText(line, W / 2, H / 2 + (i - (lines.length - 1) / 2) * 190)
  })

  const pixels = ctx.getImageData(0, 0, W, H).data
  const filled: number[] = []
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      if (pixels[(y * W + x) * 4 + 3] > 128) filled.push(x, y)
    }
  }

  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const k = Math.floor(rand() * (filled.length / 2)) * 2
    out[i * 3] = (filled[k] + rand() * 2 - W / 2) / W // x, centred, ~-0.5..0.5
    out[i * 3 + 1] = -(filled[k + 1] + rand() * 2 - H / 2) / W // y, flipped (canvas y points down)
    out[i * 3 + 2] = (rand() - 0.5) * 0.02 // a little depth
  }
  return out
}

/**
 * Builds the cosmic web: the real shape of the universe at large scale.
 * Dense knots (where galaxies form) are joined by thin filaments of gas,
 * with huge, nearly empty voids in between.
 */
function buildParticles(count: number) {
  const rand = seededRandom(1104)
  // Gaussian ("bell curve") random number, so clumps are dense in the middle and soft at the edges.
  const gaussian = () => Math.sqrt(-2 * Math.log(rand() + 1e-9)) * Math.cos(2 * Math.PI * rand())
  // Random point inside a slightly flattened sphere.
  const pointInSpace = (maxRadius: number) => {
    const z = rand() * 2 - 1
    const angle = rand() * Math.PI * 2
    const ring = Math.sqrt(1 - z * z)
    const radius = Math.cbrt(rand()) * maxRadius
    return [Math.cos(angle) * ring * radius, Math.sin(angle) * ring * radius, z * radius * 0.7]
  }

  // 1. The knots.
  const knots = Array.from({ length: 80 }, () => pointInSpace(12))

  // 2. Filaments: connect every knot to its 2 nearest neighbours.
  const filaments: [number[], number[]][] = []
  knots.forEach((a, i) => {
    const nearest = knots
      .map((b, j) => ({ j, d: (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2 }))
      .filter(({ j }) => j !== i)
      .sort((x, y) => x.d - y.d)
      .slice(0, 2)
    nearest.forEach(({ j }) => filaments.push([a, knots[j]]))
  })

  const web = new Float32Array(count * 3)
  const random = new Float32Array(count * 4)
  const kind = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const roll = rand()
    if (roll < 0.32) {
      // Dense knot. About 1 in 9 knot particles becomes one of the first stars.
      const k = knots[Math.floor(rand() * knots.length)]
      const s = 0.18 + rand() * 0.35
      web.set([k[0] + gaussian() * s, k[1] + gaussian() * s, k[2] + gaussian() * s], i * 3)
      kind[i] = rand() < 0.11 ? 3 : 2
    } else if (roll < 0.82) {
      // Filament: a point along the line between two knots, scattered a little sideways.
      const [a, b] = filaments[Math.floor(rand() * filaments.length)]
      const t = rand()
      const s = 0.08 + rand() * 0.14
      web.set(
        [
          a[0] + (b[0] - a[0]) * t + gaussian() * s,
          a[1] + (b[1] - a[1]) * t + gaussian() * s,
          a[2] + (b[2] - a[2]) * t + gaussian() * s,
        ],
        i * 3
      )
      kind[i] = 1
    } else {
      // Thin gas drifting through the voids.
      web.set(pointInSpace(13), i * 3)
      kind[i] = 0
    }
    random.set([rand(), rand(), rand(), rand()], i * 4)
  }

  const g = new THREE.BufferGeometry()
  // "position" is required by three.js; the real positions are computed in the shader.
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  g.setAttribute('aWeb', new THREE.BufferAttribute(web, 3))
  g.setAttribute('aTarget', new THREE.BufferAttribute(sampleName(['KESHAV', 'SHARMA'], count, rand), 3))
  g.setAttribute('aRandom', new THREE.BufferAttribute(random, 4))
  g.setAttribute('aKind', new THREE.BufferAttribute(kind, 1))
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 30) // stop three.js hiding the cloud
  return g
}

export default function BigBang() {
  const particles = useRef<THREE.ShaderMaterial>(null)
  const glow = useRef<THREE.ShaderMaterial>(null)
  const points = useRef<THREE.Points>(null)
  const glowMesh = useRef<THREE.Mesh>(null)
  const smoothed = useRef(0)
  const dissolve = useRef(0)
  const mouse = useRef(new THREE.Vector2(9999, 9999)) // far away until the mouse moves

  // Fewer particles on phones so it stays smooth.
  const geometry = useMemo(() => buildParticles(window.innerWidth < 768 ? 30000 : 80000), [])

  // Starting values for the shader inputs ("uniforms"). useFrame updates them every frame.
  const particleUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uTextScale: { value: 10 },
      uPixelRatio: { value: 1 },
      uSize: { value: 3.4 },
      uMouse: { value: new THREE.Vector2(9999, 9999) },
      uDissolve: { value: 0 },
    }),
    []
  )
  const glowUniforms = useMemo(() => ({ uTime: { value: 0 }, uProgress: { value: 0 } }), [])

  // Track the mouse in "normalised" screen units (-1..1).
  // Touchscreens are skipped: a finger has no hover, so the effect would freeze in place.
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const onMove = (e: PointerEvent) => {
      mouse.current.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((state, delta) => {
    if (!particles.current || !glow.current || !points.current || !glowMesh.current) return
    const { camera, viewport, gl, clock } = state
    const time = clock.elapsedTime

    // Ease toward the real scroll value, so the motion glides instead of jumping.
    smoothed.current = THREE.MathUtils.damp(smoothed.current, getChapterProgress('origin'), 4, delta)
    const p = smoothed.current
    const hasMouse = mouse.current.x < 2

    // The name dissolves during the first part of Chapter II.
    const dissolveTarget = THREE.MathUtils.smoothstep(getChapterProgress('first-light'), 0, 0.28)
    dissolve.current = THREE.MathUtils.damp(dissolve.current, dissolveTarget, 4, delta)
    particles.current.uniforms.uDissolve.value = dissolve.current

    // Performance: stop drawing things that can't be seen any more.
    points.current.visible = dissolve.current < 0.995
    glowMesh.current.visible = p < 0.12

    const u = particles.current.uniforms
    u.uTime.value = time
    u.uProgress.value = p
    u.uPixelRatio.value = gl.getPixelRatio()
    u.uTextScale.value = Math.min(viewport.width * 0.92, 12) // name fits phones and big screens
    if (hasMouse) {
      u.uMouse.value.set((mouse.current.x * viewport.width) / 2, (mouse.current.y * viewport.height) / 2)
    }

    glow.current.uniforms.uTime.value = time
    glow.current.uniforms.uProgress.value = p

    // From Chapter III (Accretion) on, StarVoyage steers the camera, so stop here.
    if (getChapterProgress('accretion') > 0) return

    // The camera shakes for a moment as inflation tears space open.
    const shake =
      THREE.MathUtils.smoothstep(p, 0.05, 0.075) * (1 - THREE.MathUtils.smoothstep(p, 0.075, 0.2)) * 0.22
    // It pulls back as space expands, then settles; it also leans gently toward the mouse.
    const expand = THREE.MathUtils.smoothstep(p, 0.06, 0.4) - THREE.MathUtils.smoothstep(p, 0.48, 0.82)
    const leanX = hasMouse ? mouse.current.x * 0.6 : 0
    const leanY = hasMouse ? mouse.current.y * 0.4 : 0
    camera.position.x = THREE.MathUtils.damp(camera.position.x, leanX, 2, delta) + Math.sin(time * 53) * shake
    camera.position.y = THREE.MathUtils.damp(camera.position.y, leanY, 2, delta) + Math.cos(time * 41) * shake
    camera.position.z = 14 + expand * 3
    camera.lookAt(0, 0, 0)
  })

  return (
    <group>
      {/* The singularity */}
      <mesh ref={glowMesh}>
        <planeGeometry args={[30, 30]} />
        <shaderMaterial
          ref={glow}
          vertexShader={glowVertex}
          fragmentShader={glowFragment}
          uniforms={glowUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* All the matter in the universe */}
      <points ref={points} geometry={geometry}>
        <shaderMaterial
          ref={particles}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={particleUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}