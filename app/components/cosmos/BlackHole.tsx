'use client'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getChapterProgress } from '../../lib/store'
import { BLACKHOLE_SHADER_PARTS } from './blackHoleShader'
import { PER_GROUP, blackHoleOpacity, clumpRadius, fallProgress, gathered, groupAt, swallowedCount } from '../../lib/horizon'
import { BH_CENTRE, BH_SCALE } from '../../lib/voyage'
import { milkyWayMap } from '../../lib/bake'

/* ------------------------------------------------------------------ *
 * Chapter V: you are the black hole. Your skills fall in.
 *
 * This is a real (simplified) ray tracer running on the graphics card,
 * the same idea used for the black hole in the film Interstellar:
 *
 *   For every pixel, a ray of light is traced backwards from the camera.
 *   Near the black hole, gravity bends it (Schwarzschild geometry: the
 *   bend grows with the inverse fifth power of distance). Rays that come
 *   too close fall in → the black "shadow". Rays that skim past wrap
 *   around it, which is why you see the top AND underside of the disc
 *   arching over the hole, and a thin bright "photon ring" at its edge.
 *   Rays that escape pick up the Milky Way behind, warped into an
 *   Einstein ring.
 *
 *   The black hole sits in the same 3D space as everything else and is
 *   seen through the scene's real camera, so the camera can fly to it
 *   from the planet and on to the galaxy in one continuous move. Far from
 *   the hole, where light is barely bent, the picture melts into the
 *   scene's own sky.
 *
 *   Each group of skills falls in together: six clumps of hot gas, one per
 *   skill, strung out along the orbit. They spiral in one after another,
 *   stretched into glowing streams by the tide, and plunge through the
 *   horizon, reddening and fading. Each swallow makes the photon ring flare
 *   and sends a wave of light out through the disc; the black hole grows a
 *   little with each one (see lib/voyage.ts: the camera moves in to match).
 *
 * Ray tracing is the heaviest thing on the page, so it happens in two steps:
 *   1. trace at HALF resolution, off screen (4× less work): the glowing gas,
 *      plus how far each ray of light was bent on its way past the hole
 *   2. at full resolution, stretch the gas over the screen (its soft glow
 *      hides the difference) and draw the sky behind it pin-sharp, each star
 *      moved by exactly the bend measured in step 1
 * That's what keeps the chapter smooth without blurring a single star.
 *
 * The shader itself is in blackHoleShader.ts.
 * ------------------------------------------------------------------ */

const RAY_LAYER = 1 // the ray tracer lives on its own layer, so the normal render skips it
const RAY_LAYER_MASK = new THREE.Layers()
RAY_LAYER_MASK.set(RAY_LAYER)

type Clump = { phi: number; t: number }
const smoothstep = THREE.MathUtils.smoothstep

/** A label's colour as its skill falls: white, then gold, then a dying red (light losing energy to gravity). */
function redshift(t: number) {
  const a = smoothstep(t, 0, 0.4)
  const b = smoothstep(t, 0.4, 0.8)
  const g = Math.round(255 - 45 * a - 120 * b)
  const bl = Math.round(255 - 130 * a - 60 * b)
  return `rgb(255, ${g}, ${bl})`
}

