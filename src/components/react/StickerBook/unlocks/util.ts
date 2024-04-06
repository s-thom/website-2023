import type {
  AddStickerEventData,
  StickerTypes,
} from "../../../../stickers/types";

export function addSticker(type: StickerTypes, pageId?: string) {
  const event = new CustomEvent<AddStickerEventData>("addsticker", {
    detail: { type, pageId },
  });
  window.dispatchEvent(event);
}
