import type { StickerInfo } from "../StickerBook/types";
import { addSticker, placeOnPage, removeFromPage } from "./reducers/stickers";
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
  if (!("window" in globalThis)) {
    return "never";
  }

  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  return mediaQuery.matches ? "never" : "hover";
}

export const createStickersSlice: SimpleStateCreator<StickersSlice> = (
  set,
) => ({
  stickers: [],
  animationFrequency: getInitialAnimationFrequency(),
  stickerPageData: {},
  addSticker: (sticker) => set((state) => addSticker(state.stickers, sticker)),
  placeOnPage: (stickerId, pageId, position) =>
    set((state) => placeOnPage(state.stickers, stickerId, pageId, position)),
  removeFromPage: (stickerId) =>
    set((state) => removeFromPage(state.stickers, stickerId)),
  setAnimationFrequency: (freq) =>
    set((state) => {
      // eslint-disable-next-line no-param-reassign
      state.animationFrequency = freq;
    }),
});
