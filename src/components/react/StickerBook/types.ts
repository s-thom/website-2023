interface BaseStickerData {
  name: string;
  description?: string;
  unlockedBy?: string;
  rarity: "common" | "uncommon" | "rare" | "legendary" | "unique";
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
  unlockTime: number;
  unlockPageId: string | undefined;
  zone: string | undefined;
  coordinates: {
    x: number;
    y: number;
  };
}

export interface AddStickerEventData {
  type: StickerTypes;
  pageId?: string;
}

export const AddStickerEvent = CustomEvent<AddStickerEventData>;
