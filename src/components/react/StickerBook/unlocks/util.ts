import { AddStickerEvent, type StickerTypes } from "../types";

export function addSticker(type: StickerTypes, pageId?: string) {
  const event = new AddStickerEvent("addsticker", {
    detail: { type, pageId },
  });
  window.dispatchEvent(event);
}
