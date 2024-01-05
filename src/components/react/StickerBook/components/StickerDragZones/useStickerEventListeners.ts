import { useEffect } from "react";
import { v4 as uuid } from "uuid";
import { useStore } from "../../../store";
import { pageCoordsToPosition } from "../../coordinates";
import { AddStickerEvent } from "../../types";

export function useStickerEventListeners() {
  const addSticker = useStore((store) => store.addSticker);

  useEffect(() => {
    function onAddStickerEvent(event: InstanceType<typeof AddStickerEvent>) {
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
  }, [addSticker]);
}
