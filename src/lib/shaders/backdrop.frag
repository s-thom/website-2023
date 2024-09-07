#version 300 es

precision highp float;

#define flipY(v2) vec2(v2.x, 1.0 - v2.y)

uniform float iTime;
uniform vec3 iResolution;
uniform sampler2D iChannel1;

out vec4 outColor;

uniform vec2 uOffset;
uniform int uWarpIterations;
uniform float uWarpAmount;
uniform float uWarpScale;
uniform bool uUseColors;

const float IMAGE_SCALE = 1.0f;
const float COLOR_MIX_1 = 1.0f;
const float COLOR_MIX_2 = 5.0f;
const vec4 COLOR_1 = vec4(0.28f, 0.28f, 0.28f, 1.0f);
const vec4 COLOR_2 = vec4(0.0f, 0.03f, 0.21f, 1.0f);
const vec4 COLOR_3 = vec4(0.0f, 0.14f, 0.33f, 1.0f);

// Note: parts of this shader have been copied from https://www.playbalatro.com/

vec2 getInitialUv() {
  vec2 halfRes = iResolution.xy / 2.0f;
  vec2 texSize = vec2(textureSize(iChannel1, 0));
  vec2 texSizeRatio = texSize / iResolution.xy;
  float minTexSizeRatio = min(texSizeRatio.x, texSizeRatio.y);
  vec2 scaledPx = (((gl_FragCoord.xy - halfRes) * minTexSizeRatio) / (texSizeRatio * IMAGE_SCALE)) + halfRes;

  vec2 baseUv = (scaledPx * texSizeRatio) / texSize;
  return baseUv + uOffset - 0.5f;
}

vec2 applyWarp(vec2 uv) {
  //Now add the paint effect to the swirled UV
  vec2 uv2 = vec2(uv.x + uv.y);
  vec2 uv3 = uv * uWarpScale;
  float speed = iTime * 0.2f;

  for(int i = 0; i < uWarpIterations; i++) {
    uv2 += uv3 + cos(length(uv3));
    uv3 += 0.5f * vec2(cos(5.1123314f + 0.353f * uv2.y + speed * 0.131121f), sin(uv2.x - 0.113f * speed));
    uv3 -= 1.0f * cos(uv3.x + uv3.y) - 1.0f * sin(uv3.x * 0.711f - uv3.y);
  }

  uv3 /= uWarpScale;

  return mix(uv, uv3, uWarpAmount);
}

vec4 sampleImage(vec2 uv) {
  vec2 shiftedUv = uv + 0.5f;
  return texture(iChannel1, flipY(shiftedUv));
}

vec4 sampleColor(vec2 uv) {
  // Make the paint amount range from 0 - 2
  float contrast_mod = (0.25f * COLOR_MIX_1 + 0.5f * COLOR_MIX_2 + 1.2f);
  float paint_res = min(2.f, max(0.f, length(uv) * (0.035f) * contrast_mod));
  float c1p = max(0.f, 1.f - contrast_mod * abs(1.f - paint_res));
  float c2p = max(0.f, 1.f - contrast_mod * abs(paint_res));
  float c3p = 1.f - min(1.f, c1p + c2p);

  vec4 color = (0.3f / COLOR_MIX_1) * COLOR_1 + (1.f - 0.3f / COLOR_MIX_1) * (COLOR_1 * c1p + COLOR_2 * c2p + vec4(c3p * COLOR_3.rgb, c3p * COLOR_1.a));
  return color;
}

void main() {
  vec2 uv = getInitialUv();
  vec2 warpedUv = applyWarp(uv);

  outColor = uUseColors ? sampleColor(warpedUv) : sampleImage(warpedUv);
}
