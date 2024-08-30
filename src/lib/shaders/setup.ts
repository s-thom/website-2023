import {
  createBufferInfoFromArrays,
  createProgramInfo,
  createTextures,
  drawBufferInfo,
  resizeCanvasToDisplaySize,
  setBuffersAndAttributes,
  setUniforms,
  type TextureOptions,
} from "twgl.js";

export interface ShaderSetupOptions {
  canvas: HTMLCanvasElement;
  shaders: { vertex: string; fragment: string };
  uniforms?: Record<string, any>;
  onFrame?: (time: DOMHighResTimeStamp) => void;
  textures?: TextureOptions[];
  onTexturesReady?: () => void;
}

export function setupShader(options: ShaderSetupOptions) {
  const { canvas, shaders } = options;
  const gl = canvas.getContext("webgl2", { premultipliedAlpha: false });
  if (!gl) {
    canvas.classList.add("fully-hidden");
    throw new Error("Unable to create WebGL2 context on canvas");
  }

  const programInfo = createProgramInfo(gl, [shaders.vertex, shaders.fragment]);

  const arrays = {
    // Cover the entire canvas with a single quad
    // TODO: replace with single tri?
    aPosition: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
  };
  const bufferInfo = createBufferInfoFromArrays(gl, arrays);

  let frameCount = 0;
  let lastTime: DOMHighResTimeStamp | undefined;
  let animFrameHandle: number;

  let hasBeenStarted = false;
  let isIntersecting = false;

  function queueFrame() {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    animFrameHandle = requestAnimationFrame(render);
  }
  function cancelFrame() {
    if (animFrameHandle) {
      lastTime = undefined;
      cancelAnimationFrame(animFrameHandle);
    }
  }

  // Intersection observer to stop the shader if it goes off-screen
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.target === canvas) {
          const prevIntersecting = isIntersecting;
          isIntersecting = entry.intersectionRatio > 0;

          if (hasBeenStarted) {
            if (isIntersecting && !prevIntersecting) {
              queueFrame();
            } else {
              cancelFrame();
            }
          }
        }
      }
    },
    { threshold: [0] },
  );
  observer.observe(canvas);

  let textureUniforms: Record<string, WebGLTexture> = {};
  let texturesReady = true;
  if (options.textures && options.textures.length > 0) {
    texturesReady = false;
    textureUniforms = createTextures(
      gl,
      Object.fromEntries(
        options.textures.map((init, i) => [`iChannel${i}`, init]),
      ),
      () => {
        texturesReady = true;
        options.onTexturesReady?.();
      },
    );
  }

  function render(time: DOMHighResTimeStamp) {
    if (!gl) {
      // eslint-disable-next-line no-console
      console.error("No GL context in render loop, exiting loop");
      return;
    }

    if (!texturesReady) {
      throw new Error(
        "Shader has textures, but they have not been loaded yet.",
      );
    }

    resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    if (options.onFrame) {
      options.onFrame(time);
    }

    const lastFrameDelta = lastTime === undefined ? 0 : time - lastTime;

    const uniforms = {
      ...options.uniforms,
      // Shadertoy's built-in uniforms
      // https://www.shadertoy.com/howto
      // uniform vec3 iResolution;
      // uniform float iTime;
      // uniform float iTimeDelta;
      // uniform float iFrame;
      // uniform float iChannelTime[4];
      // uniform vec4 iMouse;
      // uniform vec4 iDate;
      // uniform float iSampleRate;
      // uniform vec3 iChannelResolution[4];
      // uniform samplerXX iChanneli;
      iResolution: [gl.canvas.width, gl.canvas.height, 1],
      iTime: time * 0.001,
      iTimeDelta: lastFrameDelta,
      iFrame: frameCount,
      ...textureUniforms,
    };

    gl.useProgram(programInfo.program);
    setBuffersAndAttributes(gl, programInfo, bufferInfo);
    setUniforms(programInfo, uniforms);
    drawBufferInfo(gl, bufferInfo);

    frameCount++;
    lastTime = time;
    animFrameHandle = requestAnimationFrame(render);
  }

  return {
    gl,
    start: () => {
      hasBeenStarted = true;
      if (isIntersecting) {
        queueFrame();
      }
    },
    stop: () => {
      hasBeenStarted = true;
      cancelFrame();
    },
    destroy: () => {
      observer.disconnect();
    },
  };
}
