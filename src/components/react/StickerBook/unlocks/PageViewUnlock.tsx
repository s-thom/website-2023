import { useEffect, useMemo, useState } from "react";
import { STICKER_TYPES_BY_RARITY } from "../../../../stickers/data";
import type { StickerTypes } from "../../../../stickers/types";
import { arrayRandom, range } from "../../../../util";
import { useStickers } from "../../hooks/useStickers";
import { addSticker } from "./util";

const MIN_STICKER_UNLOCKS_ON_PAGE = 1;
const MAX_STICKER_UNLOCKS_ON_PAGE = 5;
const UNCOMMON_STICKER_CHANCE = 0.25;

interface ScrollThresholdData {
  progress: number;
  shouldGiveCommon: boolean;
  shouldGiveUncommon: boolean;
  shouldGiveRare: boolean;
}

export interface PageViewUnlockProps {
  pageId: string;
  specialStickerType?: StickerTypes;
}

export function PageViewUnlock({
  pageId,
  specialStickerType,
}: PageViewUnlockProps) {
  const { stickers } = useStickers();
  const stickersUnlockedOnPage = useMemo(
    () => stickers.filter((sticker) => sticker.unlockPageId === pageId),
    [pageId, stickers],
  );

  const [lastMatchedThreshold, setLastMatchedThreshold] = useState(0);
  const [thresholds, setThresholds] = useState<ScrollThresholdData[]>([]);

  const hasGivenRare = useMemo(() => {
    if (!specialStickerType) {
      return true;
    }

    return !!stickers.find(
      (sticker) =>
        sticker.unlockPageId === pageId && sticker.type === specialStickerType,
    );
  }, [pageId, specialStickerType, stickers]);

  useEffect(() => {
    function onResize() {
      const viewportHeight = window.innerHeight;
      // The amount that can be scrolled
      const pageHeight = document.documentElement.scrollHeight - viewportHeight;

      // If there's not much to scroll, only give one sticker for the page
      const numViewports = pageHeight / viewportHeight;
      const numStickersToGive = Math.max(
        Math.min(Math.ceil(numViewports), MAX_STICKER_UNLOCKS_ON_PAGE),
        MIN_STICKER_UNLOCKS_ON_PAGE,
      );
      const allThresholds = range(numStickersToGive).map<ScrollThresholdData>(
        (i) => ({
          progress: (i + 1) / (numStickersToGive + 1),
          shouldGiveCommon: true,
          shouldGiveUncommon: Math.random() < UNCOMMON_STICKER_CHANCE,
          shouldGiveRare: !hasGivenRare,
        }),
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
  }, [hasGivenRare, stickersUnlockedOnPage.length]);

  useEffect(() => {
    function onScrollEnd() {
      const viewportHeight = window.innerHeight;
      // The amount that can be scrolled
      const pageHeight = document.documentElement.scrollHeight - viewportHeight;

      const progress = document.documentElement.scrollTop / pageHeight;
      const matchedThresholds = thresholds.filter(
        (threshold) =>
          threshold.progress > lastMatchedThreshold &&
          threshold.progress < progress,
      );

      if (matchedThresholds.length > 0) {
        setLastMatchedThreshold(progress);

        // Prevent rare stickers from being given twice if a lot of scrolling happened at once
        let didGiveRare = false;

        matchedThresholds.forEach((threshold) => {
          if (threshold.shouldGiveCommon) {
            addSticker(arrayRandom(STICKER_TYPES_BY_RARITY.common), pageId);
          }
          if (threshold.shouldGiveUncommon) {
            addSticker(arrayRandom(STICKER_TYPES_BY_RARITY.uncommon), pageId);
          }

          if (threshold.shouldGiveRare && specialStickerType && !didGiveRare) {
            didGiveRare = true;
            addSticker(specialStickerType, pageId);
          }
        });
      }
    }

    window.addEventListener("scrollend", onScrollEnd);
    return () => {
      window.removeEventListener("scrollend", onScrollEnd);
    };
  }, [lastMatchedThreshold, pageId, specialStickerType, thresholds]);

  return null;
}
