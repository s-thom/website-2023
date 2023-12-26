import { useEffect } from "react";
import { v4 as uuid } from "uuid";
import { useStore } from "../store";
import type { AddStickerEvent } from "./types";

export function useStickerEventListeners() {
  const addSticker = useStore((store) => store.addSticker);

  useEffect(() => {
    function onAddStickerEvent(event: AddStickerEvent) {
      addSticker({
        id: event.detail.id ?? uuid(),
        pageId: event.detail.pageId,
        type: event.detail.type,
        coordinates: event.detail.coordinates ?? { x: 0, y: 0 },
      });
    }

    window.addEventListener("addsticker", onAddStickerEvent);

    return () => {
      window.removeEventListener("addsticker", onAddStickerEvent);
    };
  }, [addSticker]);
}
