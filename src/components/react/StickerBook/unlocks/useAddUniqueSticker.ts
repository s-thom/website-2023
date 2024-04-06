import { useMemo, useState } from "react";
import { type StickerTypes } from "../../../../stickers/types";
import { useStickers } from "../../hooks/useStickers";
import { addSticker as sendAddStickerEvent } from "./util";

export interface UseAddUniqueStickerOptions {
  type: StickerTypes | "none";
  pageId?: string;
}

export function useAddUniqueSticker({
  pageId,
  type,
}: UseAddUniqueStickerOptions) {
  const { stickers } = useStickers();
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
