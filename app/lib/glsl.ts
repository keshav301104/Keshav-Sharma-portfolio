/* ------------------------------------------------------------------ *
 * Shader building blocks shared by several scenes.
 *
 * GLSL (the language the graphics card runs) has no "import", so each
 * piece is a string that gets pasted into the shaders that need it.
 *
 *   NOISE       smooth random values, the base of every cloud, crater and coastline
 *   BLACKBODY   the colour of something glowing at a given temperature (kelvin),
 *               the same physics that makes red dwarfs red and hot stars blue
 *   SKY         our galaxy seen from inside: the Milky Way band with dark dust
 *               lanes, a warm core, and thousands of pin-sharp stars
 *   FAR_SKY     the sky on the far side of the wormhole: a vast star-forming
 *               nebula with a young cluster at its heart
 *
 * The skies are split into a slow part (the glowing gas and dust, painted once
 * into a "cube map" at load by lib/bake.ts) and a fast part (the pin-sharp stars,
 * drawn live). Looking up a painted picture costs almost nothing, so the sky no
 * longer slows down every frame. SKY_FAST and FAR_SKY_FAST put the two together.
 * ------------------------------------------------------------------ */

export const NOISE = /* glsl */ `
  // "Hash without sine" (Dave Hoskins): stable on every GPU, including phones.
  float hash13(vec3 p3) {
    p3 = fract(p3 * 0.1031);
    p3 += dot(p3, p3.zyx + 31.32);
    return fract((p3.x + p3.y) * p3.z);
  }
  vec3 hash33(vec3 p3) {
    p3 = fract(p3 * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yxz + 33.33);
    return fract((p3.xxy + p3.yxx) * p3.zyx);
  }
  float noise3(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash13(i), hash13(i + vec3(1, 0, 0)), f.x), mix(hash13(i + vec3(0, 1, 0)), hash13(i + vec3(1, 1, 0)), f.x), f.y),
               mix(mix(hash13(i + vec3(0, 0, 1)), hash13(i + vec3(1, 0, 1)), f.x), mix(hash13(i + vec3(0, 1, 1)), hash13(i + vec3(1, 1, 1)), f.x), f.y), f.z);
  }
  float fbm3(vec3 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise3(p); p = p * 2.03 + 11.7; a *= 0.5; }
    return v;
  }
`

export const BLACKBODY = /* glsl */ `
  // Colour of a glowing body at temperature t (kelvin), brightest channel = 1.
  vec3 blackbody(float t) {
    t = clamp(t, 1000.0, 40000.0) / 100.0;
    float r = t <= 66.0 ? 1.0 : clamp(1.292936 * pow(t - 60.0, -0.1332047), 0.0, 1.0);
    float g = t <= 66.0 ? clamp(0.3900816 * log(t) - 0.6318414, 0.0, 1.0)
                        : clamp(1.129891 * pow(t - 60.0, -0.0755148), 0.0, 1.0);
    float b = t >= 66.0 ? 1.0 : (t <= 19.0 ? 0.0 : clamp(0.5432068 * log(t - 10.0) - 1.1962541, 0.0, 1.0));
    return vec3(r, g, b);
  }
`

