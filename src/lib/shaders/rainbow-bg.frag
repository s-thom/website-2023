#version 300 es

precision highp float;

uniform float iTime;
uniform float iTimeElapsed;
uniform vec3 iResolution;

out vec4 outColor;

uniform vec4 uBackgroundColor;

const float SQRT3 = 1.7320508075688772f;
const float PI = 3.141592653589793f;

uniform float uMix;
uniform float uIntersection;

// Size of hex cells in CSS pixels
const float uHexSize = 100.0f;
// Circle radius as a fraction of hex spacing
const float uCircleRadius = 0.5f;
// Antialiasing width in hex units
const float uAaWidth = 0.01f;

// Hex cells per full rainbow cycle (size-independent)
const float uRainbowSpacing = 18.5f;
// Direction of rainbow gradient in degrees (0 = right, 90 = up)
const float uRainbowAngle = 35.0f;
// How quickly hue shifts over time (radians per second)
const float uTimeSpeed = 0.06f;

// Lightness wave + per-cell breathing
const float uLightnessWaveAmp = 0.03f;   // how much L varies (+/-)
const float uLightnessWaveLoops = 1.5f;  // wave cycles across canvas diagonal
const float uLightnessWaveSpeed = 0.5f;  // radians per second
const float uBreatheSpread = 0.3f;       // 0 = all cells in sync, 1 = fully random phases

// Per-cell radius jitter (static, seed from cell position)
const float uRadiusJitter = 0.075f; // max radius variation as fraction of hex spacing

// Ripple wave on radius
const float uRippleAmp = 0.15f;    // radius variation amplitude
const float uRippleLoops = 1.0f;   // wave cycles across canvas diagonal
const float uRippleSpeed = 0.15f;  // radians per second
const float uRippleAngle = 100.0f; // wave travel direction in degrees (0 = right, 90 = up)

const float uMaxMix = 0.6f;

// Palette-based coloring (OKLCH stops: L, C, H_radians, alpha)
uniform vec4 uColorsCurrent[8];
uniform vec4 uColorsNext[8];
uniform float uWipeProgress;  // 0 = current, 1 = next
uniform vec2 uWipeOrigin;     // canvas-px wipe centre (may be off-screen)

// OKLab to linear sRGB
vec3 oklab_to_linear_rgb(float La, float a, float b) {
  float l_ = La + 0.3963377774f * a + 0.2158037573f * b;
  float m_ = La - 0.1055613458f * a - 0.0638541728f * b;
  float s_ = La - 0.0894841775f * a - 1.2914855480f * b;

  float l = l_ * l_ * l_;
  float m = m_ * m_ * m_;
  float s = s_ * s_ * s_;

  return vec3(+4.0767416621f * l - 3.3077115913f * m + 0.2309699292f * s, -1.2684380046f * l + 2.6097574011f * m - 0.3413193965f * s, -0.0041960863f * l - 0.7034186147f * m + 1.7076147010f * s);
}

float linear_to_srgb(float c) {
  c = clamp(c, 0.0f, 1.0f);
  return c <= 0.0031308f ? 12.92f * c : 1.055f * pow(c, 1.0f / 2.4f) - 0.055f;
}

vec4 oklch_to_rgba(float La, float Ch, float h) {
  float a = Ch * cos(h);
  float b = Ch * sin(h);
  vec3 linear = oklab_to_linear_rgb(La, a, b);
  return vec4(linear_to_srgb(linear.r), linear_to_srgb(linear.g), linear_to_srgb(linear.b), 1.0f);
}

// Low-quality but fast hash, good enough for per-cell variation
float hash21(vec2 p) {
  p = fract(p * vec2(127.1f, 311.7f));
  p += dot(p, p + 19.19f);
  return fract(p.x * p.y);
}

// Hex lattice with basis vectors a1=(1,0), a2=(0.5, sqrt(3)/2).
// Returns the nearest lattice center to p (in lattice units).
vec2 nearestHexCenter(vec2 p) {
  // Convert to lattice coordinates (u, v)
  float v = p.y * 2.0f / SQRT3;
  float u = p.x - p.y / SQRT3;

  float u0 = floor(u);
  float v0 = floor(v);

  vec2 best = vec2(0.0f);
  float bestDist = 1e10f;

  // Check all 4 surrounding lattice points
  for(int du = 0; du <= 1; du++) {
    for(int dv = 0; dv <= 1; dv++) {
      float nu = u0 + float(du);
      float nv = v0 + float(dv);
      vec2 center = nu * vec2(1.0f, 0.0f) + nv * vec2(0.5f, SQRT3 * 0.5f);
      float d = length(p - center);
      if(d < bestDist) {
        bestDist = d;
        best = center;
      }
    }
  }

  return best;
}

