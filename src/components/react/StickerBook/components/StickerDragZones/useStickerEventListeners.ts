import { useEffect } from "react";
import { v4 as uuid } from "uuid";
import { pageCoordsToPosition } from "../../../../../stickers/coordinates";
import { addSticker } from "../../../../../stickers/functions";
import type { AddStickerEventData } from "../../../../../stickers/types";

export function useStickerEventListeners() {
  useEffect(() => {
    function onAddStickerEvent(event: CustomEvent<AddStickerEventData>) {
      addSticker({
        id: uuid(),
        type: event.detail.type,
        unlockTime: Date.now(),
        unlockPageId: event.detail.pageId,
        zone: undefined,
        position: pageCoordsToPosition({ x: 0, y: 0 }),
      });
    }

    window.addEventListener("addsticker", onAddStickerEvent);

    return () => {
      window.removeEventListener("addsticker", onAddStickerEvent);
    };
  }, []);
}
