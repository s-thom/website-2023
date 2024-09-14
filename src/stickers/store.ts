import type { StickerStoreValue } from "./types";

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

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  sendToListener(listener, getStickerStore());

  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

function sendToListener(listener: Listener<any>, value: StickerStoreValue) {
  try {
    const newValue = listener.mapper(value);
    if (newValue !== listener.lastValue) {
      // eslint-disable-next-line no-param-reassign
      listener.lastValue = newValue;
      listener.handler(newValue);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error in state listener", err);
  }
}

function sendValueToListeners(value: StickerStoreValue): void {
  listeners.forEach((listener) => {
    sendToListener(listener, value);
  });
}

function readStickerStoreFromStorage(): StickerStoreValue {
  if (!("localStorage" in globalThis)) {
    return INITIAL_VALUE;
  }
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
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.storageArea === localStorage && event.key === STICKER_STORE_KEY) {
      currentStickerStoreValue = readStickerStoreFromStorage();
      sendValueToListeners(currentStickerStoreValue);
    }
  });
}

export function getStickerStore(): StickerStoreValue {
  if (!("localStorage" in globalThis)) {
    return INITIAL_VALUE;
  }
  return currentStickerStoreValue;
}

export function setStickerStore(value: StickerStoreValue) {
  currentStickerStoreValue = value;
  writeStickerStoreToStorage(value);
  sendValueToListeners(value);
}
