export type StickerRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "legendary"
  | "unique";

export const RARITY_RANK: Record<StickerRarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  legendary: 3,
  unique: 4,
};

interface BaseStickerData {
  name: string;
  description?: string;
  unlockedBy?: string;
  rarity: StickerRarity;
}

export interface LottieStickerData extends BaseStickerData {
  type: "lottie";
  url: string;
  initialFrame: number;
}

export type StickerData = LottieStickerData;

export type StickerTypes =
  | "camera-flash"
  | "chequered-flag"
  | "clap"
  | "dragon"
  | "fire"
  | "fire-heart"
  | "glowing-star"
  | "goose"
  | "light-bulb"
  | "lizard"
  | "party-popper"
  | "rainbow"
  | "rocket"
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
