import clsx from "clsx";
import { type ReactNode } from "react";
import styles from "../StickerBook.module.css";
import { STICKER_TYPE_MAP } from "../data";
import type { StickerInfo } from "../types";
import { LottieSticker } from "./LottieSticker.tsx";

export interface StickerProps {
  sticker: StickerInfo;
  className?: string;
}

export function Sticker({ sticker, className }: StickerProps) {
  let child: ReactNode = null;

  const data = STICKER_TYPE_MAP[sticker.type];
  switch (data.type) {
    case "lottie":
      child = <LottieSticker sticker={sticker} data={data} />;
      break;
    default:
      return null;
  }

  return <div className={clsx(styles.sticker, className)}>{child}</div>;
}
