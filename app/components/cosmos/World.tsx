'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getChapterProgress } from '../../lib/store'
import { NOISE } from '../../lib/glsl'
import { SYSTEM_CENTRE, planetCooling, planetGrowth, planetPosition } from '../../lib/voyage'

/* ------------------------------------------------------------------ *
 * The planet (Importex), from a molten speck to a living world.
 *
 * Lit by the real young star at the centre of the disc, so the day
 * side, night side and the line between them are physically placed.
 *
 *   Molten   a black crust split by glowing lava, hot enough to shine
 *            on its own (on the night side too).
 *   Cooling  the crust darkens and oceans fill the low ground.
 *   Living   continents from "domain-warped" noise (it bends coastlines
 *            the way real geology does), deserts near the tropics,
 *            forests elsewhere, ice at the poles and on high peaks.
 *            Oceans mirror the star (a sun glint) and get brighter at
 *            grazing angles (Fresnel). Clouds drift on their own winds.
 *   Air      a thin shell of atmosphere: blue on the day side, glowing
 *            orange along the sunset line, invisible at night.
 * ------------------------------------------------------------------ */

const vertexShader = /* glsl */ `
  varying vec3 vObj;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  void main() {
    vObj = position;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPos = world.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const surfaceFragment = /* glsl */ `
  uniform vec3 uSun;
  uniform float uCool;
  uniform float uTime;
  varying vec3 vObj;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  ${NOISE}

  void main() {
    vec3 p = normalize(vObj);
    vec3 N = normalize(vWorldNormal);
    vec3 L = normalize(uSun - vWorldPos);
    vec3 V = normalize(cameraPosition - vWorldPos);
    float NdotL = dot(N, L);
    float NdotV = max(dot(N, V), 0.0);
    float lat = abs(p.y);

    // Terrain height, with coastlines bent by a second layer of noise.
    vec3 warp = vec3(fbm3(p * 1.7 + 1.3), fbm3(p * 1.7 + 7.7), fbm3(p * 1.7 + 4.1));
    float h = fbm3(p * 2.2 + warp * 0.9);
    float sea = mix(0.0, 0.53, smoothstep(0.3, 0.85, uCool)); // oceans fill as the planet cools
    float land = smoothstep(sea - 0.004, sea + 0.004, h);

    // ---- Living world colours ----
    float moisture = fbm3(p * 3.1 + 20.0);
    float tropics = exp(-pow((lat - 0.32) / 0.12, 2.0));
    vec3 forest = vec3(0.05, 0.11, 0.04);
    vec3 grass = vec3(0.16, 0.2, 0.08);
    vec3 desert = vec3(0.42, 0.32, 0.19);
    vec3 rock = vec3(0.25, 0.22, 0.2);
    vec3 ground = mix(forest, grass, smoothstep(0.4, 0.6, moisture));
    ground = mix(ground, desert, smoothstep(0.45, 0.7, tropics + (0.5 - moisture)));
    ground = mix(ground, rock, smoothstep(sea + 0.12, sea + 0.2, h));
    float ice = max(smoothstep(0.8, 0.86, lat + (fbm3(p * 6.0) - 0.5) * 0.12), smoothstep(sea + 0.22, sea + 0.27, h));
    ground = mix(ground, vec3(0.86, 0.9, 0.95), ice);

    float depth = clamp((sea - h) / 0.12, 0.0, 1.0);
    vec3 ocean = mix(vec3(0.02, 0.1, 0.16), vec3(0.003, 0.02, 0.07), depth); // turquoise shallows, deep blue
    ocean = mix(ocean, vec3(0.8, 0.86, 0.92), smoothstep(0.84, 0.9, lat)); // sea ice

    // Basalt crust while cooling.
    vec3 basalt = vec3(0.05, 0.045, 0.042) + 0.04 * fbm3(p * 12.0);
    vec3 albedo = mix(basalt, ground, smoothstep(0.55, 1.0, uCool));
    albedo = mix(ocean, albedo, land);

    // Clouds: drifting bands, swirled by noise.
    vec3 cp = p + vec3(uTime * 0.006, 0.0, uTime * 0.004);
    float swirl = fbm3(cp * 2.5 + vec3(fbm3(cp * 4.0) * 1.5));
    float clouds = smoothstep(0.5, 0.78, swirl) * smoothstep(0.55, 1.0, uCool);

    // ---- Lighting from the star ----
    vec3 sunColour = vec3(1.0, 0.9, 0.78);
    float diffuse = max(NdotL, 0.0);
    vec3 colour = albedo * diffuse * sunColour * (1.0 - clouds * 0.35);

    // Sun glint on water, stronger at grazing angles.
    vec3 H = normalize(L + V);
    float fresnel = 0.02 + 0.98 * pow(1.0 - NdotV, 5.0);
    float glint = pow(max(dot(N, H), 0.0), 600.0) * 1.2 + fresnel * 0.12;
    colour += sunColour * glint * (1.0 - land) * diffuse * (1.0 - clouds) * smoothstep(0.3, 1.0, uCool);

    // Clouds lit by the star.
    colour = mix(colour, vec3(0.95) * sunColour * diffuse, clouds * 0.92);

    // Air seen through the edge of the planet: a blue haze on the day side.
    colour += vec3(0.12, 0.25, 0.55) * pow(1.0 - NdotV, 2.0) * smoothstep(-0.1, 0.4, NdotL) * smoothstep(0.5, 1.0, uCool) * 0.8;

    // ---- Molten lava: shines on its own, day or night ----
    float ridge = 1.0 - abs(fbm3(p * 4.5 + uTime * 0.03) - 0.5) * 2.0;
    vec3 lava = vec3(2.6, 0.75, 0.16) * pow(ridge, 7.0) + vec3(1.8, 0.4, 0.06) * pow(ridge, 24.0) * 3.0;
    colour += lava * (1.0 - smoothstep(0.0, 0.75, uCool)) * (land > 0.5 ? 1.0 : 0.3);

    gl_FragColor = vec4(colour, 1.0);
  }
