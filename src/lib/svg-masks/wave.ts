import type { PRNG } from "seedrandom";
import { trim } from "../util/trim";
import type { Point2 } from "./types";

function getDisplacement(random: PRNG, maxDisplacement: number) {
  return random() * maxDisplacement * 2 - maxDisplacement;
}

function midpointDisplacement(
  start: Point2,
  end: Point2,
  iterations: number,
  random: PRNG,
  waveHeight: number,
  height: number,
): Point2[] {
  let arr = [start, end];

  for (let i = 0; i < iterations; i++) {
    const nextArr: Point2[] = [];
    for (let j = 0; j < arr.length; j++) {
      const point = arr[j];
      if (j === 0) {
        nextArr.push(point);
        continue;
      }

      const prevPoint = arr[j - 1];
      const midpoint: Point2 = {
        x: (point.x + prevPoint.x) / 2,
        y: (point.y + prevPoint.y) / 2,
      };

      const iterationMax = waveHeight / 2 ** (i + 1);

      midpoint.y += getDisplacement(random, iterationMax);
      // Ensure the midpoint is within the bounds of the drawing area
      midpoint.y = Math.max(Math.min(midpoint.y, height), 0);

      nextArr.push(midpoint);
      nextArr.push(point);
    }

    arr = nextArr;
  }

  return arr;
}

function createPathData(
  random: PRNG,
  width: number,
  height: number,
  numIterations: number,
) {
  const topPadding = height / 4;
  const waveHeight = height - topPadding * 1.5;

  const initialHeightRandomness = waveHeight / 4;

  const points = midpointDisplacement(
    {
      x: 0,
      y:
        (waveHeight + getDisplacement(random, initialHeightRandomness)) / 2 +
        topPadding,
    },
    {
      x: width,
      y:
        (waveHeight + getDisplacement(random, initialHeightRandomness)) / 2 +
        topPadding,
    },
    numIterations,
    random,
    waveHeight,
    height,
  );

  let path = "M0 0";

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    if (i === 0) {
      // Start by drawing to first point.
      // L draws a straight lint from the cursor to the given absolute position.
      // L <x> <y>
      path += ` L${point.x} ${point.y}`;
    } else if (i === 1) {
      // Calculate control point for the curve.
      // For this, we'll just displace the midpoint of this first line segment by a bit.
      // This probably needs to be tweaked a little, since the stacked randomness is causing some curves to clip the
      // bounding box of the image as a whole.
      const prevPoint = points[i - 1];
      // May as well use the existing midpoint displacement code
      const [, control] = midpointDisplacement(
        point,
        prevPoint,
        1,
        random,
        waveHeight / 2,
        height,
      );

      // Q draws a quadratic bezier curve from the cursor using the control point and destination.
      // Q <xc> <yc> <xd> <yd>
      path += ` Q${control.x} ${control.y} ${point.x} ${point.y}`;
      // Use this for straight lines
      // path += ` L${point.x} ${point.y}`
    } else {
      // T continues a quadratic bezier curve, since quadratic curves are easy.
      // T <xd> <yd>
      path += ` T${point.x} ${point.y}`;
      // Use this for straight lines
      // path += ` L${point.x} ${point.y}`
    }

    if (i === points.length - 1) {
      // Finish line by completing the top box
      // Z draws a line from the cursor to the start point of the line
      // In our case it's like an 'L0 0'
      path += ` L${point.x} 0 Z`;
    }
  }

  return path;
}

interface AnimatedWavePathProps {
  random: PRNG;
  width: number;
  height: number;
  numDisplacements: number;
  animation: {
    numKeyframes: number;
    durationSeconds: number;
    currentFrameBeginOffset: number;
  };
  maskId?: string;
}

function createAnimatedPath({
  random,
  width,
  height,
  numDisplacements,
  animation,
  maskId,
}: AnimatedWavePathProps) {
  const keyframes = [...Array(animation.numKeyframes)].map(() =>
    createPathData(random, width, height, numDisplacements),
  );
  // For smooth looping, add the first keyframe to the end.
  // Note that from this point, the `numKeyframes` variable is technically one less than the number of actual keyframes.
  keyframes.push(keyframes[0]);

  const splineConfig = [...Array(animation.numKeyframes)].map(
    () => "0.5 0 0.5 1",
  );
  const times = keyframes.map((_, index) =>
    index !== animation.numKeyframes ? index * (1 / animation.numKeyframes) : 1,
  );

  return trim`
    <path
      class='full-motion mask-layer'
      d="${keyframes[0]}"
      mask="${maskId ? `url(#${maskId})` : ""}"
    >
      <animate
        attributeName='d'
        values="${keyframes.join(";")}"
        dur="${`${animation.durationSeconds}s`}"
        begin="${`${animation.currentFrameBeginOffset}s`}"
        repeatCount='indefinite'
        calcMode='spline'
        keySplines="${splineConfig.join(";")}"
        keyTimes="${times.join(";")}"
      ></animate>
    </path>
    <path
      class='reduced-motion mask-layer'
      d="${keyframes[0]}"
      mask="${maskId ? `url(#${maskId})` : ""}"
    />
  `;
}

interface CreateWaveMaskOptions {
  id: string;
  random: PRNG;
  width: number;
  height: number;
  pathCount: number;
  numDisplacements: number;
  animation: {
    numKeyframes: number;
    durationSeconds: number;
  };
  maskId?: string;
}

export function createWaveMask({
  id,
  random,
  width,
  height,
  pathCount,
  numDisplacements,
  animation,
  maskId,
}: CreateWaveMaskOptions) {
  const paths = [...Array(pathCount)].map((_, index) => {
    return createAnimatedPath({
      random,
      width,
      height,
      numDisplacements,
      maskId,
      animation: {
        numKeyframes: animation.numKeyframes,
        durationSeconds: animation.durationSeconds,
        currentFrameBeginOffset:
          (-animation.durationSeconds * index) / pathCount,
      },
    });
  });

  return trim`
    <mask id="${id}">
      <rect x='0' y='0' width="${width}" height="${height}" fill='#000000' />
      ${paths.join("\n")}
    </mask>
  `;
}
