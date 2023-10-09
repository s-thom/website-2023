import clsx from "clsx";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import styles from "./StickerBook.module.css";
import type { StickerInfo } from "./types";

export interface StickerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  sticker: StickerInfo;
}

export const Sticker = forwardRef(function Sticker(
  { sticker, className, ...rest }: StickerProps,
  ref,
) {
  return (
    <button
      className={clsx(styles.sticker, className)}
      ref={ref as any}
      {...rest}
    >
      {sticker.id}: {sticker.type}
    </button>
  );
});
