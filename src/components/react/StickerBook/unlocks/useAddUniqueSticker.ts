import { useMemo, useState } from "react";
import { useStore } from "../../store";
import type { StickerTypes } from "../types";

export interface UseAddUniqueStickerOptions {
  type: StickerTypes;
}

export function useAddUniqueSticker({ type }: UseAddUniqueStickerOptions) {
  const stickers = useStore((store) => store.stickers);
  const isUnlocked = useMemo(
    () => !!stickers.find((sticker) => sticker.type === type),
    [stickers, type],
  );
  const [isRecentlyUnlocked, setIsRecentlyUnlocked] = useState(false);

  function addSticker() {
    const event = new CustomEvent("addsticker", {
      detail: { type },
    });
    window.dispatchEvent(event);
    setIsRecentlyUnlocked(true);
  }

  return {
    addSticker,
    isUnlocked,
    isRecentlyUnlocked,
  };
}
