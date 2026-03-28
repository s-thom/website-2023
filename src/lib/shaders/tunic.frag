#version 300 es

precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform sampler2D iChannel1;

out vec4 outColor;

const float SPEED = 0.3f;

const int TRAIL_N = 32;
const float TRAIL_DUR = 2.0f;
const float REVEAL_OUTER = 160.0f;
const float REVEAL_INNER = 80.0f;
const float GLOW_R = 10.0f;
const float CORE_R = 4.0f;
const float TRAIL_W_HEAD = 6.0f;
const float TRAIL_W_TAIL = 0.5f;
const float TRAIL_BLOOM_R = 5.0f; // CSS px — Gaussian sigma for trail bloom halo

// Maps real time t to an effective path time with fast/slow rhythm.
// Speed function: s(t) = 0.6 + 0.4·cos(ω·t + φ), range [0.2, 1.0].
// The fairy is above 0.4× speed for 2/3 of each cycle ("fast phase") and
// below it for 1/3 ("slow phase") — roughly 4s fast + 2s slow for a 6s cycle.
// Integral: 0.6·t + 0.4·sin(ω·t+φ)/ω; normalised so average speed = 1.
// Each fairy uses a different period so they fall in and out of sync.
float burstWarp(float t, int i) {
  float omega, phase;
  if(i == 0) {
    omega = 6.28318f / 6.0f; // 6s cycle  → ~2s slow, ~4s fast
    phase = 0.0f;
  } else if(i == 1) {
    omega = 6.28318f / 4.5f; // 4.5s cycle → ~1.5s slow, ~3s fast
    phase = 1.9f;
  } else {
    omega = 6.28318f / 9.0f; // 9s cycle  → ~3s slow, ~6s fast
    phase = 4.1f;
  }
  float raw = 0.6f * t + 0.4f * sin(omega * t + phase) / omega;
  return raw / 0.6f; // normalise: average of s(t) is 0.6
}

// Returns fairy position in CSS pixel space.
// Each fairy uses distinct Lissajous-style frequencies so the paths differ.
vec2 fairyPath(float t, int i) {
  float wx, wy, px, py, cx, cy, rx, ry;
  if(i == 0) {
    wx = 1.1f;
    wy = 1.3f;
    px = 0.0f;
    py = 0.9f;
    cx = 0.38f;
    cy = 0.50f;
    rx = 0.28f;
    ry = 0.30f;
  } else if(i == 1) {
    wx = 1.7f;
    wy = 2.3f;
    px = 1.2f;
    py = 0.4f;
    cx = 0.62f;
    cy = 0.45f;
    rx = 0.24f;
    ry = 0.26f;
  } else {
    wx = 0.9f;
    wy = 1.8f;
    px = 2.5f;
    py = 1.7f;
    cx = 0.50f;
    cy = 0.38f;
    rx = 0.32f;
    ry = 0.22f;
  }
  float u = cx + rx * cos(wx * t * SPEED + px);
  float v = cy + ry * sin(wy * t * SPEED + py);

  // Occasional course shifts: two drift components per axis at incommensurable
  // periods (~8s and ~12s). They reinforce occasionally for a noticeable
  // deviation, cancel at other times, and never repeat in a visible cycle.
  // Amplitude is small (~2–3% of screen) so the Lissajous shape stays legible.
  float seed = float(i) * 2.399f; // per-fairy offset (golden-ratio spacing)
  float du = 0.022f * sin(t * 0.52f + seed) + 0.012f * sin(t * 0.83f + seed * 1.7f);
  float dv = 0.022f * cos(t * 0.61f + seed * 0.9f) + 0.012f * cos(t * 0.44f + seed * 2.3f);
  return vec2(u + du, v + dv) * iResolution.xy;
}

// HSV rainbow with S=1, V=1; hue in [0,1].
vec3 rainbowColor(float hue) {
  hue = fract(hue);
  float h6 = hue * 6.0f;
  return clamp(vec3(abs(h6 - 3.0f) - 1.0f, 2.0f - abs(h6 - 2.0f), 2.0f - abs(h6 - 4.0f)), 0.0f, 1.0f);
}

// Unsigned distance from point p to line segment a→b.
float segmentDist(vec2 p, vec2 a, vec2 b) {
  vec2 ab = b - a;
  float s = clamp(dot(p - a, ab) / (dot(ab, ab) + 1e-6f), 0.0f, 1.0f);
  return length(p - (a + s * ab));
}

