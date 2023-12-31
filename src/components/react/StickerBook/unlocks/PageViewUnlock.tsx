import { useEffect, useMemo, useState } from "react";
import { arrayRandom, range } from "../../../../util";
import { useStore } from "../../store";
import { STICKER_TYPES_BY_RARITY } from "../data";
import type { StickerTypes } from "../types";
import { addSticker } from "./util";

const MAX_STICKER_UNLOCKS_ON_PAGE = 3;
const UNCOMMON_STICKER_CHANCE = 0.25;

export interface PageViewUnlockProps {
  pageId: string;
  specialSticker?: StickerTypes;
}

export function PageViewUnlock({ pageId }: PageViewUnlockProps) {
  const stickers = useStore((store) => store.stickers);
  const stickersUnlockedOnPage = useMemo(
    () => stickers.filter((sticker) => sticker.unlockPageId === pageId),
    [pageId, stickers],
  );

  const [lastMatchedThreshold, setLastMatchedThreshold] = useState(0);
  const [thresholds, setThresholds] = useState<number[]>([]);

  useEffect(() => {
    function onResize() {
      const viewportHeight = window.innerHeight;
      // The amount that can be scrolled
      const pageHeight = document.documentElement.scrollHeight - viewportHeight;

      // If there's not much to scroll, only give one sticker for the page
      const numStickersToGive =
        pageHeight > viewportHeight ? MAX_STICKER_UNLOCKS_ON_PAGE : 1;
      const allThresholds = range(numStickersToGive).map(
        (i) => (i + 1) / (numStickersToGive + 1),
      );

      // Remove a number of thresholds based on how many stickers have already been granted
      allThresholds.splice(0, stickersUnlockedOnPage.length);

      setThresholds(allThresholds);
    }

    onResize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [stickersUnlockedOnPage.length]);

  useEffect(() => {
    function onScrollEnd() {
      const viewportHeight = window.innerHeight;
      // The amount that can be scrolled
      const pageHeight = document.documentElement.scrollHeight - viewportHeight;

      const progress = document.documentElement.scrollTop / pageHeight;
      const matchedThresholds = thresholds.filter(
        (threshold) => threshold > lastMatchedThreshold && threshold < progress,
      );

      if (matchedThresholds.length > 0) {
        setLastMatchedThreshold(progress);

        matchedThresholds.forEach(() => {
          addSticker(arrayRandom(STICKER_TYPES_BY_RARITY.common), pageId);

          if (Math.random() < UNCOMMON_STICKER_CHANCE) {
            addSticker(arrayRandom(STICKER_TYPES_BY_RARITY.uncommon), pageId);
          }
        });
      }
    }

    window.addEventListener("scrollend", onScrollEnd);
    return () => {
      window.removeEventListener("scrollend", onScrollEnd);
    };
  }, [lastMatchedThreshold, pageId, thresholds]);

  return null;
}
