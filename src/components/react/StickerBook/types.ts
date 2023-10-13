interface BaseStickerData {
  name: string;
}

export interface LottieStickerData extends BaseStickerData {
  type: "lottie";
  url: string;
  initialFrame: number;
}

export type StickerData = LottieStickerData;

export type StickerTypes =
  | "clap"
  | "dragon"
  | "fire"
  | "light-bulb"
  | "lizard"
  | "party-popper"
  | "rainbow"
  | "smile"
  | "thumbs-up"
  | "turtle";

export interface StickerInfo {
  id: string;
  type: StickerTypes;
  pageId: string | undefined;
  coordinates: {
    x: number;
    y: number;
  };
}
