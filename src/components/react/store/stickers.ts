/* eslint-disable no-param-reassign */
import type { StickerInfo } from "../StickerBook/types";
import type { SimpleStateCreator } from "./types";

export interface StickersSlice {
  stickers: StickerInfo[];
  animationFrequency: "never" | "always" | "hover";
  stickerPageData: {
    [path: string]:
      | {
          stickersIssued: number;
        }
      | undefined;
  };
  addSticker: (sticker: StickerInfo) => void;
  placeOnPage: (
    stickerId: string,
    pageId: string,
    position: { x: number; y: number },
  ) => void;
  removeFromPage: (stickerId: string) => void;
  setAnimationFrequency: (freq: StickersSlice["animationFrequency"]) => void;
}

function getInitialAnimationFrequency(): StickersSlice["animationFrequency"] {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  return mediaQuery.matches ? "never" : "hover";
}

export const createStickersSlice: SimpleStateCreator<StickersSlice> = (
  set,
) => ({
  stickers: [],
  animationFrequency: getInitialAnimationFrequency(),
  stickerPageData: {},
  addSticker: (sticker) =>
    set((state) => {
      state.stickers.push(sticker);
    }),
  placeOnPage: (stickerId, pageId, position) =>
    set((state) => {
      const sticker = state.stickers.find((s) => s.id === stickerId);
      if (!sticker) {
        return;
      }

      sticker.pageId = pageId;
      sticker.coordinates = position;
    }),
  removeFromPage: (stickerId) =>
    set((state) => {
      const sticker = state.stickers.find((s) => s.id === stickerId);
      if (!sticker) {
        return;
      }
      sticker.pageId = undefined;
      sticker.coordinates = { x: 0, y: 0 };
    }),
  setAnimationFrequency: (freq) =>
    set((state) => {
      state.animationFrequency = freq;
    }),
});
