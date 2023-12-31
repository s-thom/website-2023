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

export const ORDERED_STICKER_TYPES = [
  // Emoji series
  "thumbs-up",
  "clap",
  "smile",
  "laughing",
  "joy",
  "rofl",
  "mind-blown",
  "thinking",
  "heart",
  "fire",
  "100",
  "party-popper",
  "light-bulb",
  "rocket",

  // Unused so far
  "turtle",
  "lizard",
  "dragon",

  "rainbow",

  // Uniques
  "camera-flash",
  "chequered-flag",
  "fire-heart",
  "glowing-star",
  "goose",
] as const;

export type StickerTypes = (typeof ORDERED_STICKER_TYPES)[number];

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
