'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getChapterProgress } from '../../lib/store'
import { desiredPose, sceneOffset, type DirectedProgress } from '../../lib/voyage'

/* ------------------------------------------------------------------ *
 * The camera operator, from Chapter III onward.
 *
 * Every frame it asks lib/voyage.ts "where should the camera be for
 * this scroll position?" and glides toward that spot. The glide is a
 * smooth ease (no snapping), so fast scrolling still looks like one
 * continuous camera move, the way a crane shot would.
 *
 * It also shifts the picture aside to leave room for text: into the
 * left half on desktop, toward the top on phones.
 *
 * Before Chapter III it does nothing: the Big Bang scene owns the camera.
 * From Chapter VII it hands over to the wormhole (cosmos/Wormhole.tsx).
 * ------------------------------------------------------------------ */

const smoothstep = THREE.MathUtils.smoothstep

export default function Director() {
  const state = useRef({ active: false, position: new THREE.Vector3(), target: new THREE.Vector3(), shiftX: 0, shiftY: 0 })

  useFrame(({ camera: cam, size }, delta) => {
    const camera = cam as THREE.PerspectiveCamera
    const c = state.current
    const progress: DirectedProgress = {
      accretion: getChapterProgress('accretion'),
      orbits: getChapterProgress('orbits'),
      horizon: getChapterProgress('horizon'),
      projects: getChapterProgress('projects'),
    }

    // Before Chapter III: hand the camera back to the Big Bang scene, centred again.
    // (Checked every time, not just when this was active: jumping straight to the top
    // from the wormhole skips every chapter in between, and its offset must go too.)
    if (progress.accretion <= 0) {
      c.active = false
      if (camera.view?.enabled || camera.fov !== 50) {
        camera.clearViewOffset()
        camera.fov = 50
        camera.updateProjectionMatrix()
      }
      return
    }
    // Chapters VII–VIII: the wormhole flies the camera (cosmos/Wormhole.tsx).
    if (getChapterProgress('wormhole') > 0 || getChapterProgress('transmission') > 0) {
      c.active = false
      return
    }

    const { width, height } = size
    const wide = width >= 768
    const pose = desiredPose(progress, width / height, wide)

    if (!c.active) {
      // Pick up exactly where the camera is (and where it's looking), so nothing jumps.
      c.active = true
      c.position.copy(camera.position)
      const looking = camera.getWorldDirection(new THREE.Vector3())
      c.target.copy(camera.position).addScaledVector(looking, 60)
      c.shiftX = camera.view?.enabled ? camera.view.offsetX / width : 0
      c.shiftY = camera.view?.enabled ? camera.view.offsetY / height : 0
    }
    // Glide: the further away the goal, the faster it moves (a natural ease-out).
    const rate = 2.6
    const damp = THREE.MathUtils.damp
    c.position.set(
      damp(c.position.x, pose.position[0], rate, delta),
      damp(c.position.y, pose.position[1], rate, delta),
      damp(c.position.z, pose.position[2], rate, delta)
    )
    c.target.set(
      damp(c.target.x, pose.target[0], rate * 1.15, delta),
      damp(c.target.y, pose.target[1], rate * 1.15, delta),
      damp(c.target.z, pose.target[2], rate * 1.15, delta)
    )
    camera.position.copy(c.position)
    camera.lookAt(c.target)
    camera.fov = 50

    // Make room for the text.
    const [x, y] = sceneOffset(progress, wide)
    const enter = smoothstep(progress.accretion, 0, 0.04)
    c.shiftX = damp(c.shiftX, x * enter, 3, delta)
    c.shiftY = damp(c.shiftY, y * enter, 3, delta)
    camera.setViewOffset(width, height, width * c.shiftX, height * c.shiftY, width, height)
    camera.updateProjectionMatrix()
  })

  return null
}