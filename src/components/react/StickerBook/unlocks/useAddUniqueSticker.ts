import { useMemo, useState } from "react";
import { useStore } from "../../store";
import { type StickerTypes } from "../types";
import { addSticker as sendAddStickerEvent } from "./util";

export interface UseAddUniqueStickerOptions {
  type: StickerTypes | "none";
  pageId?: string;
}

export function useAddUniqueSticker({
  pageId,
  type,
}: UseAddUniqueStickerOptions) {
  const stickers = useStore((store) => store.stickers);
  const isUnlocked = useMemo(
    () => !!stickers.find((sticker) => sticker.type === type),
    [stickers, type],
  );
  const [isRecentlyUnlocked, setIsRecentlyUnlocked] = useState(false);

  function addSticker() {
    if (type === "none") {
      return;
    }

    sendAddStickerEvent(type, pageId);
    setIsRecentlyUnlocked(true);
  }

  return {
    addSticker,
    isUnlocked,
    isRecentlyUnlocked,
  };
}
