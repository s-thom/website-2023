import { range } from "../../util";
import { Interpolate, easeOutCubic } from "./interpolate";
import fragment from "./rainbow-bg.frag";
import vertex from "./rainbow-bg.vert";
import { setupShader } from "./setup";

type Vec4 = [number, number, number, number];
type Palette = [Vec4, Vec4, Vec4, Vec4, Vec4, Vec4, Vec4, Vec4];

const RAW_PALETTES: Palette[] = [
  [
    [0.76, 0.285, 25, 1],
    [0.76, 0.285, 60, 1],
    [0.76, 0.285, 100, 1],
    [0.76, 0.285, 145, 1],
    [0.76, 0.285, 170, 1],
    [0.76, 0.285, 225, 1],
    [0.76, 0.285, 290, 1],
    [0.76, 0.285, 335, 1],
  ],
  [
    [0.576, 0.1119, 171.63, 1],
    [0.7649, 0.1401, 174.12, 1],
    [0.8724, 0.0945, 162.78, 1],
    [0.997, 0, 206.5, 1],
    [0.7385, 0.0944, 250.13, 1],
    [0.4898, 0.1981, 278.84, 1],
    [0.3232, 0.1558, 293.78, 1],
    [0.1, 0, 233, 0],
  ],
  [
    [0, 0, 328, 1],
    [0, 0, 328, 1],
    [0.7219, 0, 328, 1],
    [0.7219, 0, 328, 1],
    [0.9702, 0, 328, 1],
    [0.9702, 0, 328, 1],
    [0.4233, 0.1945, 328, 1],
    [0.4233, 0.1945, 328, 1],
  ],
  [
    [0.644, 0.1732, 144, 1],
    [0.644, 0.1732, 144, 1],
    [0.8186, 0.1265, 130, 1],
    [0.8186, 0.1265, 130, 1],
    [0.9702, 0, 130, 1],
    [0.7219, 0, 130, 1],
    [0.7219, 0, 144, 1],
    [0, 0, 144, 1],
  ],
];
const PALETTES = RAW_PALETTES.map((palette) =>
  palette.map((color) => [
    color[0],
    color[1],
    (color[2] / 180) * Math.PI,
    color[3],
  ]),
).map((palette) => palette.flat());

export function setupRainbowBgShader(canvas: HTMLCanvasElement) {
  let paletteIndex = 0;
  const getNextPaletteIndex = () => (paletteIndex + 1) % PALETTES.length;

  const uniforms: Record<string, unknown> = {
    uMix: 1,
    uColorsCurrent: PALETTES[paletteIndex],
    uColorsNext: PALETTES[getNextPaletteIndex()],
    uWipeProgress: 0,
    uWipeOrigin: [canvas.width / 2, canvas.height / 2],
  };

  function setUniformColors() {
    const backgroundRgb = getComputedStyle(document.body).getPropertyValue(
      "background-color",
    );
    const match = backgroundRgb.match(/rgba?\((\d+)\D+(\d+)\D+(\d+)/);
    if (match) {
      uniforms.uBackgroundColor = [
        parseInt(match[1]) / 255,
        parseInt(match[2]) / 255,
        parseInt(match[3]) / 255,
        1,
      ];
    } else {
      uniforms.uBackgroundColor = [1, 1, 1, 1];
    }
  }
  setUniformColors();

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motionInterpolator = new Interpolate(easeOutCubic, 0);
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

  const wipeInterpolator = new Interpolate((i) => i, 0);
  wipeInterpolator.on("end", ({ current }) => {
    if (current === 1) {
      paletteIndex = getNextPaletteIndex();
      uniforms.uColorsCurrent = PALETTES[paletteIndex];
      uniforms.uColorsNext = PALETTES[getNextPaletteIndex()];

      wipeInterpolator.setTarget(0, 0); // instant reset
    }
  });

  function triggerTransition(origin?: [number, number]) {
    uniforms.uWipeOrigin = origin ?? [canvas.width / 2, canvas.height / 2];
    wipeInterpolator.setTarget(1, 3000);
  }

  const FLIP_PERIOD = 20_000;

  let lastTime = 0;
  const { start, stop } = setupShader({
    canvas,
    shaders: { vertex, fragment },
    uniforms,
    onFrame: (time, elapsedTime) => {
      uniforms.uMix = motionInterpolator.getValue();
      uniforms.uIntersection = canvasIntersectionRatio;
      uniforms.uWipeProgress = wipeInterpolator.getValue();

      if (
        Math.floor(lastTime / FLIP_PERIOD) <
        Math.floor(elapsedTime / FLIP_PERIOD)
      ) {
        wipeInterpolator.setTarget(1, 2500);
      }

      lastTime = elapsedTime;
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

  if (!motionQuery.matches) {
    motionInterpolator.setTarget(1, 2000);
  }

  return { triggerTransition };
}
