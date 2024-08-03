#version 300 es

precision highp float;

#define flipY(v2) vec2(v2.x, 1.0 - v2.y)

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uContentRect;

uniform bool uHasCutout;
uniform float uImageScale;
uniform float uImageOverlayBlack;
uniform float uImageOverlayWhite;

uniform bool uHasShade;

uniform bool uTexturesLoaded;
uniform sampler2D uTextureBackdrop;

const float PI = 3.141529f;

out vec4 outColor;

// Balatro
const bool polar_coordinates = false;  //cool polar coordinates effect
const vec2 polar_center = vec2(0.5f);
const float polar_zoom = 1.f;
const float polar_repeat = 1.f;

uniform highp float balatro_time_scale;
uniform highp float balatro_paint_factor;
uniform int balatro_paint_iterations;
uniform highp float spin_rotation;
const highp float spin_speed = 1.0f;
const highp vec2 offset = vec2(0.f, 0.f);
uniform highp vec4 colour_1;
uniform highp vec4 colour_2;
uniform highp vec4 colour_3;
uniform highp float contrast;
uniform highp float spin_amount;
const highp float pixel_filter = 700.f;
#define SPIN_EASE 1.0

// vec2 balatro_coords() {
// 	//Convert to UV coords (0-1) and floor for pixel effect
//   highp float pixel_size = length(screenSize.xy) / pixel_filter;
//   highp vec2 uv = (floor(screen_coords.xy * (1.f / pixel_size)) * pixel_size - 0.5f * screenSize.xy) / length(screenSize.xy) - offset;
//   highp float uv_len = length(uv);

// 	//Adding in a center swirl, changes with time. Only applies meaningfully if the 'spin amount' is a non-zero number
//   highp float speed = (spin_rotation * SPIN_EASE * 0.2f) + 302.2f;
//   highp float new_pixel_angle = (atan(uv.y, uv.x)) + speed - SPIN_EASE * 20.f * (1.f * spin_amount * uv_len + (1.f - 1.f * spin_amount));
//   highp vec2 mid = (screenSize.xy / length(screenSize.xy)) / 2.f;
//   uv = (vec2((uv_len * cos(new_pixel_angle) + mid.x), (uv_len * sin(new_pixel_angle) + mid.y)) - mid);

// 	//Now add the paint effect to the swirled UV
//   uv *= 30.f;
//   speed = time * (spin_speed);
//   highp vec2 uv2 = vec2(uv.x + uv.y);

//   for(int i = 0; i < 5; i++) {
//     uv2 += sin(max(uv.x, uv.y)) + uv;
//     uv += 0.5f * vec2(cos(5.1123314f + 0.353f * uv2.y + speed * 0.131121f), sin(uv2.x - 0.113f * speed));
//     uv -= 1.0f * cos(uv.x + uv.y) - 1.0f * sin(uv.x * 0.711f - uv.y);
//   }
// }

vec4 effect(vec2 screenSize, vec2 screen_coords, float time) {
	//Convert to UV coords (0-1) and floor for pixel effect
  // highp float pixel_size = length(screenSize.xy) / pixel_filter;
  // highp vec2 uv = (floor(screen_coords.xy * (1.f / pixel_size)) * pixel_size - 0.5f * screenSize.xy) / length(screenSize.xy) - offset;
  highp vec2 uv = screen_coords / screenSize;
  highp float uv_len = length(uv);

	//Adding in a center swirl, changes with time. Only applies meaningfully if the 'spin amount' is a non-zero number
  highp float speed = (spin_rotation * SPIN_EASE * 0.2f) + 302.2f;
  highp float new_pixel_angle = (atan(uv.y, uv.x)) + speed - SPIN_EASE * 20.f * (1.f * spin_amount * uv_len + (1.f - 1.f * spin_amount));
  highp vec2 mid = (screenSize.xy / length(screenSize.xy)) / 2.f;
  uv = (vec2((uv_len * cos(new_pixel_angle) + mid.x), (uv_len * sin(new_pixel_angle) + mid.y)) - mid);

	//Now add the paint effect to the swirled UV
  // uv *= 30.f;
  speed = balatro_time_scale * time * (spin_speed);
  highp vec2 uv2 = vec2(uv.x + uv.y);
  highp vec2 uv3 = vec2(uv);

  for(int i = 0; i < balatro_paint_iterations; i++) {
    uv2 += sin(max(uv3.x, uv3.y)) + uv3;
    uv3 += 0.5f * vec2(cos(5.1123314f + 0.353f * uv2.y + speed * 0.131121f), sin(uv2.x - 0.113f * speed));
    uv3 -= 1.0f * cos(uv3.x + uv3.y) - 1.0f * sin(uv3.x * 0.711f - uv3.y);
  }

  uv = mix(uv, uv3, balatro_paint_factor);

  vec4 texColor = texture(uTextureBackdrop, flipY(uv));
  return texColor;

	// //Make the paint amount range from 0 - 2
  // highp float contrast_mod = (0.25f * contrast + 0.5f * spin_amount + 1.2f);
  // highp float paint_res = min(2.f, max(0.f, length(uv) * (0.035f) * contrast_mod));
  // highp float c1p = max(0.f, 1.f - contrast_mod * abs(1.f - paint_res));
  // highp float c2p = max(0.f, 1.f - contrast_mod * abs(paint_res));
  // highp float c3p = 1.f - min(1.f, c1p + c2p);

  // highp vec4 ret_col = (0.3f / contrast) * colour_1 + (1.f - 0.3f / contrast) * (colour_1 * c1p + colour_2 * c2p + vec4(c3p * colour_3.rgb, c3p * colour_1.a));
  // return ret_col;
}

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

  // vec4 texColor = texture(uTextureBackdrop, flipY(scaledTexCoord));

  vec4 balatroColor = effect(texSize, scaledPx * texSizeRatio, uTime);

  // vec4 darkened = mix(balatroColor, vec4(0, 0, 0, 1), uHasShade ? uImageOverlayBlack : 0.0f);
  // vec4 darkened = mix(texColor, vec4(0, 0, 0, 1), uHasShade ? uImageOverlayBlack : 0.0f);
  // vec4 lightened = mix(darkened, vec4(1, 1, 1, 1), uImageOverlayWhite);

  // outColor = texColor;
  outColor = balatroColor;
  // outColor = lightened;
}
