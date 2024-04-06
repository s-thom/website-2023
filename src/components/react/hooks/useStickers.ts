import { useEffect, useState } from "react";
import { getStickerStore } from "../../../stickers/store";
import type { StickerInfo, StickerStoreValue } from "../../../stickers/types";

export interface UseStickersValue {
  enabled: boolean;
  stickers: StickerInfo[];
}

export function useStickers(): StickerStoreValue {
  const [store, setStore] = useState(() => getStickerStore());

  useEffect(() => {
    window.addEventListener("stickerschanged", (event) =>
      setStore(event.detail.state),
    );
  }, []);

  return store;
}
