import { STICKER_TYPE_MAP } from "../../StickerBook/data";
import type { StickerInfo } from "../../StickerBook/types";

export function canAddSticker(
  stickers: StickerInfo[],
  sticker: StickerInfo,
): boolean {
  // Ensure this is a valid sticker
  if (!(sticker.type in STICKER_TYPE_MAP)) {
    return false;
  }

  // Unique stickers can only be earned once, hence the name
  const stickerData = STICKER_TYPE_MAP[sticker.type];
  if (stickerData.rarity === "unique") {
    if (stickers.find((curr) => curr.type === sticker.type)) {
      return false;
    }
  }

  return true;
}

export function addSticker(stickers: StickerInfo[], sticker: StickerInfo) {
  if (canAddSticker(stickers, sticker)) {
    stickers.push(sticker);
  }
}

export function placeOnPage(
  stickers: StickerInfo[],
  stickerId: string,
  pageId: string | undefined,
  position: StickerInfo["coordinates"],
) {
  const sticker = stickers.find((s) => s.id === stickerId);
  if (!sticker) {
    return;
  }

  sticker.zone = pageId;
  sticker.coordinates = position;
}

export function removeFromPage(stickers: StickerInfo[], stickerId: string) {
  const sticker = stickers.find((s) => s.id === stickerId);
  if (!sticker) {
    return;
  }

  sticker.zone = undefined;
  sticker.coordinates = { x: 0, y: 0 };
}
