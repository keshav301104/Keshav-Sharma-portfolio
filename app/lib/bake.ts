import * as THREE from 'three'
import { BLACKBODY, FAR_SKY, NOISE, SKY } from './glsl'

/* ------------------------------------------------------------------ *
 * Paint the slow parts of the scenery once, then reuse the picture.
 *
 * The Milky Way's glow, the far side's nebula and the galaxy's spiral are
 * made of layered noise: beautiful, but expensive to work out for every
 * pixel, every frame. They never change shape (they only turn), so at
 * load we paint each one into a texture:
 *
 *   skies    into a "cube map": six square pictures forming a box around
 *            the camera, so any viewing direction can be looked up
 *   galaxy   into one flat square picture of its face
 *
 * After that, drawing them is a single texture lookup: the pin-sharp stars
 * stay live (they're cheap), everything soft comes from the painting.
 * Each picture is painted only once and shared by every scene that uses it.
 * ------------------------------------------------------------------ */

const cache = new Map<string, THREE.Texture>()
const isPhone = () => typeof window !== 'undefined' && window.innerWidth < 768

const skyVertex = /* glsl */ `
  varying vec3 vDirection;
  void main() {
    vDirection = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/** Paint `glsl`'s `vec4 bakeGlow(vec3 direction)` into a cube map `size` pixels per face. */
function bakeCube(gl: THREE.WebGLRenderer, key: string, glsl: string, size: number) {
  const hit = cache.get(key)
  if (hit) return hit
  const target = new THREE.WebGLCubeRenderTarget(size, {
    type: THREE.HalfFloatType, // fine gradations in the faint glow, with no banding
    generateMipmaps: false,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
  })
  const material = new THREE.ShaderMaterial({
    vertexShader: skyVertex,
    fragmentShader: `
      varying vec3 vDirection;
      ${NOISE}
      ${BLACKBODY}
      ${SKY}
      ${FAR_SKY}
      ${glsl}
      void main() { gl_FragColor = bakeGlow(normalize(vDirection)); }
    `,
    side: THREE.BackSide,
    depthTest: false,
    depthWrite: false,
  })
  const geometry = new THREE.SphereGeometry(10, 64, 32)
  const scene = new THREE.Scene()
  scene.add(new THREE.Mesh(geometry, material))
  new THREE.CubeCamera(0.1, 100, target).update(gl, scene) // six snapshots from the centre
  geometry.dispose()
  material.dispose()
  cache.set(key, target.texture)
  return target.texture
}

/** The Milky Way's glow and dust, as seen from inside the galaxy. */
export const milkyWayMap = (gl: THREE.WebGLRenderer) =>
  bakeCube(gl, 'milky-way', 'vec4 bakeGlow(vec3 d) { return milkyWayGlow(d); }', isPhone() ? 384 : 512)

/** The far side's nebula. */
export const farSkyMap = (gl: THREE.WebGLRenderer) =>
  bakeCube(gl, 'far-sky', 'vec4 bakeGlow(vec3 d) { return farGlow(d); }', isPhone() ? 512 : 768)

/**
 * Paint a flat picture: `fragmentShader` receives `vPos`, the position on a square
 * running from -halfSize to +halfSize (and `uniforms`), and its colour is stored as is.
 */
export function bakePlane(
  gl: THREE.WebGLRenderer,
  key: string,
  fragmentShader: string,
  halfSize: number,
  size: number,
  uniforms: Record<string, THREE.IUniform> = {}
) {
  const hit = cache.get(key)
  if (hit) return hit
  const target = new THREE.WebGLRenderTarget(size, size, {
    type: THREE.HalfFloatType,
    generateMipmaps: false,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
  })
  const material = new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `
      varying vec2 vPos;
      void main() {
        vPos = position.xy * ${halfSize.toFixed(3)};
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader,
    uniforms,
    depthTest: false,
    depthWrite: false,
  })
  const geometry = new THREE.PlaneGeometry(2, 2)
  const scene = new THREE.Scene()
  const quad = new THREE.Mesh(geometry, material)
  quad.frustumCulled = false
  scene.add(quad)
  const previous = gl.getRenderTarget()
  gl.setRenderTarget(target)
  gl.render(scene, new THREE.Camera())
  gl.setRenderTarget(previous)
  geometry.dispose()
  material.dispose()
  cache.set(key, target.texture)
  return target.texture
}