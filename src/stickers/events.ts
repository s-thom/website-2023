import type { AddStickerEventData, StickerTypes } from "./types";

export function sendAddStickerEvent(type: StickerTypes, pageId?: string) {
  const event = new CustomEvent<AddStickerEventData>("addsticker", {
    detail: { type, pageId },
  });
  window.dispatchEvent(event);
}
