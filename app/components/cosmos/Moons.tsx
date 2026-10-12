'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getChapterProgress } from '../../lib/store'
import { NOISE } from '../../lib/glsl'
import { SYSTEM_CENTRE, planetPosition } from '../../lib/voyage'
import { EARLIER_ROLES, focusedRole } from '../../data/experience'

/* ------------------------------------------------------------------ *
 * Chapter IV: Orbits. Your earlier roles as moons of the planet.
 *
 * Real airless moons, lit by the same star as the planet:
 *   - craters are carved one by one: a bowl with a raised rim, in two
 *     sizes, scattered by a cellular pattern (like Voronoi cells)
 *   - the surface tilts with every crater, so sunlight catches the rims
 *     and the bowls fall into shadow near the day/night line
 *   - dark lava plains ("maria") and brighter highlands, like our Moon
 *   - no air, so the day/night line is razor-sharp
 *
 * No orbit lines (space has none). Instead a targeting reticle locks on
 * to the moon in focus, like a spacecraft's tracking display; the
 * reticles live in chapters/Orbits.tsx and are moved here every frame.
 * ------------------------------------------------------------------ */

const vertexShader = /* glsl */ `
  uniform vec3 uSun;
  varying vec3 vObj;
  varying vec3 vToSun;   // direction to the star, in the moon's own coordinates
  varying vec3 vToEye;   // direction to the camera, in the moon's own coordinates
  void main() {
    vObj = position;
    vec4 world = modelMatrix * vec4(position, 1.0);
    // The moon is only rotated and scaled, so the transpose undoes the rotation.
    mat3 toObject = transpose(mat3(modelMatrix));
    vToSun = toObject * (uSun - world.xyz);
    vToEye = toObject * (cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uSeed;
  varying vec3 vObj;
  varying vec3 vToSun;
  varying vec3 vToEye;
  ${NOISE}

  // Craters at one size: each cell of space may hold one crater.
  float craterLayer(vec3 p, float scale, float chance) {
    vec3 q = p * scale;
    vec3 cell = floor(q);
    float h = 0.0;
    for (int x = -1; x <= 1; x++)
    for (int y = -1; y <= 1; y++)
    for (int z = -1; z <= 1; z++) {
      vec3 c = cell + vec3(x, y, z);
      vec3 rnd = hash33(c + uSeed);
      if (rnd.x > chance) continue;
      vec3 centre = c + 0.5 + (hash33(c + uSeed + 7.1) - 0.5) * 0.7;
      float radius = 0.2 + 0.3 * rnd.y;
      float d = length(q - centre) / radius;
      if (d > 1.6) continue;
      float bowl = -(1.0 - d * d) * step(d, 1.0);
      float rim = exp(-pow((d - 1.0) / 0.18, 2.0)) * 0.45;
      h += (bowl + rim) * (0.6 + 0.4 * rnd.z);
    }
    return h;
  }

  float terrain(vec3 p) {
    return craterLayer(p, 3.0, 0.35) * 0.06 + craterLayer(p, 8.0, 0.45) * 0.025 + fbm3(p * 10.0) * 0.012;
  }

  void main() {
    vec3 p = normalize(vObj);
    // The surface tilt from the terrain's slope (finite differences).
    float e = 0.004;
    float h0 = terrain(p);
    vec3 grad = vec3(terrain(p + vec3(e, 0, 0)) - h0, terrain(p + vec3(0, e, 0)) - h0, terrain(p + vec3(0, 0, e)) - h0) / e;
    grad -= p * dot(grad, p); // keep only the part along the surface
    vec3 N = normalize(p - grad * 1.6);
    vec3 L = normalize(vToSun);
    vec3 V = normalize(vToEye);
    float cosI = max(dot(N, L), 0.0);
    float cosE = max(dot(N, V), 0.0);
    // Moon-like lighting (Lommel-Seeliger blended with Lambert): the full disc looks evenly bright.
    float lit = mix(cosI, 2.0 * cosI / (cosI + cosE + 1e-3), 0.55);
    // A sharp shadow line where the big (smooth) sphere turns away from the star.
    lit *= smoothstep(-0.02, 0.06, dot(p, L));

    float maria = smoothstep(0.45, 0.6, fbm3(p * 1.8 + uSeed));
    vec3 albedo = uColor * mix(1.0, 0.55, maria) * (0.85 + 0.3 * fbm3(p * 22.0));
    albedo *= 1.0 + 0.6 * clamp(h0 * 12.0, -0.3, 0.6); // fresh rims are brighter

    vec3 colour = albedo * lit * vec3(1.0, 0.94, 0.86) * 1.1 + albedo * 0.006; // faint planet-shine at night
    gl_FragColor = vec4(colour, 1.0);
  }
`

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

