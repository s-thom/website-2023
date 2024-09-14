import { useSyncExternalStore } from "react";
import { type StickerStoreValue, addStickerStoreListener, getStickerStore } from '../../../stickers/stickers';

export function useStickers(): StickerStoreValue {
  const value = useSyncExternalStore<StickerStoreValue>(
    addStickerStoreListener,
    () => getStickerStore(),
    () => getStickerStore(),
  );

  return value;
}
