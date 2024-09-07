#version 300 es
precision highp float;

uniform vec3 iResolution;

out vec4 outColor;

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;

  outColor = vec4(uv, 0, 1);
}
