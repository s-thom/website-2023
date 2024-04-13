import type { StickerRarity } from "../types";
import { el } from "./el";
import "./stickerFrame.css";

export interface StickerFrameProps {
  rarity: StickerRarity;
  showRarityLabel?: boolean;
  name?: string;
  description?: string;
  unlockedBy?: string;
  hideFrameOnCommon?: boolean;
  className?: string;
}

export function createStickerFrame(
  child: HTMLElement,
  options: StickerFrameProps,
): HTMLDivElement {
  const {
    rarity,
    showRarityLabel,
    description,
    name,
    unlockedBy,
    hideFrameOnCommon,
    className,
  } = options;

  const shouldHaveBorder = hideFrameOnCommon ? rarity !== "common" : true;

  const container = el(
    "div",
    {
      classes: [
        "sticker-frame",
        className,
        shouldHaveBorder && `sticker-frame-${rarity}`,
      ],
    },
    [
      showRarityLabel &&
        el("span", { classes: ["sticker-frame-rarity"], textContent: rarity }),
      child,
      Boolean(name || description || unlockedBy) &&
        el("div", { classes: ["sticker-frame-info", "flow"] }, [
          name &&
            el("span", { classes: ["sticker-frame-name"], textContent: name }),
          description &&
            el("span", {
              classes: ["sticker-frame-description"],
              textContent: description,
            }),
          unlockedBy &&
            el("span", { classes: ["sticker-frame-unlockedBy"] }, [
              document.createTextNode("Unlocked by: "),
              el("span", {
                classes: ["sticker-frame-description"],
                textContent: unlockedBy,
              }),
            ]),
        ]),
    ],
  );

  return container;
}
