import { convertLchToLab, convertLrgbToRgb, convertOklabToLrgb } from "culori";
import seedrandom from "seedrandom";
import type {
  SlidersInitialisedEvent,
  SlidersOptionsMap,
} from "../../lib/shaders/sliders";
import { range } from "../../util";
import fragment from "./backdrop.frag";
import vertex from "./default.vert";
import { Interpolate, easeInOutCubic } from "./interpolate";
import { setupShader } from "./setup";
import type { ShaderOptions } from "./types";

const MIN_PAINT_FACTOR = 0.15;
const MAX_PAINT_FACTOR = 0.45;

function OKLchToRGBA(lightness: number, chroma: number, hue: number) {
  const converted = convertLrgbToRgb(
    convertOklabToLrgb(convertLchToLab({ l: lightness, c: chroma, h: hue })),
  );

  return [converted.r, converted.g, converted.b, 1.0];
}

function getBackgroundColors(): {
  color1: number[];
  color2: number[];
  color3: number[];
} {
  const documentStyle = getComputedStyle(document.documentElement);

  const lightnessString = documentStyle.getPropertyValue(
    "--color-dynamic-lightness",
  );
  const chromaString = documentStyle.getPropertyValue("--color-dynamic-chroma");
  const hueString = documentStyle.getPropertyValue("--color-dynamic-angle");

  const lightness = parseFloat(lightnessString);
  const chroma = parseFloat(chromaString);
  const hue = parseFloat(hueString.replace(/deg$/, ""));

  return {
    color1: OKLchToRGBA(lightness, chroma - 0.03, hue),
    color2: OKLchToRGBA(lightness, chroma, hue),
    color3: OKLchToRGBA(lightness - 0.15, chroma, hue - 15),
  };
}

export function setupBackdropShader(
  canvas: HTMLCanvasElement,
  options: ShaderOptions,
) {
  let offset = [0, 0];
  let warpScale = 1;
  if (options.imageUrl) {
    const random = seedrandom(options.id);
    offset = [Math.floor(random() * 21) - 10, Math.floor(random() * 21) - 10];
    warpScale = random() * 2 + 1;
  }

  const editableUniforms: SlidersOptionsMap = {};
  window.addEventListener(
    "slidersinitialised",
    (event: InstanceType<typeof SlidersInitialisedEvent>) => {
      event.detail.registerSliders(`backdrop-${options.id}`, editableUniforms);
    },
  );

  const uniforms: Record<string, unknown> = {};

  const backgroundUrl = options.imageUrl;
  const hasBackground = backgroundUrl !== undefined;

  uniforms.uUseColors = !hasBackground;
  uniforms.uWarpIterations = hasBackground ? 5 : 9;
  uniforms.uOffset = offset;
  uniforms.uWarpScale = warpScale;
  // uniforms.uOffset = [0, 0];
  // uniforms.uWarpScale = 1;

  function setUniformColors() {
    const colors = getBackgroundColors();

    uniforms.uColor1 = colors.color1;
    uniforms.uColor2 = colors.color2;
    uniforms.uColor3 = colors.color3;
  }
  setUniformColors();

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motionInterpolator = new Interpolate(
    easeInOutCubic,
    hasBackground || motionQuery.matches ? 0 : 1,
  );
  motionQuery.addEventListener("change", (event) => {
    motionInterpolator.setTarget(event.matches ? 0 : 1, 1000);
  });

  const themeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  themeQuery.addEventListener("change", () => {
    requestAnimationFrame(() => {
      setUniformColors();
    });
  });

  // Intersection observer for changing multiplier during scroll
  let canvasIntersectionRatio = 1;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.target === canvas) {
          canvasIntersectionRatio = entry.intersectionRatio;
        }
      }
    },
    {
      // Fire callback on many changes. 100 should be smooth enough.
      threshold: range(101).map((n) => n / 100),
    },
  );
  observer.observe(canvas);

  const { start, stop } = setupShader({
    canvas,
    shaders: { vertex, fragment },
    uniforms,
    onFrame: () => {
      uniforms.uWarpAmount =
        ((1 - canvasIntersectionRatio) * (MAX_PAINT_FACTOR - MIN_PAINT_FACTOR) +
          MIN_PAINT_FACTOR) *
        motionInterpolator.getValue();
      uniforms.uPixelated = false; // Used to be true for the Minecraft theme
    },
    textures: hasBackground ? [{ src: backgroundUrl }] : undefined,
    onTexturesReady: () => {
      motionInterpolator.setTarget(motionQuery.matches ? 0 : 1, 10_000);
      start();
    },
  });

  motionInterpolator.on("start", ({ current }) => {
    if (current === 0) {
      start();
    }
  });
  motionInterpolator.on("end", ({ current }) => {
    if (current === 0) {
      stop();
    }
  });

  if (!hasBackground) {
    start();
  }
}
