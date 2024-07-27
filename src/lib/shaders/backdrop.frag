#version 300 es

precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uContentRect;

out vec4 outColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  vec2 gap = (uResolution - uContentRect) / vec2(2, 2);

  // Big Box exclusion zone
  if (all(greaterThan(gl_FragCoord.xy, gap)) && all(lessThan(gl_FragCoord.xy, gap + uContentRect))) {
    outColor = vec4(0, 0, 0, 0);
    return;
  }

  outColor = vec4(1, 1, 1, 0.3);
}
