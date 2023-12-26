interface BaseStickerData {
  name: string;
  rarity: "common" | "unique";
}

export interface LottieStickerData extends BaseStickerData {
  type: "lottie";
  url: string;
  initialFrame: number;
}

export type StickerData = LottieStickerData;

export type StickerTypes =
  | "chequered-flag"
  | "clap"
  | "dragon"
  | "fire"
  | "glowing-star"
  | "goose"
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

export interface AddStickerEventData {
  id?: string;
  type: StickerTypes;
  pageId?: string;
  coordinates?: {
    x: number;
    y: number;
  };
}

export type AddStickerEvent = CustomEvent<AddStickerEventData>;
