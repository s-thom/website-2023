import { useSyncExternalStore } from "react";
import {
  addStickerStoreListener,
  getStickerStore,
  type StickerStoreValue,
} from "../../../stickers/stickers";
import { useOptions } from "./useOptions";

export function useStickersEnabled(): boolean {
  const options = useOptions();
  return options.stickers === "on";
}

export function useStickers(): StickerStoreValue {
  const value = useSyncExternalStore<StickerStoreValue>(
    addStickerStoreListener,
    getStickerStore,
    getStickerStore,
  );

  return value;
}
