import clsx from "clsx";
import { type ReactNode } from "react";
import { STICKER_TYPE_MAP } from "../../data";
import type { StickerTypes } from "../../types";
import { LottieSticker } from "./LottieSticker.tsx";
import styles from "./Sticker.module.css";

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
      child = <LottieSticker data={data} animated={animated} />;
      break;
    default:
      return null;
  }

  return <div className={clsx(styles.sticker, className)}>{child}</div>;
}
