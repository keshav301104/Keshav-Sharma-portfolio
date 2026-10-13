'use client'
import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getChapterProgress } from '../../lib/store'
import { WORMHOLE_SHADER_PARTS } from './wormholeShader'
import { THROAT, WORMHOLE_AXIS, WORMHOLE_MOUTH, tunnelPoint } from '../../lib/voyage'
import { tunnelPosition, turnAround, wormholeOffset, wormholeOpacity } from '../../lib/wormhole'
import { farSkyMap, milkyWayMap } from '../../lib/bake'

/* ------------------------------------------------------------------ *
 * Chapters VII and VIII: a wormhole, and the universe beyond it.
 *
 * A wormhole doesn't look like a hole: it looks like a crystal ball.
 * Inside the sphere you see another universe (here, a vast star-forming
 * nebula); around its edge, our own sky is bent into rings, because
 * light skimming the throat wraps around it. (Ray tracer: wormholeShader.ts.)
 *
 * It hangs in the same space as the galaxy and is seen through the
 * scene's real camera, so it's already there, small, behind the project
 * plates. In these two chapters this component flies the camera:
 *
 *   VII   turn from the galaxy to the mouth, close in while the milestones
 *         appear, then plunge through the throat into the other universe
 *   VIII  drift out of the far mouth, then turn around: inside the sphere
 *         behind you now is our own Milky Way, where the page began
 *
 * On the far side the camera's position is mirrored back into our
 * coordinates (the tunnel is symmetric), and it faces away from the
 * mouth: to the ray tracer, that is exactly "the other side".
 * ------------------------------------------------------------------ */

const up = new THREE.Vector3(0, 1, 0)

