#version 300 es

precision highp float;

#define flipY(v2) vec2(v2.x, 1.0 - v2.y)

uniform float uTime;
uniform vec2 uResolution;

uniform float uImageScale;

uniform bool uReady;

uniform bool uForceColorMode;
uniform bool uUseBackdropImage;
uniform sampler2D uTextureBackdrop;

out vec4 outColor;

uniform highp float uBalatroTimeScale;
uniform highp float uBalatroPaintFactor;
uniform int uBalatroPaintIterations;
uniform highp vec4 uColor1;
uniform highp vec4 uColor2;
uniform highp vec4 uColor3;
uniform highp float uColorMix1;
uniform highp float uColorMix2;

vec2 balatroPaintWarp(vec2 areaResolution, vec2 areaXY, float time) {
  highp vec2 uv = areaXY / areaResolution;

	//Now add the paint effect to the swirled UV
  // uv *= 30.f;
  float speed = uBalatroTimeScale * time;
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
  highp float contrastModifier = (0.25f * uColorMix1 + 0.5f * uColorMix2 + 1.2f);
  highp float paintLookupScale = min(2.f, max(0.f, length(uv) * (0.035f) * contrastModifier));
  highp float mixCol1 = max(0.f, 1.f - contrastModifier * abs(1.f - paintLookupScale));
  highp float mixCol2 = max(0.f, 1.f - contrastModifier * abs(paintLookupScale));
  highp float mixCol3 = 1.f - min(1.f, mixCol1 + mixCol2);

  highp vec4 resultColor = (0.3f / uColorMix1) * uColor1 + (1.f - 0.3f / uColorMix1) * (uColor1 * mixCol1 + uColor2 * mixCol2 + vec4(mixCol3 * uColor3.rgb, mixCol3 * uColor1.a));
  return resultColor;
}

void main() {
  if(!uReady) {
    outColor = vec4(0);
    return;
  }

  vec2 halfRes = uResolution / 2.0f;

  vec2 texSize = vec2(textureSize(uTextureBackdrop, 0));
  vec2 texSizeRatio = texSize / uResolution;
  float minTexSizeRatio = min(texSizeRatio.x, texSizeRatio.y);
  vec2 scaledPx = (((gl_FragCoord.xy - halfRes) * minTexSizeRatio) / (texSizeRatio * uImageScale)) + halfRes;

  vec2 warpedUv = balatroPaintWarp(texSize, scaledPx * texSizeRatio, uTime);

  vec4 baseColor;
  if(uUseBackdropImage && !uForceColorMode) {
    baseColor = texture(uTextureBackdrop, flipY(warpedUv));
  } else {
    baseColor = balatroColorLookup(warpedUv);
  }

  outColor = baseColor;
}
