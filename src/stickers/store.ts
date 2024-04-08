import { clone } from "../util";
import { STICKER_TYPE_MAP } from "./data";
import type { StickerInfo, StickerStoreValue, StickerTypes } from "./types";

const INITIAL_VALUE: StickerStoreValue = {
  enabled: true,
  stickers: [],
};
const STICKER_STORE_KEY = "sthom-website-stickers";

type StickerStoreHandler<T> = (value: T) => void;
type StickerStoreMapper<T> = (value: StickerStoreValue) => T;
type Listener<T> = {
  handler: StickerStoreHandler<T>;
  mapper: StickerStoreMapper<T>;
  lastValue: T;
};
const DEFAULT_MAPPER: StickerStoreMapper<StickerStoreValue> = (value) => value;

const listeners: Listener<any>[] = [];

export function addStickerStoreListener(
  handler: StickerStoreHandler<StickerStoreValue>,
): () => void;
export function addStickerStoreListener<T>(
  handler: StickerStoreHandler<T>,
  mapper: StickerStoreMapper<T>,
): () => void;
export function addStickerStoreListener<T>(
  handler: StickerStoreHandler<T>,
  mapper?: StickerStoreMapper<T>,
): () => void {
  const listener: Listener<T> = {
    handler,
    mapper: mapper ?? (DEFAULT_MAPPER as StickerStoreMapper<T>),
    lastValue: {} as any, // Must be any unique value, doesn't matter what it is at this stage
  };
  listeners.push(listener);

  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

function sendValueToListeners(value: StickerStoreValue): void {
  listeners.forEach((listener) => {
    try {
      const newValue = listener.mapper(value);
      if (newValue !== listener.lastValue) {
        listener.handler(newValue);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error in state listener", err);
    }
  });
}

function readStickerStoreFromStorage(): StickerStoreValue {
  const valueString = localStorage.getItem(STICKER_STORE_KEY);
  if (!valueString) {
    return INITIAL_VALUE;
  }

  const value: StickerStoreValue = JSON.parse(valueString);
  return value;
}

function writeStickerStoreToStorage(value: StickerStoreValue): void {
  const valueString = JSON.stringify(value);
  localStorage.setItem(STICKER_STORE_KEY, valueString);
}

let currentStickerStoreValue = readStickerStoreFromStorage();

// Update this tab's value when another tab has a change
window.addEventListener("storage", (event) => {
  if (event.storageArea === localStorage && event.key === STICKER_STORE_KEY) {
    currentStickerStoreValue = readStickerStoreFromStorage();
    sendValueToListeners(currentStickerStoreValue);
  }
});

export function getStickerStore(): StickerStoreValue {
  return currentStickerStoreValue;
}

export function setStickerStore(value: StickerStoreValue) {
  currentStickerStoreValue = value;
  writeStickerStoreToStorage(value);
  sendValueToListeners(value);
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
  const store = clone(getStickerStore());

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
  const store = clone(getStickerStore());

  store.enabled = value ?? !store.enabled;

  setStickerStore(store);
  return store.enabled;
}