/** Needs NOISE and BLACKBODY pasted above it. */
export const SKY = /* glsl */ `
  // One layer of stars. The sky is cut into cells; some cells hold one star.
  // pix = how wide one screen pixel is (in radians), so stars stay pin-sharp.
  vec3 starLayer(vec3 d, float scale, float density, float pix, float gain) {
    vec3 cell = floor(d * scale);
    vec3 h = hash33(cell);
    if (h.x > density) return vec3(0.0);
    vec3 sd = normalize(cell + 0.2 + 0.6 * hash33(cell + 17.0));
    if (any(notEqual(floor(sd * scale), cell))) return vec3(0.0);
    float ang = length(cross(d, sd));
    float size = pix * (0.6 + 0.45 * h.y);
    float core = exp(-ang * ang / (size * size));
    float brightness = gain * (0.08 + 2.2 * pow(h.y, 10.0));
    // Real star colours: mostly white and yellow, some orange, a few blue.
    vec3 tint = blackbody(2800.0 + 11000.0 * h.z * h.z);
    return tint * core * brightness;
  }

  // The galaxy's own axes: its plane crosses every chapter's view diagonally,
  // and its bright core sits off to one side.
  vec3 galactic(vec3 d) {
    return vec3(
      dot(d, vec3(-0.4696, 0.2869, -0.835)),
      dot(d, vec3(0.8018, 0.5345, -0.2673)),
      dot(d, vec3(0.3696, -0.795, -0.4811))
    );
  }

  // Our galaxy from the inside, part 1: the soft glow of the band and its dark dust.
  // Returns the glow (rgb) and how dusty that direction is (a). This is the expensive
  // part, so it's painted once into a cube map (lib/bake.ts) and looked up after that.
  vec4 milkyWayGlow(vec3 d) {
    vec3 g = galactic(d);
    float lat = asin(clamp(g.y, -1.0, 1.0));
    float toCore = acos(clamp(g.z, -1.0, 1.0)); // angle from the galactic centre

    // The band is made of countless unresolved stars, so it's grainy, not foggy:
    // big star clouds, broken into smaller clumps, sprinkled with fine grain.
    float clouds = fbm3(g * 6.0) * 0.5 + fbm3(g * 19.0 + 4.0) * 0.35 + noise3(g * 75.0) * 0.15;
    float width = 0.12 + 0.1 * exp(-toCore * toCore * 2.0);
    float band = exp(-pow(lat / width, 2.0)) * (0.2 + 1.2 * clouds * clouds);
    float bulge = exp(-pow(toCore / 0.4, 2.0)) * exp(-pow(lat / 0.2, 2.0)) * (0.7 + 0.5 * clouds);

    // Dust: thin, creased filaments (ridged noise), densest along the middle of the band
    // (the "Great Rift"). It dims the light and reddens what gets through.
    float crease = 1.0 - abs(2.0 * fbm3(g * 13.0 + vec3(3.1, 0.0, 1.7)) - 1.0);
    float rift = exp(-pow((lat + 0.02 * (crease - 0.5)) / 0.03, 2.0)) * smoothstep(0.45, 0.85, crease);
    float filaments = pow(1.0 - abs(2.0 * fbm3(g * 24.0 + 9.0) - 1.0), 7.0) * exp(-pow(lat / 0.09, 2.0));
    float dust = clamp(rift * 0.75 + filaments * 0.55, 0.0, 1.0);

    vec3 armColour = vec3(0.78, 0.8, 0.92);
    vec3 coreColour = vec3(1.0, 0.8, 0.58);
    vec3 glow = armColour * band * 0.065 + coreColour * bulge * 0.2;
    glow *= mix(vec3(1.0), vec3(0.45, 0.32, 0.24), dust); // dust: darker and browner
    return vec4(glow, dust);
  }

  // Part 2: the stars, drawn live every frame so they stay pin-sharp (they're cheap).
  // A fine dust of faint ones, fewer medium ones, and a rare few bright ones,
  // crowded inside the band and sparse away from it (as in a real dark-sky photo).
  vec3 milkyWayStars(vec3 d, float pix, float dust) {
    float lat = asin(clamp(galactic(d).y, -1.0, 1.0));
    float crowd = 0.3 + 0.7 * exp(-pow(lat / 0.3, 2.0));
    vec3 stars = starLayer(d, 300.0, 0.16 * crowd, pix, 0.22)
               + starLayer(d, 120.0, 0.07 * crowd, pix, 0.5)
               + starLayer(d, 42.0, 0.05, pix * 1.15, 1.3);
    return stars * (1.0 - 0.6 * dust);
  }
`

