#version 300 es

precision highp float;

#define flipY(v2) vec2(v2.x, 1.0 - v2.y)

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uContentRect;

uniform bool uHasCutout;
uniform float uImageScale;
uniform vec2 uTexRandSin;
uniform vec2 uTexRandPosMult;
uniform vec2 uTexRandMult;
uniform float uImageOverlayBlack;
uniform float uImageOverlayWhite;

uniform bool uHasShade;

uniform bool uTexturesLoaded;
uniform sampler2D uTextureBackdrop;

out vec4 outColor;

void main() {
  // Big Box exclusion zone
  vec2 gap = (uResolution - uContentRect) / vec2(2);
  if(uHasCutout && all(greaterThan(gl_FragCoord.xy, gap)) && all(lessThan(gl_FragCoord.xy, gap + uContentRect))) {
    outColor = vec4(0);
    return;
  }

  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 halfRes = uResolution / 2.0f;

  vec2 texSize = vec2(textureSize(uTextureBackdrop, 0));
  vec2 onePixel = vec2(1) / texSize;
  vec2 texSizeRatio = texSize / uResolution;
  float minTexSizeRatio = min(texSizeRatio.x, texSizeRatio.y);

  vec2 scaledPx = (((gl_FragCoord.xy - halfRes) * minTexSizeRatio) / (texSizeRatio * uImageScale)) + halfRes;
  vec2 scaledTexCoord = scaledPx / uResolution;

  vec2 sinedTexCoord = scaledTexCoord + vec2(sin((uTime * uTexRandSin.x) + (gl_FragCoord.x * uTexRandPosMult.x)) * uTexRandMult.x, sin((uTime * uTexRandSin.y) + (gl_FragCoord.y * uTexRandPosMult.y)) * uTexRandMult.y);

  vec4 texColor = texture(uTextureBackdrop, flipY(sinedTexCoord));

  vec4 darkened = mix(texColor, vec4(0, 0, 0, 1), uHasShade ? uImageOverlayBlack : 0.0f);
  vec4 lightened = mix(darkened, vec4(1, 1, 1, 1), uImageOverlayWhite);

  outColor = lightened;
}
