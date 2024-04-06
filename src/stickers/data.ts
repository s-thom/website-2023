import {
  ORDERED_STICKER_TYPES,
  type StickerData,
  type StickerRarity,
  type StickerTypes,
} from "./types";

export const STICKER_TYPE_MAP: Record<StickerTypes, StickerData> = {
  "100": {
    type: "lottie",
    rarity: "uncommon",
    name: "100",
    url: "/static/lottie/100.json",
    initialFrame: 0,
  },
  "camera-flash": {
    type: "lottie",
    rarity: "unique",
    name: "Camera Flash",
    description: "Caught in 4k",
    unlockedBy: "cheating it in yourself",
    url: "/static/lottie/camera-flash.json",
    initialFrame: 0,
  },
  "chequered-flag": {
    type: "lottie",
    rarity: "unique",
    name: "Chequered Flag",
    unlockedBy: "reading the earliest blog post",
    url: "/static/lottie/chequered-flag.json",
    initialFrame: 0,
  },
  clap: {
    type: "lottie",
    rarity: "common",
    name: "Clap",
    url: "/static/lottie/clap.json",
    initialFrame: 0,
  },
  dragon: {
    type: "lottie",
    rarity: "legendary",
    name: "Dragon",
    url: "/static/lottie/dragon.json",
    initialFrame: 60,
  },
  earth: {
    type: "lottie",
    rarity: "rare",
    name: "Earth",
    url: "/static/lottie/earth.json",
    initialFrame: 0,
  },
  fire: {
    type: "lottie",
    rarity: "uncommon",
    name: "Fire",
    url: "/static/lottie/fire.json",
    initialFrame: 0,
  },
  "fire-heart": {
    type: "lottie",
    rarity: "unique",
    name: "Fire Heart",
    unlockedBy: "reaching the end of the Sticker book page",
    url: "/static/lottie/fire-heart.json",
    initialFrame: 0,
  },
  "glowing-star": {
    type: "lottie",
    rarity: "unique",
    name: "Glowing Star",
    unlockedBy: "reading the latest blog post",
    url: "/static/lottie/glowing-star.json",
    initialFrame: 50,
  },
  goose: {
    type: "lottie",
    rarity: "unique",
    name: "Goose",
    description: "It's a lovely morning on the internet...",
    unlockedBy: "clicking the goose",
    url: "/static/lottie/goose.json",
    initialFrame: 0,
  },
  heart: {
    type: "lottie",
    rarity: "common",
    name: "Heart",
    url: "/static/lottie/heart.json",
    initialFrame: 0,
  },
  joy: {
    type: "lottie",
    rarity: "common",
    name: "Joy",
    url: "/static/lottie/joy.json",
    initialFrame: 0,
  },
  laughing: {
    type: "lottie",
    rarity: "common",
    name: "Laughing",
    url: "/static/lottie/laughing.json",
    initialFrame: 0,
  },
  "light-bulb": {
    type: "lottie",
    rarity: "common",
    name: "Light bulb",
    url: "/static/lottie/light-bulb.json",
    initialFrame: 130,
  },
  lizard: {
    type: "lottie",
    rarity: "legendary",
    name: "Lizard",
    url: "/static/lottie/lizard.json",
    initialFrame: 0,
  },
  "mind-blown": {
    type: "lottie",
    rarity: "uncommon",
    name: "Mind blown",
    url: "/static/lottie/mind-blown.json",
    initialFrame: 28,
  },
  "party-popper": {
    type: "lottie",
    rarity: "common",
    name: "Party popper",
    url: "/static/lottie/party-popper.json",
    initialFrame: 25,
  },
  rainbow: {
    type: "lottie",
    rarity: "legendary",
    name: "Rainbow",
    url: "/static/lottie/rainbow.json",
    initialFrame: 50,
  },
  rocket: {
    type: "lottie",
    rarity: "rare",
    name: "Rocket",
    url: "/static/lottie/rocket.json",
    initialFrame: 0,
  },
  rofl: {
    type: "lottie",
    rarity: "uncommon",
    name: "ROFL",
    url: "/static/lottie/rofl.json",
    initialFrame: 0,
  },
  smile: {
    type: "lottie",
    rarity: "common",
    name: "Smile",
    url: "/static/lottie/smile.json",
    initialFrame: 100,
  },
  thinking: {
    type: "lottie",
    rarity: "common",
    name: "Thinking",
    url: "/static/lottie/thinking.json",
    initialFrame: 0,
  },
  "thumbs-up": {
    type: "lottie",
    rarity: "common",
    name: "Thumbs up",
    url: "/static/lottie/thumbs-up.json",
    initialFrame: 60,
  },
  turtle: {
    type: "lottie",
    rarity: "legendary",
    name: "Turtle",
    url: "/static/lottie/turtle.json",
    initialFrame: 0,
  },
};

export const STICKER_TYPES_BY_RARITY: Record<StickerRarity, StickerTypes[]> = {
  common: [],
  uncommon: [],
  rare: [],
  legendary: [],
  unique: [],
};
Object.entries(STICKER_TYPE_MAP).forEach(([key, value]) => {
  STICKER_TYPES_BY_RARITY[value.rarity].push(key as StickerTypes);
});

export function sortStickerTypes(a: StickerTypes, z: StickerTypes): number {
  return ORDERED_STICKER_TYPES.indexOf(a) - ORDERED_STICKER_TYPES.indexOf(z);
}
