import clsx from "clsx";
import { type ReactNode } from "react";
import { STICKER_TYPE_MAP } from "../../data";
import type { StickerTypes } from "../../types";
import { LottieSticker, getLottieData } from "./LottieSticker.tsx";

export function loadSticker(type: StickerTypes): Promise<void> {
  const data = STICKER_TYPE_MAP[type];
  switch (data.type) {
    case "lottie":
      return getLottieData(type);
    default:
      return Promise.reject(new Error(`Unknown type ${type}`));
  }
}

export interface StickerProps {
  type: StickerTypes;
  animated?: boolean;
  className?: string;
}

export function Sticker({ type, animated, className }: StickerProps) {
  let child: ReactNode = null;

  const data = STICKER_TYPE_MAP[type];
  switch (data.type) {
    case "lottie":
      child = <LottieSticker type={type} animated={animated} />;
      break;
    default:
      return null;
  }

  return <div className={clsx("sticker", className)}>{child}</div>;
}
