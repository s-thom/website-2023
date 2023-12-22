import seedrandom from "seedrandom";
import { createIconMask, type IconType as InnerIconType } from "./icon";
import { createNoneMask } from "./none";
import { createWaveMask } from "./wave";

export type BackgroundType = "none" | "waves";
export type IconType = "none" | InnerIconType;

export interface MaskOptions {
  id: string;
  seed: string;
  width: number;
  height: number;
  backgroundType: BackgroundType;
  iconType: IconType;
}

export function getMask({
  id,
  seed,
  width,
  height,
  backgroundType,
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

  switch (backgroundType) {
    case "waves":
      content += createWaveMask({
        id,
        random,
        width,
        height,
        numDisplacements: 2,
        pathCount: 3,
        animation: { durationSeconds: 60, numKeyframes: 4 },
        maskId: iconMaskId,
      });
      break;
    case "none":
    default:
      content += createNoneMask({
        id: iconMaskId,
        height,
        width,
        maskId: iconMaskId,
      });
      break;
  }

  return `
    <svg
      xmlns='http://www.w3.org/2000/svg'
      style="min-width:${width}px;display:none"
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
