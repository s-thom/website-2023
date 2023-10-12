interface BaseStickerData {
  name: string;
}

export interface LottieStickerData extends BaseStickerData {
  type: "lottie";
  url: string;
  initialFrame: 0;
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
  zone: string;
  type: StickerTypes;
  coordinates: {
    x: number;
    y: number;
  };
}