`

const airFragment = /* glsl */ `
  uniform vec3 uSun;
  uniform float uCool;
  varying vec3 vObj;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 L = normalize(uSun - vWorldPos);
    vec3 V = normalize(cameraPosition - vWorldPos);
    float sun = dot(N, L);
    float rim = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
    // Blue where the sun is high, orange along the sunset line, nothing at night.
    vec3 sky = mix(vec3(1.0, 0.42, 0.15), vec3(0.32, 0.56, 1.0), smoothstep(-0.05, 0.3, sun));
    vec3 living = sky * rim * smoothstep(-0.15, 0.12, sun) * 1.6;
    // While molten: thick, glowing volcanic haze all round.
    vec3 molten = vec3(1.0, 0.38, 0.12) * rim * 0.9;
    vec3 colour = mix(molten, living, smoothstep(0.4, 1.0, uCool));
    gl_FragColor = vec4(colour, 1.0);
  }
`

function makeGlowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255,255,255,0.9)')
  grad.addColorStop(0.3, 'rgba(255,255,255,0.22)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

export default function World() {
  const root = useRef<THREE.Group>(null)
  const surface = useRef<THREE.Mesh>(null)
  const surfaceMaterial = useRef<THREE.ShaderMaterial>(null)
  const airMaterial = useRef<THREE.ShaderMaterial>(null)
  const ember = useRef<THREE.SpriteMaterial>(null)
  const emberSprite = useRef<THREE.Sprite>(null)
  const smoothed = useRef(0)

  const sun = useMemo(() => new THREE.Vector3(...SYSTEM_CENTRE), [])
  const surfaceUniforms = useMemo(() => ({ uSun: { value: sun }, uCool: { value: 0 }, uTime: { value: 0 } }), [sun])
  const airUniforms = useMemo(() => ({ uSun: { value: sun }, uCool: { value: 0 } }), [sun])
  const glow = useMemo(() => makeGlowTexture(), [])

  useFrame((state, delta) => {
    if (!root.current || !surface.current || !surfaceMaterial.current || !airMaterial.current || !ember.current || !emberSprite.current) return
    smoothed.current = THREE.MathUtils.damp(smoothed.current, getChapterProgress('accretion'), 4, delta)
    const a = smoothed.current
    const o = getChapterProgress('orbits')
    root.current.visible = a > 0.05 && getChapterProgress('horizon') < 0.035
    if (!root.current.visible) return

    const growth = planetGrowth(a)
    const cool = planetCooling(a)
    root.current.position.set(...planetPosition(a, o))
    root.current.scale.setScalar(0.06 + 0.94 * growth)
    surface.current.rotation.y += delta * 0.04 // a day on this world: about two and a half minutes

    surfaceMaterial.current.uniforms.uCool.value = cool
    surfaceMaterial.current.uniforms.uTime.value = state.clock.elapsedTime
    airMaterial.current.uniforms.uCool.value = cool

    // While it's a tiny molten speck, a glow marks it inside the disc.
    ember.current.opacity = THREE.MathUtils.smoothstep(a, 0.08, 0.16) * (1 - THREE.MathUtils.smoothstep(cool, 0, 0.6)) * 0.8
    emberSprite.current.scale.setScalar(3.2)
  })

  return (
    <group ref={root} visible={false}>
      <mesh ref={surface} renderOrder={4}>
        <sphereGeometry args={[1, 96, 96]} />
        <shaderMaterial ref={surfaceMaterial} vertexShader={vertexShader} fragmentShader={surfaceFragment} uniforms={surfaceUniforms} />
      </mesh>
      <mesh scale={1.04} renderOrder={5}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          ref={airMaterial}
          vertexShader={vertexShader}
          fragmentShader={airFragment}
          uniforms={airUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <sprite ref={emberSprite} renderOrder={6}>
        <spriteMaterial
          ref={ember}
          map={glow}
          color={new THREE.Color(1.0, 0.5, 0.2)}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  )
}