vec4 samplePalette(vec4 stops[8], float t) {
  t = fract(t);
  float fi = t * 8.0f;
  int i0 = int(fi) % 8;
  int i1 = (i0 + 1) % 8;
  float f = fract(fi);
  vec4 s0 = stops[i0];
  vec4 s1 = stops[i1];
  // Interpolate L, C, alpha linearly; hue via shortest angular path
  float dh = mod(s1.z - s0.z + PI, 2.0f * PI) - PI;
  return vec4(mix(s0.x, s1.x, f), mix(s0.y, s1.y, f), s0.z + dh * f, mix(s0.w, s1.w, f));
}

void main() {
  // Convert to CSS pixels
  vec2 fragCoord = gl_FragCoord.xy;

  // Scale into hex lattice space (1 unit = uHexSize CSS pixels)
  vec2 p = fragCoord / uHexSize;

  vec2 hexCenter = nearestHexCenter(p);
  float dist = length(p - hexCenter);

  float cellHash = hash21(hexCenter);
  float diagPos = hexCenter.x + hexCenter.y;
  float canvasDiagInHex = (iResolution.x + iResolution.y) / uHexSize;

  // Effect 2: per-cell static radius jitter, seeded from cell position
  float trueCircleRadius = 0.8f - ((0.8f - uCircleRadius) * uIntersection);
  float radius = trueCircleRadius + (cellHash - 0.5f) * 2.0f * uRadiusJitter;

  // Effect 3: ripple wave at configurable angle, modulates radius
  float rippleAngleRad = uRippleAngle * PI / 180.0f;
  float ripplePos = dot(hexCenter, vec2(cos(rippleAngleRad), sin(rippleAngleRad)));
  float rippleScale = uRippleLoops * 2.0f * PI / canvasDiagInHex;
  radius += sin(ripplePos * rippleScale - iTimeElapsed * uRippleSpeed) * uRippleAmp;

  // Smooth circle edge
  float alpha = 1.0f - smoothstep(radius - uAaWidth, radius + uAaWidth, dist);

  if(alpha <= 0.0f) {
    outColor = uBackgroundColor;
    return;
  }

  // Gradient position along rainbow angle, drifting over time
  float rainbowAngleRad = uRainbowAngle * PI / 180.0f;
  float rainbowPos = dot(hexCenter, vec2(cos(rainbowAngleRad), sin(rainbowAngleRad)));
  float t = rainbowPos / uRainbowSpacing + iTimeElapsed * uTimeSpeed;

  // Effect 1: diagonal lightness wave with per-cell phase spread for breathing
  float lightnessWaveScale = uLightnessWaveLoops * 2.0f * PI / canvasDiagInHex;
  float cellPhase = cellHash * 2.0f * PI * uBreatheSpread;
  float lOffset = sin(diagPos * lightnessWaveScale + cellPhase - iTimeElapsed * uLightnessWaveSpeed) * uLightnessWaveAmp;

  // Circle wipe: per-cell flip progress (0 = current, 1 = next)
  float cellDistPx = length(hexCenter * uHexSize - uWipeOrigin);
  float maxDist = max(max(length(uWipeOrigin), length(uWipeOrigin - vec2(iResolution.x, 0.0f))), max(length(uWipeOrigin - vec2(0.0f, iResolution.y)), length(uWipeOrigin - iResolution.xy)));
  float wipeEdge = uHexSize * 0.5f;
  float wipeRadius = uWipeProgress * 1.1f * (maxDist + wipeEdge) - wipeEdge;
  float wipeBlend = 1.0f - smoothstep(wipeRadius - wipeEdge, wipeRadius + wipeEdge, cellDistPx);

  // Card flip: rotate each cell around the axis tangent to the wipe circle.
  // flipCos: 1 = facing front (current), 0 = edge-on, -1 = facing back (next)
  float flipAngle = wipeBlend * PI;
  float flipCos = cos(flipAngle);
  float absFlipCos = max(abs(flipCos), 0.001f);

  // Radial direction from wipe origin toward this cell (the flip compression axis)
  vec2 cellVecPx = hexCenter * uHexSize - uWipeOrigin;
  vec2 radialDir = length(cellVecPx) > 1.0f ? normalize(cellVecPx) : vec2(1.0f, 0.0f);

  // Decompose fragment offset from cell centre into radial + tangential (pixel space)
  vec2 fragOffsetPx = (p - hexCenter) * uHexSize;
  float radComp = dot(fragOffsetPx, radialDir);
  vec2 tanVec = fragOffsetPx - radComp * radialDir;

  // Stretch the radial component to simulate the foreshortened cell face
  float flipDist = length(tanVec + (radComp / absFlipCos) * radialDir) / uHexSize;
  alpha = 1.0f - smoothstep(radius - uAaWidth, radius + uAaWidth, flipDist);

  // Front face = current palette, back face = next palette
  vec4 lch = flipCos >= 0.0f ? samplePalette(uColorsCurrent, t) : samplePalette(uColorsNext, t);
  // lch.x = L, lch.y = C, lch.z = H (radians)
  vec4 circleColor = oklch_to_rgba(lch.x + lOffset, lch.y, lch.z);
  vec4 aaColor = mix(uBackgroundColor, circleColor, alpha);
  outColor = mix(uBackgroundColor, mix(uBackgroundColor, aaColor, uMix), uMaxMix);
}
