#version 300 es

precision highp float;

#define flipY(v2) vec2(v2.x, 1.0 - v2.y)

uniform float iTime;
uniform vec3 iResolution;
uniform sampler2D iChannel1;

out vec4 outColor;

uniform bool uUseBackdropImage;
uniform float uBalatroPaintFactor;
uniform int uBalatroPaintIterations;

const float IMAGE_SCALE = 1.0f;
const float COLOR_MIX_1 = 1.0f;
const float COLOR_MIX_2 = 5.0f;
const vec4 COLOR_1 = vec4(0.28f, 0.28f, 0.28f, 1.0f);
const vec4 COLOR_2 = vec4(0.0f, 0.03f, 0.21f, 1.0f);
const vec4 COLOR_3 = vec4(0.0f, 0.14f, 0.33f, 1.0f);

vec2 balatroPaintWarp(vec2 areaResolution, vec2 areaXY, float time) {
  highp vec2 uv = areaXY / areaResolution;

	//Now add the paint effect to the swirled UV
  // uv *= 30.f;
  float speed = 0.2f * time;
  highp vec2 uv2 = vec2(uv.x + uv.y);
  highp vec2 uv3 = vec2(uv);

  for(int i = 0; i < uBalatroPaintIterations; i++) {
    uv2 += sin(max(uv3.x, uv3.y)) + uv3;
    uv3 += 0.5f * vec2(cos(5.1123314f + 0.353f * uv2.y + speed * 0.131121f), sin(uv2.x - 0.113f * speed));
    uv3 -= 1.0f * cos(uv3.x + uv3.y) - 1.0f * sin(uv3.x * 0.711f - uv3.y);
  }

  uv = mix(uv, uv3, uBalatroPaintFactor);
  return uv;
}

vec4 balatroColorLookup(vec2 uv) {
  	//Make the paint amount range from 0 - 2
  highp float contrastModifier = (0.25f * COLOR_MIX_1 + 0.5f * COLOR_MIX_2 + 1.2f);
  highp float paintLookupScale = min(2.f, max(0.f, length(uv) * (0.035f) * contrastModifier));
  highp float mixCol1 = max(0.f, 1.f - contrastModifier * abs(1.f - paintLookupScale));
  highp float mixCol2 = max(0.f, 1.f - contrastModifier * abs(paintLookupScale));
  highp float mixCol3 = 1.f - min(1.f, mixCol1 + mixCol2);

  highp vec4 resultColor = (0.3f / COLOR_MIX_1) * COLOR_1 + (1.f - 0.3f / COLOR_MIX_1) * (COLOR_1 * mixCol1 + COLOR_2 * mixCol2 + vec4(mixCol3 * COLOR_3.rgb, mixCol3 * COLOR_1.a));
  return resultColor;
}

void main() {
  vec2 halfRes = iResolution.xy / 2.0f;

  vec2 texSize = vec2(textureSize(iChannel1, 0));
  vec2 texSizeRatio = texSize / iResolution.xy;
  float minTexSizeRatio = min(texSizeRatio.x, texSizeRatio.y);
  vec2 scaledPx = (((gl_FragCoord.xy - halfRes) * minTexSizeRatio) / (texSizeRatio * IMAGE_SCALE)) + halfRes;

  vec2 warpedUv = balatroPaintWarp(texSize, scaledPx * texSizeRatio, iTime);

  vec4 baseColor;
  if(uUseBackdropImage) {
    baseColor = texture(iChannel1, flipY(warpedUv));
  } else {
    baseColor = balatroColorLookup(warpedUv);
  }

  outColor = baseColor;
}
