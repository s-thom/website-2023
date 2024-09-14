import { useSyncExternalStore } from "react";
import {
  addStickerStoreListener,
  getStickerStore,
} from "../../../stickers/store";
import type { StickerStoreValue } from "../../../stickers/types";

const OFFLINE_STORE_VALUE: StickerStoreValue = { enabled: false, stickers: [] };

export function useStickers(): StickerStoreValue {
  const value = useSyncExternalStore<StickerStoreValue>(
    addStickerStoreListener,
    () => getStickerStore(),
    () => OFFLINE_STORE_VALUE,
  );

  return value;
}