export default function BlackHole() {
  const mesh = useRef<THREE.Mesh>(null)
  const material = useRef<THREE.ShaderMaterial>(null)
  const composite = useRef<THREE.Mesh>(null)
  const compositeMaterial = useRef<THREE.ShaderMaterial>(null)
  const picture = useRef<THREE.WebGLRenderTarget | null>(null)
  const labels = useRef<(HTMLElement | null)[]>([])
  const marker = useRef<HTMLElement | null>(null)
  const core = useRef<HTMLElement | null>(null)
  const wave = useRef({ age: 10 })
  const clumps = useRef<Clump[]>(Array.from({ length: PER_GROUP }, () => ({ phi: 0, t: -1 })))
  const stage = useRef({ group: -2 })
  const flash = useRef({ value: 0, count: 0 })
  const isPhone = useMemo(() => window.innerWidth < 768, [])
  const gl = useThree((s) => s.gl)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uInvProj: { value: new THREE.Matrix4() },
      uCamMatrix: { value: new THREE.Matrix4() },
      uOrigin: { value: new THREE.Vector3(...BH_CENTRE) },
      uScale: { value: BH_SCALE },
      uSteps: { value: isPhone ? 110 : 200 },
      uFlash: { value: 0 },
      uWave: { value: new THREE.Vector2(0, 0) },
      uClumps: {
        value: Array.from({ length: PER_GROUP }, () => new THREE.Vector4()),
      },
    }),
    [isPhone]
  )
  const scratch = useMemo(
    () => ({
      v: new THREE.Vector3(),
      centre: new THREE.Vector3(...BH_CENTRE),
      clear: new THREE.Color(),
    }),
    []
  )
  const compositeUniforms = useMemo(
    () => ({
      uGas: { value: null },
      uBend: { value: null },
      uScreen: { value: new THREE.Vector2(1, 1) },
      uInvProj: { value: new THREE.Matrix4() },
      uCamMatrix: { value: new THREE.Matrix4() },
      uPix: { value: 0.001 },
      uSkyMap: { value: milkyWayMap(gl) }, // the sky behind, painted once (lib/bake.ts)
    }),
    [gl]
  )

  // The off-screen picture is freed when the page closes.
  useEffect(() => () => picture.current?.dispose(), [])

  useFrame((state, delta) => {
    if (!mesh.current || !material.current || !composite.current || !compositeMaterial.current) return
    const h = getChapterProgress('horizon')
    const opacity = blackHoleOpacity(h, getChapterProgress('projects'))
    mesh.current.visible = opacity > 0.002
    composite.current.visible = mesh.current.visible
    if (!marker.current) marker.current = document.getElementById('bh-marker')
    if (!core.current) core.current = document.getElementById('bh-core')
    for (let i = 0; i < PER_GROUP; i++) labels.current[i] ??= document.getElementById(`bh-label-${i}`)
    if (!mesh.current.visible) {
      labels.current.forEach((el) => el && (el.style.opacity = '0'))
      return
    }

    const u = material.current.uniforms
    const camera = state.camera as THREE.PerspectiveCamera
    const { width, height } = state.size
    const dpr = state.gl.getPixelRatio()
    camera.updateMatrixWorld()
    u.uTime.value = state.clock.elapsedTime
    u.uOpacity.value = opacity
    u.uInvProj.value.copy(camera.projectionMatrixInverse)
    u.uCamMatrix.value.copy(camera.matrixWorld)

    // ---- The skills: this group's six clumps, strung out along the orbit ----
    const { group } = groupAt(h)
    if (group !== stage.current.group) {
      // A new group gathers on the far side of the disc, where the light bends up over the hole and
      // the names have open sky around them; as they spiral in they swing round to the front.
      const near = Math.atan2(camera.position.z - BH_CENTRE[2], camera.position.x - BH_CENTRE[0])
      clumps.current.forEach((c, i) => {
        c.phi = near + Math.PI + 1.25 - i * 0.5
        c.t = group < 0 ? -1 : fallProgress(h, group, i)
      })
      stage.current.group = group
    }
    const appear = group < 0 ? 0 : gathered(h, group)
    // Phones have room for one name at a time: the clump leading the fall.
    const phone = width < 768
    const leader = clumps.current.findIndex((c) => c.t < 0.8)
    clumps.current.forEach((c, i) => {
      const t = group < 0 ? -1 : fallProgress(h, group, i)
      const r = clumpRadius(i, Math.max(t, 0))
      // Orbital speed grows as a clump sinks (Kepler near a black hole); falling also winds it round.
      const beta = Math.min(Math.sqrt(0.5 / Math.max(r - 1, 0.05)), 0.95)
      const wound = Math.max(0, Math.min(t, 1)) - Math.max(0, Math.min(c.t, 1))
      c.phi = (c.phi + (beta / r) * delta * 1.5 + wound * 8) % (Math.PI * 2)
      c.t = t
      const brightness = t >= 1 ? 0 : appear * (t < 0 ? 0.75 : 1 + 1.4 * Math.sin(Math.min(t, 1) * Math.PI * 0.5))
      u.uClumps.value[i].set(r, c.phi, brightness, t)

      // Its name rides along with it, reddening and stretching as it sinks, gone before the horizon.
      const el = labels.current[i]
      if (!el) return
      const p = scratch.v.set(Math.cos(c.phi) * r * BH_SCALE, 0, Math.sin(c.phi) * r * BH_SCALE)
      p.add(scratch.centre).project(camera)
      const x = (p.x * 0.5 + 0.5) * width
      const y = (-p.y * 0.5 + 0.5) * height
      const tt = Math.max(t, 0)
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
      const shown = phone ? i === leader : true
      el.style.opacity = String(shown ? appear * (t >= 1 ? 0 : 1 - smoothstep(tt, 0.45, 0.8)) : 0)
      // Near the right edge of the screen, the name flips to the clump's left so it never runs off.
      const flip = String(x > width - 170)
      if (el.dataset.flip !== flip) el.dataset.flip = flip
      const text = el.firstElementChild as HTMLElement | null
      if (text) {
        text.style.color = redshift(tt)
        text.style.letterSpacing = `${(0.12 + tt * 0.45).toFixed(3)}em`
      }
    })

    // Each swallow (scrolling forward): the photon ring flares and a wave of light rolls out through the disc.
    const swallowed = swallowedCount(h)
    if (swallowed > flash.current.count) {
      flash.current.value = 1
      wave.current.age = 0
    }
    flash.current.count = swallowed
    flash.current.value *= Math.exp(-delta * 2.2)
    u.uFlash.value = flash.current.value
    wave.current.age += delta
    u.uWave.value.set(2.5 + wave.current.age * 8, Math.exp(-wave.current.age * 1.4))

    // ---- "This is me" under the shadow, and the swallow effect on its centre ----
    const distance = camera.position.distanceTo(scratch.centre)
    const pxPerRadian = height / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)
    const shadow = ((2.6 * BH_SCALE) / distance) * pxPerRadian // the shadow's radius in pixels (2.6 × the horizon)
    const c = scratch.v.copy(scratch.centre).project(camera)
    const cx = (c.x * 0.5 + 0.5) * width
    const cy = (-c.y * 0.5 + 0.5) * height
    if (marker.current) {
      marker.current.style.transform = `translate(${cx.toFixed(1)}px, ${(cy + shadow * 2.3).toFixed(1)}px)`
      marker.current.style.opacity = String(smoothstep(h, 0.06, 0.11) * (1 - smoothstep(h, 0.88, 0.93)))
    }
    if (core.current) {
      core.current.style.transform = `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px)`
      core.current.style.setProperty('--shadow', `${(shadow * 2).toFixed(1)}px`)
    }

    // ---- Trace the black hole at half resolution, off screen ----
    const renderer = state.gl
    const scale = width < 768 ? 0.6 : 0.5
    const w = Math.max(1, Math.round(width * dpr * scale))
    const hgt = Math.max(1, Math.round(height * dpr * scale))
    if (!picture.current)
      picture.current = new THREE.WebGLRenderTarget(w, hgt, {
        count: 2, // two pictures at once: the gas, and the bend
        type: THREE.HalfFloatType,
        depthBuffer: false,
      })
    else if (picture.current.width !== w || picture.current.height !== hgt) picture.current.setSize(w, hgt)
    u.uRes.value.set(w, hgt)

    const previousTarget = renderer.getRenderTarget()
    const previousAlpha = renderer.getClearAlpha()
    renderer.getClearColor(scratch.clear)
    const background = state.scene.background
    const layers = camera.layers.mask
    state.scene.background = null // the picture starts see-through; only the black hole is drawn in it
    camera.layers.set(RAY_LAYER)
    renderer.setRenderTarget(picture.current)
    renderer.setClearColor(0x000000, 0)
    renderer.clear()
    renderer.render(state.scene, camera)
    renderer.setRenderTarget(previousTarget)
    renderer.setClearColor(scratch.clear, previousAlpha)
    camera.layers.mask = layers
    state.scene.background = background

    // ...then stretch it over the screen, with the sharp sky behind.
    const cu = compositeMaterial.current.uniforms
    cu.uGas.value = picture.current.textures[0]
    cu.uBend.value = picture.current.textures[1]
    cu.uScreen.value.set(width * dpr, height * dpr)
    cu.uInvProj.value.copy(camera.projectionMatrixInverse)
    cu.uCamMatrix.value.copy(camera.matrixWorld)
    cu.uPix.value = THREE.MathUtils.degToRad(camera.fov) / (height * dpr)
  })

  return (
    <>
      <mesh ref={mesh} visible={false} frustumCulled={false} layers={RAY_LAYER_MASK}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          ref={material}
          vertexShader={BLACKHOLE_SHADER_PARTS.vertex}
          fragmentShader={BLACKHOLE_SHADER_PARTS.fragment}
          uniforms={uniforms}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={composite} visible={false} frustumCulled={false} renderOrder={50}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          ref={compositeMaterial}
          vertexShader={BLACKHOLE_SHADER_PARTS.vertex}
          fragmentShader={BLACKHOLE_SHADER_PARTS.composite}
          uniforms={compositeUniforms}
          transparent
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    </>
  )
}