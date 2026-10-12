'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getChapterProgress } from '../../lib/store'
import { NOISE } from '../../lib/glsl'
import { DISC_RADIUS, PLANET_ORBIT, SYSTEM_CENTRE, discPresence, planetGrowth, planetPosition } from '../../lib/voyage'

/* ------------------------------------------------------------------ *
 * Chapter III: a newborn star inside its planet-forming disc.
 *
 * Modelled on HL Tauri, the young star photographed by the ALMA
 * telescope in 2014: a smooth disc of dust striped with bright rings
 * and dark gaps. Each gap is swept clean by a young planet.
 *
 *   Disc    per-pixel shader: dust density falls off with distance, the
 *           rings and gaps are carved into it, and starlight warms the
 *           inner disc (white-gold) while the outer disc stays cold (rust).
 *           Dense dust blocks the stars behind it; the gaps let them through.
 *           Fine dust streaks orbit at Kepler speed (inner faster).
 *   Wake    the planet in the 4th gap drags a spiral wave through the
 *           dust, and the gap widens as the planet grows: a real effect.
 *   Grains  a thin layer of floating grains, so the camera feels the
 *           depth as it dives in.
 *   Star    a young, still-contracting star: limb-darkened, too bright
 *           to look at, with faint jets shooting out of both poles.
 *
 * The planet itself is cosmos/World.tsx.
 * ------------------------------------------------------------------ */

// Gaps in the dust: [radius, width, depth]. The 4th (index 3) is the planet's.
const GAPS: [number, number, number][] = [
  [2.1, 0.22, 0.55],
  [3.5, 0.3, 0.7],
  [5.3, 0.35, 0.6],
  [PLANET_ORBIT, 0.55, 0.4],
  [12.2, 0.42, 0.7],
  [14.8, 0.5, 0.6],
  [17.4, 0.55, 0.55],
]

const discVertex = /* glsl */ `
  varying vec2 vPos;
  void main() {
    vPos = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const discFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec2 uPlanet;      // planet position in the disc's own coordinates
  uniform float uGrowth;     // how much of the planet has formed
  uniform vec3 uGaps[7];
  varying vec2 vPos;
  ${NOISE}

  void main() {
    float r = length(vPos);
    float phi = atan(vPos.y, vPos.x);

    // Dust density: dense inside, thinning outward, with a soft outer edge and an inner hole.
    float density = pow(r / 4.0, -0.7) * exp(-pow(r / ${DISC_RADIUS.toFixed(1)} * 1.15, 4.0)) * smoothstep(0.55, 1.2, r);

    // Carve the gaps. The planet's gap widens and deepens as the planet gathers mass.
    for (int i = 0; i < 7; i++) {
      vec3 g = uGaps[i];
      float width = g.y, depth = g.z;
      if (i == 3) { width *= 0.5 + 0.9 * uGrowth; depth = 0.25 + 0.7 * uGrowth; }
      density *= 1.0 - depth * exp(-pow((r - g.x) / width, 2.0));
    }

    // Fine streaks of dust, each orbiting at its own Kepler speed, so they slowly shear.
    float omega = 0.9 / pow(max(r, 0.5), 1.5);
    float a = phi + uTime * omega * 0.12;
    vec3 q = vec3(cos(a) * 1.6, sin(a) * 1.6, r * 3.2);
    float streaks = 0.82 + 0.3 * (fbm3(q) - 0.5) + 0.12 * (noise3(q * vec3(2.5, 2.5, 6.0)) - 0.5);
    density *= streaks;

    // The planet's spiral wake: leading inside its orbit, trailing outside.
    float rp = length(uPlanet);
    float pp = atan(uPlanet.y, uPlanet.x);
    float dphi = phi - (pp + 2.4 * (r - rp) / rp);
    dphi = mod(dphi + 3.14159, 6.28318) - 3.14159;
    float wake = exp(-pow(dphi / 0.12, 2.0)) * exp(-abs(r - rp) / 3.0) * smoothstep(0.3, 1.2, abs(r - rp));
    density += wake * uGrowth * 0.35;
    // The planet's own pocket: its gravity has cleared the dust right around it.
    density *= mix(1.0, smoothstep(0.6, 2.4, length(vPos - uPlanet)), uGrowth);

    // Starlight heats the inner disc: white-gold near the star, rust and umber far out.
    vec3 hot = vec3(1.0, 0.86, 0.62);
    vec3 warm = vec3(0.92, 0.5, 0.24);
    vec3 cold = vec3(0.42, 0.17, 0.09);
    vec3 colour = mix(hot, warm, smoothstep(0.8, 6.0, r));
    colour = mix(colour, cold, smoothstep(6.0, 17.0, r));
    float light = 1.6 / (0.6 + r * 0.55); // illumination drops with distance from the star

    float alpha = clamp(density * 0.75, 0.0, 0.92) * uOpacity;
    vec3 emission = colour * density * light * 0.42 * uOpacity;
    // Premultiplied: dense dust glows AND hides what's behind it.
    gl_FragColor = vec4(emission, alpha);
  }
`

const grainVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uOpacity;
  attribute vec3 aOrbit; // radius, start angle, height
  attribute float aSize;
  varying float vAlpha;
  varying vec3 vColour;
  void main() {
    float r = aOrbit.x;
    float a = aOrbit.y + uTime * 0.9 / pow(r, 1.5) * 0.12;
    vec4 mv = modelViewMatrix * vec4(cos(a) * r, aOrbit.z, sin(a) * r, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(aSize * uPixelRatio * 26.0 / -mv.z, 0.6, 5.0);
    vAlpha = uOpacity * smoothstep(0.6, 1.6, gl_PointSize) * 0.55;
    vColour = mix(vec3(1.0, 0.8, 0.6), vec3(0.75, 0.42, 0.25), smoothstep(2.0, 14.0, r));
  }
`

const grainFragment = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColour;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = (1.0 - smoothstep(0.1, 0.5, d)) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColour * a, a);
  }
`

const starVertex = /* glsl */ `
  varying vec3 vNormalView;
  varying vec3 vObj;
  void main() {
    vObj = position;
    vNormalView = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const starFragment = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormalView;
  varying vec3 vObj;
  ${NOISE}
  void main() {
    float mu = clamp(vNormalView.z, 0.0, 1.0);
    // Limb darkening: the edge of a star is cooler and dimmer than its centre.
    float limb = 0.4 + 0.6 * pow(mu, 0.55);
    // Boiling convection cells on the surface.
    float cells = 0.85 + 0.3 * fbm3(normalize(vObj) * 7.0 + uTime * 0.15);
    vec3 colour = mix(vec3(1.6, 0.75, 0.32), vec3(2.6, 2.1, 1.6), pow(mu, 0.8));
    gl_FragColor = vec4(colour * limb * cells * 1.6, 1.0);
  }
`

const jetVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const jetFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;
  ${NOISE}
  void main() {
    float y = abs(vUv.y - 0.5) * 2.0;        // 0 at the star, 1 at the jet's tip
    float x = (vUv.x - 0.5) * 2.0;
    float width = 0.08 + 0.3 * y;            // the jet slowly widens
    float core = exp(-pow(x / width, 2.0));
    // Knots: blobs of shocked gas racing outward.
    float knots = 0.55 + 0.9 * pow(noise3(vec3(y * 9.0 - uTime * 0.5, x * 2.0, 1.3)), 2.0);
    float fadeOut = (1.0 - y) * smoothstep(0.0, 0.08, y);
    vec3 colour = mix(vec3(1.0, 0.45, 0.55), vec3(0.6, 0.7, 1.0), y); // glowing hydrogen, then cooler
    float a = core * knots * fadeOut * uOpacity * 0.1;
    gl_FragColor = vec4(colour * a, a);
  }
`

function seeded(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
}

/** Floating grains: more where the dust is dense, very few inside the gaps. */
function buildGrains(count: number) {
  const rand = seeded(1104)
  const orbit = new Float32Array(count * 3)
  const size = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    let r = 1
    for (let tries = 0; tries < 8; tries++) {
      r = 0.9 + Math.pow(rand(), 1.4) * (DISC_RADIUS - 1)
      const inGap = GAPS.some(([g, w]) => Math.abs(r - g) < w * 0.9)
      if (!inGap) break
    }
    const flare = 0.035 * r // discs flare: thicker further out
    orbit.set([r, rand() * Math.PI * 2, (rand() + rand() + rand() - 1.5) * flare], i * 3)
    size[i] = 0.4 + Math.pow(rand(), 3) * 1.6
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  g.setAttribute('aOrbit', new THREE.BufferAttribute(orbit, 3))
  g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), DISC_RADIUS + 2)
  return g
}

function makeGlowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.12, 'rgba(255,255,255,0.45)')
  grad.addColorStop(0.4, 'rgba(255,255,255,0.08)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

export default function DustDisc() {
  const root = useRef<THREE.Group>(null)
  const discMaterial = useRef<THREE.ShaderMaterial>(null)
  const grainMaterial = useRef<THREE.ShaderMaterial>(null)
  const starMaterial = useRef<THREE.ShaderMaterial>(null)
  const jetMaterial = useRef<THREE.ShaderMaterial>(null)
  const glow = useRef<THREE.SpriteMaterial>(null)
  const smoothed = useRef(0)

  const grains = useMemo(() => buildGrains(window.innerWidth < 768 ? 5000 : 12000), [])
  const glowTexture = useMemo(() => makeGlowTexture(), [])
  const discUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uPlanet: { value: new THREE.Vector2() },
      uGrowth: { value: 0 },
      uGaps: { value: GAPS.map((g) => new THREE.Vector3(...g)) },
    }),
    []
  )
  const grainUniforms = useMemo(() => ({ uTime: { value: 0 }, uPixelRatio: { value: 1 }, uOpacity: { value: 0 } }), [])
  const starUniforms = useMemo(() => ({ uTime: { value: 0 } }), [])
  const jetUniforms = useMemo(() => ({ uTime: { value: 0 }, uOpacity: { value: 0 } }), [])

  useFrame((state, delta) => {
    if (!root.current || !discMaterial.current || !grainMaterial.current || !starMaterial.current || !jetMaterial.current || !glow.current) return
    smoothed.current = THREE.MathUtils.damp(smoothed.current, getChapterProgress('accretion'), 4, delta)
    const a = smoothed.current
    const o = getChapterProgress('orbits')
    // Drawn from Chapter III until the black hole takes over the screen in Chapter V.
    root.current.visible = a > 0.001 && getChapterProgress('horizon') < 0.035
    if (!root.current.visible) return

    const time = state.clock.elapsedTime
    const appear = THREE.MathUtils.smoothstep(a, 0.02, 0.12)
    const disc = appear * discPresence(a, o)
    const growth = planetGrowth(a)

    const d = discMaterial.current.uniforms
    d.uTime.value = time
    d.uOpacity.value = disc
    d.uGrowth.value = growth
    // The planet in the disc's own flat coordinates (the disc mesh is laid flat, so world z flips to -y).
    const p = planetPosition(a, o)
    d.uPlanet.value.set(p[0] - SYSTEM_CENTRE[0], -(p[2] - SYSTEM_CENTRE[2]))

    const g = grainMaterial.current.uniforms
    g.uTime.value = time
    g.uPixelRatio.value = state.gl.getPixelRatio()
    g.uOpacity.value = disc

    starMaterial.current.uniforms.uTime.value = time
    jetMaterial.current.uniforms.uTime.value = time
    jetMaterial.current.uniforms.uOpacity.value = appear * (1 - THREE.MathUtils.smoothstep(o, 0, 0.2))
    glow.current.opacity = appear
  })

  return (
    <group ref={root} position={SYSTEM_CENTRE} visible={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
        <ringGeometry args={[0.5, DISC_RADIUS + 2, 256, 1]} />
        <shaderMaterial
          ref={discMaterial}
          vertexShader={discVertex}
          fragmentShader={discFragment}
          uniforms={discUniforms}
          transparent
          premultipliedAlpha
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <points geometry={grains} renderOrder={2}>
        <shaderMaterial
          ref={grainMaterial}
          vertexShader={grainVertex}
          fragmentShader={grainFragment}
          uniforms={grainUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* The young star */}
      <mesh>
        <sphereGeometry args={[0.38, 48, 48]} />
        <shaderMaterial ref={starMaterial} vertexShader={starVertex} fragmentShader={starFragment} uniforms={starUniforms} />
      </mesh>
      <sprite scale={[7, 7, 1]} renderOrder={3}>
        <spriteMaterial
          ref={glow}
          map={glowTexture}
          color={new THREE.Color(1.0, 0.72, 0.45)}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      {/* Twin jets along the star's spin axis: two crossed planes so they read from any angle */}
      {[0, Math.PI / 2].map((turn) => (
        <mesh key={turn} rotation={[0, turn, 0]} renderOrder={3}>
          <planeGeometry args={[2.4, 16]} />
          <shaderMaterial
            ref={turn === 0 ? jetMaterial : undefined}
            vertexShader={jetVertex}
            fragmentShader={jetFragment}
            uniforms={jetUniforms}
            transparent
            premultipliedAlpha
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}