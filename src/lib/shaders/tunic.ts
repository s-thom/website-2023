import vertex from "./default.vert";
import { Interpolate, easeInOutCubic } from "./interpolate";
import { setupShader } from "./setup";
import fragment from "./tunic.frag";

export function setupTunicShader(canvas: HTMLCanvasElement) {
  const uniforms: Record<string, unknown> = {};

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motionInterpolator = new Interpolate(easeInOutCubic, 0);
  motionQuery.addEventListener("change", (event) => {
    motionInterpolator.setTarget(event.matches ? 0 : 1, 1000);
  });

  const { start, stop } = setupShader({
    canvas,
    shaders: { vertex, fragment },
    uniforms,
    onFrame: () => {},
    textures: [{ src: "/static/images/st-trunic.png" }],
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
}