/**
 * The Milky Way, fast: the glow comes from the cube map painted once at load (uSkyMap,
 * see lib/bake.ts); the stars are drawn live. Needs NOISE, BLACKBODY and SKY above it.
 */
export const SKY_FAST = /* glsl */ `
  uniform samplerCube uSkyMap;
  vec3 milkyWay(vec3 d, float pix) {
    vec4 glow = texture(uSkyMap, d);
    return glow.rgb + milkyWayStars(d, pix, glow.a);
  }
`

/** Needs NOISE, BLACKBODY and SKY pasted above it. */
export const FAR_SKY = /* glsl */ `
  // Somewhere else entirely: a giant star-forming nebula, like the Carina or Eagle
  // nebulae. Colours are the real emission lines: hydrogen glows deep red-pink,
  // oxygen glows teal, and cold dust carves dark pillars and lanes through it.
  const vec3 NEBULA_CENTRE = vec3(0.2684, 0.0959, 0.9585); // normalize(0.28, 0.1, 1.0)

  // Part 1 (painted once into a cube map): the glowing gas (rgb) and its dust (a).
  vec4 farGlow(vec3 d) {
    float ang = acos(clamp(dot(d, NEBULA_CENTRE), -1.0, 1.0));
    float region = exp(-pow(ang / 0.75, 2.0));

    vec3 p = d * 2.4;
    vec3 w = vec3(fbm3(p * 1.2 + 3.0), fbm3(p * 1.2 + 9.0), fbm3(p * 1.2 + 15.0)) - 0.5;
    float gas = fbm3(p * 2.1 + w * 2.4);
    float hydrogen = pow(clamp(gas * 1.4 - 0.3, 0.0, 1.0), 2.0) * region;
    float oxygen = pow(clamp(fbm3(p * 3.2 - w * 1.6 + 7.0) * 1.5 - 0.55, 0.0, 1.0), 1.6) * pow(region, 3.0);
    // Bright rims where starlight eats into the gas (ionisation fronts).
    float rims = pow(1.0 - abs(2.0 * fbm3(p * 3.6 + w * 1.8 + 4.0) - 1.0), 9.0) * hydrogen;

    vec3 glow = vec3(0.8, 0.17, 0.25) * hydrogen * 0.7
              + vec3(0.16, 0.55, 0.6) * oxygen * 0.45
              + vec3(1.0, 0.62, 0.5) * rims * 0.8;

    // Cold dust: dark lanes and pillars.
    float dustField = fbm3(p * 4.0 + w * 2.6 + 11.0);
    float dust = smoothstep(0.53, 0.68, dustField) * smoothstep(0.05, 0.5, region);
    glow *= 1.0 - 0.9 * dust;
    return vec4(glow, dust);
  }

  // Part 2 (live): stars from a different patch of sky, and a young blue cluster at the heart.
  vec3 farStars(vec3 d, float pix, float dust) {
    float ang = acos(clamp(dot(d, NEBULA_CENTRE), -1.0, 1.0));
    vec3 e = vec3(d.z, d.x, d.y);
    vec3 stars = starLayer(e, 290.0, 0.13, pix, 0.3) + starLayer(e, 118.0, 0.07, pix, 0.6) + starLayer(e, 44.0, 0.05, pix * 1.15, 1.4);
    float cluster = exp(-pow(ang / 0.1, 2.0));
    stars += starLayer(e, 170.0, 0.65 * cluster, pix * 1.2, 2.2) * vec3(0.8, 0.9, 1.2);
    return stars * (1.0 - 0.85 * dust);
  }
`

/** The far sky, fast: glow from its painted cube map (uFarMap), stars live. Needs FAR_SKY above it. */
export const FAR_SKY_FAST = /* glsl */ `
  uniform samplerCube uFarMap;
  vec3 farSky(vec3 d, float pix) {
    vec4 glow = texture(uFarMap, d);
    return glow.rgb + farStars(d, pix, glow.a);
  }
`