export default function Moons() {
  const root = useRef<THREE.Group>(null)
  const moons = useRef<(THREE.Mesh | null)[]>([])
  const labels = useRef<(HTMLElement | null)[]>([])
  const focusLevel = useRef(EARLIER_ROLES.map(() => 0))
  const smoothed = useRef(0)
  const scratch = useMemo(() => ({ v: new THREE.Vector3(), w: new THREE.Vector3() }), [])
  const sun = useMemo(() => new THREE.Vector3(...SYSTEM_CENTRE), [])

  const uniforms = useMemo(
    () => EARLIER_ROLES.map((r, i) => ({ uSun: { value: sun }, uColor: { value: new THREE.Color(...r.orbit.color) }, uSeed: { value: 13.7 * (i + 1) } })),
    [sun]
  )

  useFrame((state, delta) => {
    if (!root.current) return
    smoothed.current = THREE.MathUtils.damp(smoothed.current, getChapterProgress('orbits'), 4, delta)
    const o = smoothed.current
    const show = o > 0.001 && getChapterProgress('horizon') < 0.035
    root.current.visible = show
    if (!show) {
      labels.current.forEach((el) => el && (el.style.opacity = '0'))
      return
    }

    root.current.position.set(...planetPosition(1, getChapterProgress('orbits')))
    const appear = THREE.MathUtils.smoothstep(o, 0, 0.12)
    const focus = focusedRole(o)
    const time = state.clock.elapsedTime
    const camera = state.camera as THREE.PerspectiveCamera
    const { width, height } = state.size
    const pxPerUnit = height / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)

    EARLIER_ROLES.forEach((role, i) => {
      const moon = moons.current[i]
      if (!moon) return
      const r = role.orbit.radius
      // Kepler: speed ∝ 1 / r^1.5, so the inner moon laps the outer one. Scrolling nudges them along.
      const omega = 0.16 * Math.pow(2.4 / r, 1.5)
      const angle = i * 2.6 + 0.9 + time * omega + o * 1.2
      moon.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r)
      moon.scale.setScalar(role.orbit.size * appear)
      moon.rotation.y = angle // tidally locked: always shows the planet the same face

      focusLevel.current[i] = THREE.MathUtils.damp(focusLevel.current[i], focus === i ? 1 : 0, 5, delta)
      const f = focusLevel.current[i]

      // Lock the reticle onto this moon.
      const el = labels.current[i] ?? (labels.current[i] = document.getElementById(`orbit-label-${role.id}`))
      if (!el) return
      moon.getWorldPosition(scratch.v)
      const distance = scratch.w.copy(scratch.v).sub(camera.position).length()
      scratch.v.project(camera)
      const x = (scratch.v.x * 0.5 + 0.5) * width
      const y = (-scratch.v.y * 0.5 + 0.5) * height
      const size = Math.max(26, ((role.orbit.size * 2.6) / distance) * pxPerUnit)
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
      el.style.setProperty('--s', `${size.toFixed(1)}px`)
      el.style.setProperty('--f', f.toFixed(3))
      el.style.opacity = scratch.v.z > 1 ? '0' : String(clamp01(appear) * (0.35 + 0.65 * f))
    })
  })

  return (
    <group ref={root} visible={false}>
      {EARLIER_ROLES.map((role, i) => (
        // Each orbit gets its own small tilt, so the system looks three-dimensional.
        <group key={role.id} rotation={role.orbit.tilt}>
          <mesh ref={(m) => void (moons.current[i] = m)} renderOrder={4}>
            <sphereGeometry args={[1, 64, 64]} />
            <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms[i]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}