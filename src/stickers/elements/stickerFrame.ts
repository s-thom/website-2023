import clsx from "clsx/lite";
import { h } from "../../lib/h";
import type { StickerRarity } from "../types";
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

  const container = h(
    "div",
    {
      className: clsx(
        "sticker-frame",
        className,
        shouldHaveBorder && `sticker-frame-${rarity}`,
      ),
    },
    [
      showRarityLabel &&
        h(
          "span",
          { className: "sticker-frame-rarity", textContent: rarity },
          [],
        ),
      child,
      Boolean(name || description || unlockedBy) &&
        h("div", { className: "sticker-frame-info flow" }, [
          name &&
            h(
              "span",
              { className: "sticker-frame-name", textContent: name },
              [],
            ),
          description &&
            h(
              "span",
              {
                className: "sticker-frame-description",
                textContent: description,
              },
              [],
            ),
          unlockedBy &&
            h("span", { className: "sticker-frame-unlockedBy" }, [
              document.createTextNode("Unlocked by: "),
              h(
                "span",
                {
                  className: "sticker-frame-description",
                  textContent: unlockedBy,
                },
                [],
              ),
            ]),
        ]),
    ],
  );

  return container;
}
