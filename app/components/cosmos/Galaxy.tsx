'use client'
import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getChapterProgress } from '../../lib/store'
import { GALAXY_CENTRE, GALAXY_RADIUS } from '../../lib/voyage'
import { NOISE } from '../../lib/glsl'
import { bakePlane } from '../../lib/bake'

/* ------------------------------------------------------------------ *
 * Chapter VI: a spiral galaxy, painted like a Hubble photograph.
 *
 * Real galaxies aren't made of visible dots: from this far away their
 * hundreds of billions of stars blur into smooth light. So the galaxy
 * is painted per pixel, layer by layer, the way it is in nature:
 *
 *   Disc     smooth light that fades exponentially from the centre
 *   Bulge    an old, warm-yellow core
 *   Arms     two spiral arms (a logarithmic spiral, the nautilus-shell
 *            curve), bent and branched by noise so they are never perfect,
 *            lit by clumpy clouds of young blue stars
 *   Knots    tiny pink glowing-hydrogen regions (star nurseries) and
 *            blue-white star clusters strung along the arms
 *   Dust     dark lanes along the inner edge of each arm plus wispy
 *            filaments everywhere: they dim and redden the light behind
 *            them (dust blocks blue light more than red), and hide the
 *            stars of our own sky behind the galaxy
 *
 * The galaxy is tilted to us, so it reads as a real disc in space, and
 * turns very slowly.
 * ------------------------------------------------------------------ */

const vertexShader = /* glsl */ `
  varying vec2 vPos;
  void main() {
    vPos = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// The galaxy's face, worked out pixel by pixel. This is slow, so it's painted ONCE at load
// into a flat picture (lib/bake.ts); the galaxy you see is that picture, turning slowly.
const faceShader = /* glsl */ `
  uniform float uOpacity;
  uniform float uSpin;
  varying vec2 vPos;
  ${NOISE}

  // Ridged noise: sharp creases, the shape of real dust filaments.
  float ridged(vec3 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * (1.0 - abs(noise3(p) * 2.0 - 1.0));
      p = p * 2.07 + 5.3;
      a *= 0.5;
    }
    return v;
  }

  // Small bright knots scattered on a grid of cells; \`chance\` = how many cells get one.
  float knots(vec2 p, float scale, float chance, float seed) {
    vec2 q = p * scale;
    float pixel = fwidth(q.x); // measured before any early exit (derivatives need every pixel)
    vec2 cell = floor(q);
    vec3 h = hash33(vec3(cell, seed));
    if (h.x > chance) return 0.0;
    vec2 centre = 0.2 + 0.6 * h.yz;
    vec2 d = fract(q) - centre;
    // Never smaller than about a pixel (so far-away knots don't flicker), same total light.
    float size2 = max(0.006, pixel * pixel * 0.6);
    return exp(-dot(d, d) / size2) * (0.006 / size2) * (0.5 + h.y);
  }

  void main() {
    float r = length(vPos);
    float phi = atan(vPos.y, vPos.x) + uSpin;
    vec2 p = vec2(cos(phi), sin(phi)) * r; // the turning galaxy, in its own coordinates

    // Where the spiral arms are, bent by noise so they wobble and branch like real ones.
    float warp = (fbm3(vec3(p * 0.11, 1.0)) - 0.5) * 1.8;
    float phase = phi + log(max(r, 0.6) / 2.0) * 3.6 + warp;
    float arms = pow(0.5 + 0.5 * cos(2.0 * phase), 4.0);
    float spurs = pow(0.5 + 0.5 * cos(4.0 * phase + warp * 3.0), 8.0) * 0.4 * smoothstep(5.0, 12.0, r);
    float armLight = (arms + spurs) * smoothstep(1.5, 4.0, r);

    // Smooth light: an exponential disc and a bright old bulge.
    float edge = 1.0 - smoothstep(${(GALAXY_RADIUS * 0.6).toFixed(1)}, ${GALAXY_RADIUS.toFixed(1)}, r);
    float disc = exp(-r / 6.5) * edge;
    float bulge = exp(-pow(r / 2.1, 1.1));

    // Clumpy clouds of young stars along the arms.
    float clouds = fbm3(vec3(p * 0.85, 3.0));
    float grain = fbm3(vec3(p * 3.2, 7.0));
    float young = armLight * disc * (0.35 + 1.4 * smoothstep(0.35, 0.8, clouds)) * (0.75 + 0.5 * grain);

    vec3 oldStars = vec3(1.0, 0.84, 0.64);
    vec3 youngStars = vec3(0.6, 0.74, 1.0);
    vec3 light = oldStars * (bulge * 1.5 + disc * 0.32) + youngStars * young * 1.5;

    // Star nurseries (pink hydrogen) and young clusters (blue-white), only along the arms.
    light += vec3(1.0, 0.36, 0.5) * knots(p, 1.7, 0.4 * armLight, 3.0) * disc * 3.0;
    light += vec3(0.75, 0.85, 1.0) * knots(p, 2.6, 0.3 * armLight, 9.0) * disc * 2.2;

    // Dust: lanes hugging the inner edge of each arm, plus wispy filaments everywhere.
    float lane = pow(0.5 + 0.5 * cos(2.0 * (phase + 0.42)), 7.0);
    float filaments = pow(ridged(vec3(p * 0.6 + warp, 9.0)), 5.0);
    float tau = (lane * 1.5 * (0.6 + 0.8 * clouds) + filaments * 0.35) * smoothstep(1.2, 3.5, r) * exp(-r / 11.0) * 3.2;
    float through = exp(-tau);
    light *= through;
    light *= mix(vec3(1.0), vec3(1.0, 0.78, 0.6), (1.0 - through) * 0.7); // dust reddens what it lets through

    float alpha = (1.0 - through) * 0.85 * edge;
    gl_FragColor = vec4(light * 1.25 * uOpacity, alpha * uOpacity);
  }
