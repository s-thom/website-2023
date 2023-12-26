import { useEffect, useMemo, useState } from "react";
import { arrayRandom } from "../../../../util";
import { useStore } from "../../store";
import type { StickerTypes } from "../types";
import { addSticker } from "./util";

const MAX_STICKER_UNLOCKS_ON_PAGE = 3;
const ALLOWED_STICKER_TYPES: StickerTypes[] = [
  "clap",
  "fire",
  "thumbs-up",
  "light-bulb",
  "party-popper",
];

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

  const [thresholds, setThresholds] = useState<number[]>([]);

  useEffect(() => {
    function onResize() {
      const viewportHeight = window.innerHeight;
      // The amount that can be scrolled
      const pageHeight = document.documentElement.scrollHeight - viewportHeight;

      // If there's not much to scroll, only give one sticker for the page
      const numStickersToGive =
        pageHeight > viewportHeight ? MAX_STICKER_UNLOCKS_ON_PAGE : 1;
      const allThresholds = [...Array(numStickersToGive)].map(
        (_, i) => (i + 1) / (numStickersToGive + 1),
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
        (threshold) => threshold < progress,
      );
      matchedThresholds.forEach(() => {
        const type = arrayRandom(ALLOWED_STICKER_TYPES);
        addSticker(type, pageId);
      });
    }

    window.addEventListener("scrollend", onScrollEnd);
    return () => {
      window.removeEventListener("scrollend", onScrollEnd);
    };
  }, [pageId, thresholds]);

  return null;
}
