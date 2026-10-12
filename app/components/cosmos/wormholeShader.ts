import { BLACKBODY, FAR_SKY, NOISE, SKY } from '../../lib/glsl'

/* ------------------------------------------------------------------ *
 * The wormhole's ray tracer (used by Wormhole.tsx).
 *
 * It's an "Ellis wormhole", the simplest shape a traversable wormhole can
 * have, and the starting point for the one in Interstellar. Space near it
 * is a tunnel: going inward, the sphere around you shrinks to a minimum
 * size (the throat, radius 1 here) and then grows again, in another
 * universe.
 *
 * For each pixel we follow a ray of light along the tunnel. Its
 * "impact parameter" k (how far off-centre it aims, in throat radii)
 * decides everything:
 *   k < 1  the ray squeezes through the throat → you see the OTHER universe
 *   k > 1  it swings around the throat and comes back out → you see our
 *          own sky, bent; rays that skim the throat wrap all the way round,
 *          which is why the edge shows the whole sky squashed into a ring
 *
 * How far the ray swings round is an integral along the tunnel; we add it
 * up in 24 small steps. (Physics: dφ/du = k / √(1 − k² cos² u), where u is
 * the position along the tunnel, from one far end, −π/2, to the other, +π/2.)
 * ------------------------------------------------------------------ */

const vertex = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0); // glued to the screen
  }
`

const fragment = /* glsl */ `
  uniform vec2 uRes;
  uniform mat4 uInvProj;   // the real camera's lens, inverted (pixel → direction)
  uniform mat4 uCamMatrix; // the real camera's position and orientation in the scene
  uniform vec3 uMouth;     // where the wormhole is in the scene
  uniform float uThroat;   // the throat's radius, in scene units
  uniform float uSide;     // +1: the camera is in our universe; -1: on the far side
  uniform mat3 uFar;       // the far universe's axes (its nebula lies along the third)
  uniform float uPix;
  uniform float uSpin;     // the far sky turns very slowly
  uniform float uOpacity;

  ${NOISE}
  ${BLACKBODY}
  ${SKY}
  ${FAR_SKY}

  const float PI = 3.14159265;

  // How far a ray swings round, from tunnel position a to b.
  float sweep(float k, float a, float b) {
    float h = (b - a) / 24.0;
    float s = 0.0;
    for (int i = 0; i < 24; i++) {
      float c = k * cos(a + (float(i) + 0.5) * h);
      s += k * inversesqrt(max(1.0 - c * c, 1e-4));
    }
    return s * h;
  }

  // The same for a ray that turns back at tunnel position ut. Stepping in √(u − ut)
  // instead of u keeps the sum accurate right at the turning point.
  float sweepFromTurn(float k, float ut, float b) {
    float span = sqrt(max(b - ut, 0.0));
    float h = span / 24.0;
    float s = 0.0;
    for (int i = 0; i < 24; i++) {
      float x = (float(i) + 0.5) * h;
      float c = k * cos(ut + x * x);
      s += k * inversesqrt(max(1.0 - c * c, 1e-6)) * 2.0 * x;
    }
    return s * h;
  }

  vec3 spin(vec3 v, float a) {
    float c = cos(a), s = sin(a);
    return vec3(c * v.x - s * v.y, s * v.x + c * v.y, v.z);
  }

  void main() {
    // The ray for this pixel, from the scene's real camera.
    vec2 ndc = gl_FragCoord.xy / uRes * 2.0 - 1.0;
    vec4 view = uInvProj * vec4(ndc, 1.0, 1.0);
    vec3 d = normalize(mat3(uCamMatrix) * normalize(view.xyz / view.w));

    // Where the camera is relative to the mouth, in throat radii.
    vec3 rel = uCamMatrix[3].xyz - uMouth;
    float rc = max(length(rel) / uThroat, 1.0);   // size of the sphere around the camera
    vec3 radial = normalize(rel);
    float L = sqrt(rc * rc - 1.0);                // the camera's distance along the tunnel
    bool inOurs = uSide > 0.0;

    float towardMouth = -dot(d, radial);          // cosine of the angle to the mouth
    float sinPsi = sqrt(max(1.0 - towardMouth * towardMouth, 0.0));
    vec3 across = d + towardMouth * radial;       // the part of the ray that misses the mouth
    vec3 side = length(across) > 1e-6 ? normalize(across) : vec3(1.0, 0.0, 0.0);
    float k = rc * sinPsi;                        // impact parameter, in throat radii

    // In our universe, rays that pass far from the mouth are barely bent:
    // let the scene behind show through untouched, and skip the work.
    if (inOurs && k > 9.0) discard;

    float U = atan(L);                            // the camera's tunnel position
    float phi;
    bool through = false;
    if (towardMouth < 0.0) {
      phi = sweep(k, U, 0.5 * PI);                         // heading away: a gentle bend
    } else if (k < 1.0) {
      phi = sweep(k, -0.5 * PI, U);                        // through the throat
      through = true;
    } else {
      float ut = acos(1.0 / k);                            // swings round and back out
      phi = sweepFromTurn(k, ut, U) + sweepFromTurn(k, ut, 0.5 * PI);
    }
    vec3 n = cos(phi) * radial + sin(phi) * side;          // where the ray ends up

    bool seesOurs = inOurs != through;
    vec3 colour;
    if (seesOurs) {
      colour = milkyWay(n, uPix);                          // exactly the scene's own sky, just bent
    } else {
      colour = farSky(spin(transpose(uFar) * n, uSpin), uPix);
      colour = 1.0 - exp(-colour * 1.2);
    }

    // Near the mouth this picture replaces the scene; further out it melts into it.
    float cover = inOurs ? 1.0 - smoothstep(5.0, 9.0, k) : 1.0;
    gl_FragColor = vec4(colour, cover * uOpacity);
  }
`

export const WORMHOLE_SHADER_PARTS = { vertex, fragment }