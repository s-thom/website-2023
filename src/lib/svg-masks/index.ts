import seedrandom from "seedrandom";
import { createIconMask, type IconType as InnerIconType } from "./icon";
import { createNoneMask } from "./none";
import { createWaveMask } from "./wave";

export type MaskType = "none" | "waves";
export type IconType = "none" | InnerIconType;

export interface MaskOptions {
  id: string;
  seed: string;
  width: number;
  height: number;
  maskType: MaskType;
  iconType: IconType;
}

export function getMask({
  id,
  seed,
  width,
  height,
  maskType,
  iconType,
}: MaskOptions) {
  const random = seedrandom(seed);

  let content = "";

  const iconMaskId = `${id}-icon`;
  switch (iconType) {
    case "none":
      content += createNoneMask({ id: iconMaskId, height, width });
      break;
    default:
      content += createIconMask({
        id: `${id}-icon`,
        random,
        iconMaskId: iconType,
        width,
        height,
        minIconSize: height * 0.75,
        maxIconSize: height,
      });
  }

  switch (maskType) {
    case "waves":
      content += createWaveMask({
        id,
        random,
        width,
        height,
        numDisplacements: 2,
        pathCount: 7,
        animation: { durationSeconds: 60, numKeyframes: 4 },
        maskId: iconMaskId,
      });
      break;
    case "none":
    default:
      content += createNoneMask({
        id,
        height,
        width,
        maskId: iconMaskId,
      });
      break;
  }

  return `
    <svg
      xmlns='http://www.w3.org/2000/svg'
      style="min-width:${width}px;position:absolute;top:-100%"
      preserveAspectRatio='xMidYMid'
      viewBox="0 0 ${width} ${height}"
    >
      <style>
        .mask-layer {
          fill: rgba(255, 255, 255, 0.4);
        }
      </style>
      ${content}
    </svg>
  `;
}