export default function Wormhole() {
  const mesh = useRef<THREE.Mesh>(null)
  const material = useRef<THREE.ShaderMaterial>(null)
  const label = useRef<HTMLElement | null>(null)
  const flight = useRef({
    active: false,
    L: 45,
    yaw: 0,
    side: 1,
    position: new THREE.Vector3(),
    target: new THREE.Vector3(),
    offsetX: 0,
    offsetY: 0,
  })
  const scratch = useMemo(() => ({ v: new THREE.Vector3(), goal: new THREE.Vector3(), aim: new THREE.Vector3() }), [])
  const mouth = useMemo(() => new THREE.Vector3(...WORMHOLE_MOUTH), [])
  const axis = useMemo(() => new THREE.Vector3(...WORMHOLE_AXIS), [])
  const sideways = useMemo(() => new THREE.Vector3().crossVectors(up, axis).normalize(), [axis]) // the way the camera turns

  const gl = useThree((s) => s.gl)
  const uniforms = useMemo(() => {
    // The far universe's own axes: its nebula lies straight ahead as you come out of the far mouth.
    const z = new THREE.Vector3(...WORMHOLE_AXIS)
    const x = new THREE.Vector3().crossVectors(up, z).normalize()
    const y = new THREE.Vector3().crossVectors(z, x)
    return {
      uRes: { value: new THREE.Vector2(1, 1) },
      uInvProj: { value: new THREE.Matrix4() },
      uCamMatrix: { value: new THREE.Matrix4() },
      uMouth: { value: new THREE.Vector3(...WORMHOLE_MOUTH) },
      uThroat: { value: THROAT },
      uSide: { value: 1 },
      uFar: { value: new THREE.Matrix3().set(x.x, y.x, z.x, x.y, y.y, z.y, x.z, y.z, z.z) },
      uPix: { value: 0.001 },
      uSpin: { value: 0 },
      uOpacity: { value: 0 },
      // Both skies' soft glow, painted once (lib/bake.ts); their stars are drawn live.
      uSkyMap: { value: milkyWayMap(gl) },
      uFarMap: { value: farSkyMap(gl) },
    }
  }, [gl])

  useFrame((state, delta) => {
    if (!mesh.current || !material.current) return
    const q = getChapterProgress('projects')
    const w = getChapterProgress('wormhole')
    const t = getChapterProgress('transmission')
    const camera = state.camera as THREE.PerspectiveCamera
    const { width, height } = state.size
    const f = flight.current
    if (!label.current) label.current = document.getElementById('wormhole-home')

    // ---- Fly the camera (Chapters VII–VIII only; before that, Director.tsx does) ----
    if (w > 0 || t > 0) {
      if (!f.active) {
        // Take over smoothly from wherever the camera is now.
        f.active = true
        f.position.copy(camera.position)
        f.target.copy(camera.position).add(camera.getWorldDirection(scratch.v).multiplyScalar(60))
        f.L = Math.sqrt(Math.max(Math.pow(camera.position.distanceTo(mouth) / THROAT, 2) - 1, 0))
        f.yaw = 0
        f.offsetX = camera.view?.enabled ? camera.view.offsetX / width : 0
        f.offsetY = camera.view?.enabled ? camera.view.offsetY / height : 0
      }
      const damp = THREE.MathUtils.damp
      f.L = damp(f.L, tunnelPosition(w, t), 2.8, delta)
      f.yaw = damp(f.yaw, turnAround(t), 3, delta)
      const side = f.L >= 0 ? 1 : -1

      scratch.goal.set(...tunnelPoint(f.L))
      f.position.set(
        damp(f.position.x, scratch.goal.x, 3, delta),
        damp(f.position.y, scratch.goal.y, 3, delta),
        damp(f.position.z, scratch.goal.z, 3, delta)
      )
      // Our side: look at the mouth. Far side: look away from it (onward), turning round by `yaw`.
      if (side > 0) scratch.aim.copy(mouth)
      else scratch.aim.copy(axis).multiplyScalar(Math.cos(f.yaw)).addScaledVector(sideways, Math.sin(f.yaw)).multiplyScalar(30).add(f.position)
      if (side !== f.side) f.target.copy(scratch.aim) // crossing the throat: the mirrored view is continuous
      else
        f.target.set(
          damp(f.target.x, scratch.aim.x, 3.5, delta),
          damp(f.target.y, scratch.aim.y, 3.5, delta),
          damp(f.target.z, scratch.aim.z, 3.5, delta)
        )
      f.side = side

      camera.position.copy(f.position)
      camera.lookAt(f.target)
      camera.fov = 50
      const [ox, oy] = wormholeOffset(width >= 768, w, t)
      f.offsetX = damp(f.offsetX, ox, 3, delta)
      f.offsetY = damp(f.offsetY, oy, 3, delta)
      camera.setViewOffset(width, height, width * f.offsetX, height * f.offsetY, width, height)
      camera.updateProjectionMatrix()
    } else {
      f.active = false
      f.side = 1
    }

    // ---- Draw it ----
    const opacity = wormholeOpacity(q, w, t)
    mesh.current.visible = opacity > 0.002
    if (!mesh.current.visible) return
    const u = material.current.uniforms
    const dpr = state.gl.getPixelRatio()
    camera.updateMatrixWorld()
    u.uRes.value.set(width * dpr, height * dpr)
    u.uInvProj.value.copy(camera.projectionMatrixInverse)
    u.uCamMatrix.value.copy(camera.matrixWorld)
    u.uSide.value = f.active ? f.side : 1
    u.uOpacity.value = opacity
    u.uPix.value = THREE.MathUtils.degToRad(camera.fov) / (height * dpr)
    u.uSpin.value = state.clock.elapsedTime * 0.004

    // On the far side, once we've turned round, label the mouth: that's home.
    if (label.current) {
      const p = scratch.v.copy(mouth).project(camera)
      const x = (p.x * 0.5 + 0.5) * width
      const y = (-p.y * 0.5 + 0.5) * height
      const radius = (THROAT / Math.max(camera.position.distanceTo(mouth), 0.01)) * (height / 2 / Math.tan(THREE.MathUtils.degToRad(25)))
      label.current.style.transform = `translate(${x.toFixed(1)}px, ${(y + Math.min(radius * 1.35, height * 0.3)).toFixed(1)}px)`
      label.current.style.opacity = String(f.active && f.side < 0 ? THREE.MathUtils.smoothstep(f.yaw, 2.6, 3.1) : 0)
    }
  })

  return (
    <mesh ref={mesh} visible={false} frustumCulled={false} renderOrder={51}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={WORMHOLE_SHADER_PARTS.vertex}
        fragmentShader={WORMHOLE_SHADER_PARTS.fragment}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}