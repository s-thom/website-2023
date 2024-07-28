#version 300 es

precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uContentRect;

uniform bool uTexturesLoaded;
uniform sampler2D uTextureBackdrop;

in vec2 vTextureCoord;

out vec4 outColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  vec2 gap = (uResolution - uContentRect) / vec2(2, 2);

  // Big Box exclusion zone
  if (all(greaterThan(gl_FragCoord.xy, gap)) && all(lessThan(gl_FragCoord.xy, gap + uContentRect))) {
    outColor = vec4(0, 0, 0, 0);
    return;
  }

  vec2 baseTexturePos = vec2(vTextureCoord.x, 1.0 - vTextureCoord.y);

  outColor = texture(uTextureBackdrop, baseTexturePos);

  // outColor = vec4(1, 1, 1, 0.3);
}
