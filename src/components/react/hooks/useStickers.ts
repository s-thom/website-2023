import { useSyncExternalStore } from "react";
import {
  addStickerStoreListener,
  getStickerStore,
} from "../../../stickers/store";
import type { StickerStoreValue } from "../../../stickers/types";

export function useStickers(): StickerStoreValue {
  const value = useSyncExternalStore<StickerStoreValue>(
    addStickerStoreListener,
    () => getStickerStore(),
  );

  return value;
}
