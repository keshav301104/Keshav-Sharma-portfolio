import { BLACKBODY, NOISE, SKY, SKY_FAST } from '../../lib/glsl'
import { PER_GROUP } from '../../lib/horizon'

/* ------------------------------------------------------------------ *
 * The black hole's ray tracer (used by BlackHole.tsx).
 *
 * Units: the event horizon has radius 1. Then:
 *   photon sphere   r = 1.5   (light can circle the hole here)
 *   shadow          ≈ 2.6     (how big the black disc looks)
 *   inner disc edge r = 3     (closer in, gas can't orbit; it plunges)
 *
 * Each skill is a clump of hot gas. As it sinks, the black hole's tide
 * stretches it along its orbit and peels off a glowing stream behind it
 * ("spaghettification"). Each swallow sends a flare wave out through the disc.
 *
 * The bending rule (for light near a non-spinning black hole) is
 *   acceleration = -1.5 · h² · position / r⁵
 * where h is the ray's angular momentum, which stays constant.
 * ------------------------------------------------------------------ */

const vertex = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0); // glued to the screen
  }
`

const fragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec2 uRes;
  uniform mat4 uInvProj;   // the real camera's lens, inverted (pixel → direction)
  uniform mat4 uCamMatrix; // the real camera's position and orientation in the scene
  uniform vec3 uOrigin;    // where the black hole is in the scene
  uniform float uScale;    // scene units per horizon radius
  uniform int uSteps;
  uniform float uFlash;
  uniform vec2 uWave;                  // flare wave: radius, strength
  uniform vec4 uClumps[${PER_GROUP}];  // orbit radius, angle, brightness, fall progress (0 → 1)
  layout(location = 1) out highp vec4 pc_fragBend; // the second output (see the end of main)

  ${NOISE}
  ${BLACKBODY}

  const float R_IN = 3.0;
  const float R_OUT = 14.0;

  // The light given off where the ray crosses the disc. Returns colour (already
  // weighted by how opaque the gas is) and opacity.
  vec4 discLight(vec3 hit, vec3 rayDir) {
    float r = length(hit.xz);
    float phi = atan(hit.z, hit.x);

    // Orbital speed (fraction of light speed) for a circular orbit, as seen locally.
    float beta = min(sqrt(0.5 / max(r - 1.0, 0.05)), 0.95);
    float gamma = inversesqrt(1.0 - beta * beta);
    vec3 orbit = normalize(vec3(-hit.z, 0.0, hit.x));
    // Doppler: gas moving toward us looks brighter and bluer.
    float doppler = 1.0 / (gamma * (1.0 - beta * dot(orbit, -rayDir)));
    // Gravitational redshift: light loses energy climbing out of the well.
    float gravity = sqrt(max(1.0 - 1.0 / r, 0.0));
    float g = doppler * gravity;

    // Hot gas: brightest just outside the inner edge (the classic thin-disc profile).
    float x = R_IN / r;
    float flux = r > R_IN ? pow(x, 3.0) * (1.0 - sqrt(x)) / 0.0567 : 0.0;
    float temperature = 4300.0 * pow(max(flux, 0.0), 0.25) + 1300.0;

    // Turbulent filaments, each ring of gas orbiting at its own speed.
    float a = phi - uTime * beta / r * 1.4;
    vec3 sp = vec3(cos(a) * 2.2, sin(a) * 2.2, r * 1.9);
    float turbulence = fbm3(sp);
    float filaments = noise3(sp * vec3(2.6, 2.6, 5.5));
    float density = smoothstep(R_IN - 0.15, R_IN + 0.5, r) * (1.0 - smoothstep(8.0, R_OUT, r));
    density *= clamp(0.35 + 1.1 * turbulence + 0.35 * filaments - 0.3, 0.0, 1.5);

    // A flare wave rolls outward through the disc after each swallow.
    float wave = 1.0 + uWave.y * 2.2 * exp(-pow((r - uWave.x) / 0.9, 2.0));

    float intensity = flux * density * pow(g, 3.0) * 0.7 * wave;
    vec3 colour = blackbody(temperature * g) * intensity;
    float alpha = clamp(density * 0.85, 0.0, 0.96);
    return vec4(colour * alpha, alpha);
  }

  // The skills, as clumps of gas hotter than the disc (blue-white). Returns their glow and cover.
  vec4 clumpLight(vec3 hit, vec3 rayDir) {
    float r = length(hit.xz);
    float phi = atan(hit.z, hit.x);
    float beta = min(sqrt(0.5 / max(r - 1.0, 0.05)), 0.95);
    float gamma = inversesqrt(1.0 - beta * beta);
    vec3 orbit = normalize(vec3(-hit.z, 0.0, hit.x));
    float g = sqrt(max(1.0 - 1.0 / r, 0.0)) / (gamma * (1.0 - beta * dot(orbit, -rayDir)));

    float glow = 0.0;
    for (int k = 0; k < ${PER_GROUP}; k++) {
      vec4 c = uClumps[k];
      if (c.z <= 0.0) continue;
      float t = clamp(c.w, 0.0, 1.0);
      float behind = mod(c.y - phi + 3.14159, 6.28318) - 3.14159; // > 0: this spot is behind the clump
      float along = behind * c.x;
      float across = r - c.x;
      float size = 0.2 + 0.03 * c.x;
      float stretch = 1.0 + 4.5 * t; // the tide pulls it longer as it sinks
      float head = exp(-across * across / (size * size) - along * along / (size * size * stretch * stretch));
      // The stream already peeled off: trailing behind, slightly further out (where it came from).
      float tailLength = 0.2 + 2.8 * t;
      float tail = 0.0;
      if (behind > 0.0 && behind < tailLength) {
        float rt = c.x * (1.0 + 0.1 * behind);
        float w = size * (0.5 + 0.35 * behind);
        tail = exp(-pow((r - rt) / w, 2.0)) * exp(-2.4 * behind / tailLength) * 0.5 * smoothstep(0.0, 0.1, t);
      }
      glow += (head + tail) * c.z;
    }
    vec3 colour = blackbody(16000.0 * g) * glow * pow(g, 3.0) * 2.6;
    return vec4(colour, 0.0); // pure light: it never hides what's behind it
  }

  void main() {
    // The ray for this pixel, from the scene's real camera, in the black hole's own units.
    vec2 ndc = gl_FragCoord.xy / uRes * 2.0 - 1.0;
    vec4 view = uInvProj * vec4(ndc, 1.0, 1.0);
    vec3 dir = normalize(mat3(uCamMatrix) * normalize(view.xyz / view.w));
    vec3 pos = (uCamMatrix[3].xyz - uOrigin) / uScale;

    // Rays that pass far from the hole are barely bent: let the scene behind show through
    // untouched, and skip the expensive tracing.
    float miss = length(cross(pos, dir));
    if (miss > 34.0 || (dot(pos, dir) > 0.0 && length(pos) > 34.0)) discard;

    vec3 vel = dir;
    vec3 hv = cross(pos, vel);
    float h2 = dot(hv, hv);

    vec3 colour = vec3(0.0);
    float alpha = 0.0;
    float closest = 1e9;
    bool swallowed = false;

    for (int i = 0; i < 260; i++) {
      if (i >= uSteps) break;
      float r = length(pos);
      float dt = clamp(0.065 * r, 0.03, 3.0);
      vel += -1.5 * h2 * pos / pow(r, 5.0) * dt;
      vec3 next = pos + vel * dt;

      // Crossed the disc plane? Add the light from that spot (outside the horizon).
      if (pos.y * next.y < 0.0) {
        vec3 hit = mix(pos, next, pos.y / (pos.y - next.y));
        float rr = length(hit.xz);
        if (rr > 1.0 && rr < R_OUT + 2.0) {
          vec3 rd = normalize(vel);
          vec4 skills = clumpLight(hit, rd);
          colour += (1.0 - alpha) * skills.rgb;
          if (rr < R_OUT) {
            vec4 light = discLight(hit, rd);
            colour += (1.0 - alpha) * light.rgb;
            alpha += (1.0 - alpha) * light.a;
          }
          alpha += (1.0 - alpha) * skills.a;
        }
      }

      pos = next;
      float rn = length(pos);
      closest = min(closest, rn);
      if (rn < 1.0) { swallowed = true; break; }
      if (rn > 22.0 && dot(pos, vel) > 0.0) break; // escaped: bending from here on is negligible
      if (alpha > 0.985) break;
    }

    // A ray that got away stops being traced once it's far out, but gravity would keep
    // bending it a little more on its way to infinity. Add that last bit with the exact
    // far-field formula, so neighbouring rays (one traced a step longer than the other)
    // bend by the same amount and the stars behind line up without a seam.
    if (!swallowed && dot(pos, vel) > 0.0) {
      vec3 v = normalize(vel);
      float b = sqrt(h2);
      float s0 = dot(pos, v);
      float r0 = length(pos);
      vec3 across = pos - s0 * v;
      float rest = 1.0 / b - s0 * (2.0 * s0 * s0 + 3.0 * b * b) / (2.0 * b * r0 * r0 * r0);
      vel = v - max(rest, 0.0) * across / max(length(across), 1e-4);
    }

    // The photon ring flares as each skill is swallowed.
    colour += vec3(1.0, 0.78, 0.55) * uFlash * 2.4 * exp(-pow((closest - 1.55) / 0.14, 2.0)) * (1.0 - alpha);

    // Soft exposure for the glowing gas, like film: bright gas rolls off instead of
    // clipping, with a touch of extra colour so it reads gold rather than grey.
    colour = 1.0 - exp(-colour * 1.25);
    float luma = dot(colour, vec3(0.299, 0.587, 0.114));
    colour = max(mix(vec3(luma), colour, 1.35), 0.0);

    // Near the hole this picture replaces the scene; further out, where the bending
    // fades away, it melts into the scene's own sky.
    float cover = max(alpha, 1.0 - smoothstep(16.0, 32.0, swallowed ? 0.0 : closest));

    // Two outputs (this is traced at half resolution, see BlackHole.tsx):
    //   1. the glowing gas, and how much of the sky behind it is hidden (all of it, if swallowed)
    //   2. how far the black hole bent this ray of light, so the sky behind can be drawn
    //      afterwards at FULL sharpness, with every star exactly where the bending puts it
    vec3 bend = swallowed ? vec3(0.0) : normalize(vel) - dir;
    gl_FragColor = vec4(colour, swallowed ? 1.0 : alpha);
    pc_fragBend = vec4(bend, cover * uOpacity);
  }
`

/**
 * Step 2, at full resolution: stretch the half-resolution gas over the screen, and draw the
 * sky behind it sharply, bending each pixel's ray by the amount step 1 measured.
 */
const composite = /* glsl */ `
  uniform sampler2D uGas;
  uniform sampler2D uBend;
  uniform vec2 uScreen;
  uniform mat4 uInvProj;
  uniform mat4 uCamMatrix;
  uniform float uPix;
  ${NOISE}
  ${BLACKBODY}
  ${SKY}
  ${SKY_FAST}
  void main() {
    vec2 uv = gl_FragCoord.xy / uScreen;
    vec4 bend = texture(uBend, uv);
    if (bend.w <= 0.002) discard; // far from the hole: the scene's own sky shows through
    vec4 gas = texture(uGas, uv);
    vec4 view = uInvProj * vec4(uv * 2.0 - 1.0, 1.0, 1.0);
    vec3 dir = normalize(mat3(uCamMatrix) * normalize(view.xyz / view.w));
    vec3 sky = milkyWay(normalize(dir + bend.xyz), uPix);
    gl_FragColor = vec4(gas.rgb + (1.0 - gas.a) * sky, bend.w);
  }
`

export const BLACKHOLE_SHADER_PARTS = { vertex, fragment, composite }