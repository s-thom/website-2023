import { STICKER_TYPE_MAP } from "./data";
import type {
  StickerInfo,
  StickerStoreValue,
  StickerTypes,
  StickersChangedEventData,
} from "./types";

const INITIAL_VALUE: StickerStoreValue = {
  enabled: true,
  stickers: [],
};
const STICKER_STORE_KEY = "sthom-website-stickers";

export function getStickerStore(): StickerStoreValue {
  const valueString = localStorage.getItem(STICKER_STORE_KEY);
  if (!valueString) {
    return INITIAL_VALUE;
  }

  const value: StickerStoreValue = JSON.parse(valueString);
  return value;
}

export function setStickerStore(value: StickerStoreValue) {
  // Fire event to listeners. Used to update state in React components
  const event = new CustomEvent<StickersChangedEventData>("stickerschanged", {
    detail: { state: value },
  });
  window.dispatchEvent(event);

  const valueString = JSON.stringify(value);
  localStorage.setItem(STICKER_STORE_KEY, valueString);
}

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

  if (canAddSticker(sticker.type)) {
    store.stickers.push(sticker);
  }

  setStickerStore(store);
  return store.stickers;
}

export function placeOnPage(
  stickerId: string,
  pageId: string | undefined,
  position: StickerInfo["position"],
): StickerInfo[] {
  const store = getStickerStore();

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
  const store = getStickerStore();

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

  store.enabled = value ?? !store.enabled;

  setStickerStore(store);
  return store.enabled;
}