void main() {
  // gl_FragCoord is in CSS pixels (canvas is sized to CSS dimensions).
  vec2 fragCSS = gl_FragCoord.xy;

  // Tile the hidden image. Tile is at most 256 CSS px wide, and tiles at
  // least 1.5 times across the screen (more tiles on larger screens).
  float tileSize = min(iResolution.x / 1.5f, 256.0f);
  vec2 tiledUV = fract(fragCSS / tileSize);
  tiledUV.y = 1.0f - tiledUV.y; // flip Y (WebGL origin vs. image origin)
  vec4 imageColor = texture(iChannel1, tiledUV);

  vec4 bgColor = vec4(0.1f, 0.3f, 0.14f, 1.0f);
  float revealAmt = 0.0f;
  vec4 trailAcc = vec4(0.0f); // pre-multiplied alpha accumulator
  vec3 bloomAcc = vec3(0.0f);

  for(int fi = 0; fi < 3; fi++) {
    vec2 headPos = fairyPath(burstWarp(iTime, fi), fi);
    float dHead = length(fragCSS - headPos);

    // Reveal the tiled image within ~160 CSS px of the fairy head.
    revealAmt = max(revealAmt, smoothstep(REVEAL_OUTER, REVEAL_INNER, dHead));

    // Fake bloom: wide soft halo + tight bright core.
    float d2 = dHead * dHead;
    bloomAcc += vec3(0.25f, 0.50f, 1.0f) * 1.8f * exp(-d2 / (GLOW_R * GLOW_R));
    bloomAcc += vec3(0.40f, 0.62f, 1.0f) * 3.0f * exp(-d2 / (CORE_R * CORE_R));

    // Rainbow ribbon trail: find the closest segment across the whole trail,
    // then apply a single coverage value. Using += per-segment caused seam
    // circles at joints where two adjacent capsule endpoints overlapped.
    float minDist = 1e9f;
    float minAge = 0.0f;
    vec2 pos0 = headPos;
    float age0 = 0.0f;
    for(int si = 1; si < TRAIL_N; si++) {
      float age1 = float(si) / float(TRAIL_N - 1);
      vec2 pos1 = fairyPath(burstWarp(iTime - age1 * TRAIL_DUR, fi), fi);
      float ageMid = (age0 + age1) * 0.5f;
      float d = segmentDist(fragCSS, pos0, pos1);
      if(d < minDist) {
        minDist = d;
        minAge = ageMid;
      }
      pos0 = pos1;
      age0 = age1;
    }

    // One smoothstep per fairy trail — no double-counting at segment joins.
    float halfW = mix(TRAIL_W_HEAD, TRAIL_W_TAIL, minAge);
    float coverage = smoothstep(halfW + 1.0f, halfW - 0.5f, minDist);
    float alpha = coverage * (1.0f - minAge) * (1.0f - minAge);
    // Hue 0.55 = sky blue, matching the fairy glow color; cycles through the
    // spectrum toward the tail. Each fairy is offset 120° to stay distinct.
    float hue = fract(0.55f - minAge);
    vec3 rgb = rainbowColor(hue);
    trailAcc += vec4(rgb * alpha, alpha);

    // Trail bloom also uses minDist so it inherits the seam fix.
    float trailBloom = exp(-minDist * minDist / (TRAIL_BLOOM_R * TRAIL_BLOOM_R)) * (1.0f - minAge) * (1.0f - minAge) * 0.6f;
    bloomAcc += rgb * trailBloom;
  }

  // ── Compositing ──────────────────────────────────────────────────────────
  // 1. Reveal image through background near fairies.
  vec4 base = mix(bgColor, imageColor, revealAmt);

  // 2. Alpha-composite trail ribbon over base (un-premultiply accumulator).
  float tAlpha = clamp(trailAcc.a, 0.0f, 1.0f);
  vec3 tRGB = tAlpha > 0.0f ? clamp(trailAcc.rgb / trailAcc.a, 0.0f, 1.0f) : vec3(0.0f);
  vec3 col = mix(base.rgb, tRGB, tAlpha);

  // 3. Add bloom additively, then Reinhard tone-map to keep output in [0,1].
  col += clamp(bloomAcc, 0.0f, 4.0f);
  outColor = vec4(col / (1.0f + col), 1.0f);
}
