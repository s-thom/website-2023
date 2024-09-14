import { clone } from "../util";
import { STICKER_TYPE_MAP } from "./data";
import { getStickerStore, setStickerStore } from "./store";
import type { StickerInfo, StickerTypes } from "./types";

export function canAddSticker(type: StickerTypes): boolean {
  const { stickers } = getStickerStore();

  // Ensure this is a valid sticker
  if (!(type in STICKER_TYPE_MAP)) {
    return false;
  }

  // Unique stickers can only be earned once, hence the name
  const stickerData = STICKER_TYPE_MAP[type];
  if (stickerData.rarity === "unique") {
    if (stickers.find((curr) => curr.type === type)) {
      return false;
    }
  }

  return true;
}

export function addSticker(sticker: StickerInfo): StickerInfo[] {
  const store = getStickerStore();
  const stickers = [...store.stickers];

  if (canAddSticker(sticker.type)) {
    stickers.push(sticker);
  }

  const copy = { ...store };
  copy.stickers = stickers;
  setStickerStore(copy);
  return store.stickers;
}

export function placeOnPage(
  stickerId: string,
  pageId: string | undefined,
  position: StickerInfo["position"],
): StickerInfo[] {
  const store = clone(getStickerStore());

  const sticker = store.stickers.find((s) => s.id === stickerId);
  if (!sticker) {
    return store.stickers;
  }

  sticker.zone = pageId;
  sticker.position = position;

  setStickerStore(store);
  return store.stickers;
}

export function removeFromPage(stickerId: string): StickerInfo[] {
  const store = clone(getStickerStore());

  const sticker = store.stickers.find((s) => s.id === stickerId);
  if (!sticker) {
    return store.stickers;
  }

  sticker.zone = undefined;
  sticker.position = { type: "none" };

  setStickerStore(store);
  return store.stickers;
}

export function toggleStickersEnabled(value?: boolean): boolean {
  const store = getStickerStore();

  const copy = { ...store };
  copy.enabled = value ?? !store.enabled;
  setStickerStore(copy);
  return store.enabled;
}