`

// What's drawn every frame: look up the painted face, turned by the galaxy's rotation.
const fragmentShader = /* glsl */ `
  uniform sampler2D uFace;
  uniform float uHalf;
  uniform float uOpacity;
  uniform float uSpin;
  varying vec2 vPos;
  void main() {
    float c = cos(uSpin), s = sin(uSpin);
    vec2 p = vec2(c * vPos.x - s * vPos.y, s * vPos.x + c * vPos.y);
    gl_FragColor = texture(uFace, p / (2.0 * uHalf) + 0.5) * uOpacity;
  }
`

const HALF = GALAXY_RADIUS * 1.05 // half the width of the square the galaxy is painted on

function makeGlowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255,255,255,0.8)')
  grad.addColorStop(0.2, 'rgba(255,255,255,0.22)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

export default function Galaxy() {
  const root = useRef<THREE.Group>(null)
  const material = useRef<THREE.ShaderMaterial>(null)
  const core = useRef<THREE.SpriteMaterial>(null)
  const opacity = useRef(0)

  const glow = useMemo(() => makeGlowTexture(), [])
  const gl = useThree((s) => s.gl)
  const uniforms = useMemo(() => {
    const face = bakePlane(gl, 'galaxy', faceShader, HALF, window.innerWidth < 768 ? 768 : 1024, {
      uOpacity: { value: 1 },
      uSpin: { value: 0 },
    })
    return { uFace: { value: face }, uHalf: { value: HALF }, uOpacity: { value: 0 }, uSpin: { value: 0 } }
  }, [gl])

  useFrame((state, delta) => {
    if (!root.current || !material.current || !core.current) return
    const target =
      Math.max(THREE.MathUtils.smoothstep(getChapterProgress('horizon'), 0.9, 1), getChapterProgress('projects') > 0 ? 1 : 0) *
      (1 - THREE.MathUtils.smoothstep(getChapterProgress('wormhole'), 0.85, 0.95)) * (getChapterProgress('transmission') > 0 ? 0 : 1)
    opacity.current = THREE.MathUtils.damp(opacity.current, target, 2.5, delta)
    root.current.visible = opacity.current > 0.003
    if (!root.current.visible) return

    material.current.uniforms.uOpacity.value = opacity.current
    material.current.uniforms.uSpin.value = state.clock.elapsedTime * 0.004
    // The bulge is a ball of stars, not a flat disc: a soft glow that looks round from any angle.
    core.current.opacity = opacity.current * 0.45
  })

  return (
    <group ref={root} position={GALAXY_CENTRE} rotation={[0.08, 0, -0.12]} visible={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
        <planeGeometry args={[GALAXY_RADIUS * 2.1, GALAXY_RADIUS * 2.1]} />
        <shaderMaterial
          ref={material}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          premultipliedAlpha
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <sprite scale={[9, 9, 1]} renderOrder={2}>
        <spriteMaterial
          ref={core}
          map={glow}
          color={new THREE.Color(1.0, 0.82, 0.6)}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  )
}