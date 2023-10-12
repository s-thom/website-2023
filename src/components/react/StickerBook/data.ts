import type { StickerData, StickerTypes } from "./types";

export const STICKER_TYPE_MAP: Record<StickerTypes, StickerData> = {
  clap: {
    type: "lottie",
    name: "Clap",
    url: "/static/lottie/clap.json",
    initialFrame: 0,
  },
  dragon: {
    type: "lottie",
    name: "Dragon",
    url: "/static/lottie/dragon.json",
    initialFrame: 60,
  },
  fire: {
    type: "lottie",
    name: "Fire",
    url: "/static/lottie/fire.json",
    initialFrame: 0,
  },
  "light-bulb": {
    type: "lottie",
    name: "Light bulb",
    url: "/static/lottie/light-bulb.json",
    initialFrame: 50,
  },
  lizard: {
    type: "lottie",
    name: "Lizard",
    url: "/static/lottie/lizard.json",
    initialFrame: 0,
  },
  "party-popper": {
    type: "lottie",
    name: "Party popper",
    url: "/static/lottie/party-popper.json",
    initialFrame: 25,
  },
  rainbow: {
    type: "lottie",
    name: "Rainbow",
    url: "/static/lottie/rainbow.json",
    initialFrame: 50,
  },
  smile: {
    type: "lottie",
    name: "Smile",
    url: "/static/lottie/smile.json",
    initialFrame: 40,
  },
  "thumbs-up": {
    type: "lottie",
    name: "Thumbs up",
    url: "/static/lottie/thumbs-up.json",
    initialFrame: 0,
  },
  turtle: {
    type: "lottie",
    name: "Turtle",
    url: "/static/lottie/turtle.json",
    initialFrame: 0,
  },
};
