import { clsx } from "clsx";
import lottie from "lottie-web/build/player/lottie_light";
import { h } from "../lib/h";
import { getOptionValue, subscribeToOption } from "../lib/options";
import { clone } from "../util";
import "./stickers.css";

// #region Types & data
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
  "earth",

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

export interface Vec2 {
  x: number;
  y: number;
}

export interface NonePosition {
  type: "none";
}

export interface CenterPosition {
  type: "center";
  coordinates: Vec2;
}

export type StickerPosition = NonePosition | CenterPosition;

export interface StickerStoreValue {
  enabled: boolean;
  stickers: StickerInfo[];
}

export interface StickerInfo {
  id: string;
  type: StickerTypes;
  unlockTime: number;
  unlockPageId: string | undefined;
  zone: string | undefined;
  position: StickerPosition;
}

export interface AddStickerEventData {
  type: StickerTypes;
  pageId?: string;
}

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
// #endregion

// #region Store
const INITIAL_VALUE: StickerStoreValue = {
  enabled: true,
  stickers: [],
};
const STICKER_STORE_KEY = "sthom-website-stickers";

type StickerStoreHandler<T> = (value: T) => void;
type StickerStoreMapper<T> = (value: StickerStoreValue) => T;
type Listener<T> = {
  handler: StickerStoreHandler<T>;
  mapper: StickerStoreMapper<T>;
  lastValue: T;
};
const DEFAULT_MAPPER: StickerStoreMapper<StickerStoreValue> = (value) => value;

const listeners: Listener<any>[] = [];

export function addStickerStoreListener(
  handler: StickerStoreHandler<StickerStoreValue>,
): () => void;
export function addStickerStoreListener<T>(
  handler: StickerStoreHandler<T>,
  mapper: StickerStoreMapper<T>,
): () => void;
export function addStickerStoreListener<T>(
  handler: StickerStoreHandler<T>,
  mapper?: StickerStoreMapper<T>,
): () => void {
  const listener: Listener<T> = {
    handler,
    mapper: mapper ?? (DEFAULT_MAPPER as StickerStoreMapper<T>),
    lastValue: {} as any, // Must be any unique value, doesn't matter what it is at this stage
  };
  listeners.push(listener);

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  sendToListener(listener, getStickerStore());

  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

function sendToListener(listener: Listener<any>, value: StickerStoreValue) {
  try {
    const newValue = listener.mapper(value);
    if (newValue !== listener.lastValue) {
      // eslint-disable-next-line no-param-reassign
      listener.lastValue = newValue;
      listener.handler(newValue);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error in state listener", err);
  }
}

function sendValueToListeners(value: StickerStoreValue): void {
  listeners.forEach((listener) => {
    sendToListener(listener, value);
  });
}

function readStickerStoreFromStorage(): StickerStoreValue {
  if (!("localStorage" in globalThis)) {
    return INITIAL_VALUE;
  }
  const valueString = localStorage.getItem(STICKER_STORE_KEY);
  if (!valueString) {
    return INITIAL_VALUE;
  }

  const value: StickerStoreValue = JSON.parse(valueString);
  return value;
}

function writeStickerStoreToStorage(value: StickerStoreValue): void {
  const valueString = JSON.stringify(value);
  localStorage.setItem(STICKER_STORE_KEY, valueString);
}

let currentStickerStoreValue = readStickerStoreFromStorage();

// Update this tab's value when another tab has a change
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.storageArea === localStorage && event.key === STICKER_STORE_KEY) {
      currentStickerStoreValue = readStickerStoreFromStorage();
      sendValueToListeners(currentStickerStoreValue);
    }
  });
}

export function getStickerStore(): StickerStoreValue {
  if (!("localStorage" in globalThis)) {
    return INITIAL_VALUE;
  }
  return currentStickerStoreValue;
}

export function setStickerStore(value: StickerStoreValue) {
  currentStickerStoreValue = value;
  writeStickerStoreToStorage(value);
  sendValueToListeners(value);
}

// #endregion

// #region Elements
async function requestLottieFile(url: string) {
  const response = await fetch(url);
  const json = await response.json();
  return json;
}

const LOTTIE_PROMISE_CACHE: { [key: string]: Promise<any> } = {};
// For the most part you want to use the Promise cache but in special
// circumstances it's nice to get the actual value, even if it's a bit
// unsafe to do so. Hopefully the word "sneaky" in the name gives a
// clue that this really shouldn't be used.
const LOTTIE_SNEAKY_CACHE: { [key: string]: any } = {};

export function getLottieData(type: StickerTypes) {
  const data = STICKER_TYPE_MAP[type];

  if (!LOTTIE_PROMISE_CACHE[type]) {
    LOTTIE_PROMISE_CACHE[type] = requestLottieFile(data.url).then((json) => {
      LOTTIE_SNEAKY_CACHE[type] = json;
      return json;
    });
  }

  return LOTTIE_PROMISE_CACHE[type]!;
}

function createLottieAnimation(type: StickerTypes): {
  element: HTMLDivElement;
  cleanup: () => void;
} {
  const data = STICKER_TYPE_MAP[type];
  // By the time this function is called we know the data is cached here.
  const animationData = LOTTIE_SNEAKY_CACHE[type];

  let motionState = getOptionValue("motion");

  const element = h(
    "div",
    {
      className: "lottie-sticker",
      onpointerover: (event) => {
        if (event.currentTarget === element && motionState !== "reduced") {
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          anim.play();
        }
      },
      onpointerleave: (event) => {
        if (event.currentTarget === element) {
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          anim.goToAndStop(data.initialFrame, true);
        }
      },
    },
    [],
  );

  const anim = lottie.loadAnimation({
    container: element,
    animationData,
    loop: true,
    autoplay: false,
    rendererSettings: { className: "lottie-animation" },
  });
  anim.goToAndStop(data.initialFrame, true);

  const unsubscribe = subscribeToOption("motion", (value) => {
    motionState = value;
    if (value === "reduced") {
      anim.goToAndStop(data.initialFrame, true);
    }
  });

  return {
    element,
    cleanup: () => {
      anim.destroy();
      unsubscribe();
    },
  };
}

function createLoadingElement(): HTMLDivElement {
  const element = h("div", { className: "lottie-sticker lottie-fallback" }, []);

  element.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="lottie-fallback-dots" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`;

  return element;
}

export interface CreateStickerOptions {
  draggable?: boolean;
  draggableData?: Record<string, unknown>;
  className?: string;
}

export function createStickerElement(
  type: StickerTypes,
  options: CreateStickerOptions = {},
): { element: HTMLDivElement; destroy: () => void } {
  const container = h(
    "div",
    {
      className: clsx(
        "sticker",
        options.draggable && "sticker-draggable",
        options.className,
      ),
    },
    [],
  );

  let isDestroyed = false;
  let lottieCleanup: () => void;
  let cleanupDraggable: () => void;

  const data = STICKER_TYPE_MAP[type];
  if (data.type === "lottie") {
    if (LOTTIE_SNEAKY_CACHE[type]) {
      const { element, cleanup } = createLottieAnimation(type);
      lottieCleanup = cleanup;
      container.appendChild(element);
    } else {
      const loading = createLoadingElement();
      container.appendChild(loading);

      getLottieData(type).then(() => {
        if (isDestroyed) {
          return;
        }
        container.removeChild(loading);
        const { element, cleanup } = createLottieAnimation(type);
        lottieCleanup = cleanup;
        container.appendChild(element);
      });
    }
  }

  if (options.draggable) {
    import(
      "@atlaskit/pragmatic-drag-and-drop/dist/cjs/entry-point/element/adapter"
    ).then(({ draggable }) => {
      if (isDestroyed) {
        return;
      }

      cleanupDraggable = draggable({
        element: container,
        getInitialData: () => options.draggableData ?? {},
      });
    });
  }

  return {
    element: container,
    destroy: () => {
      isDestroyed = true;
      cleanupDraggable?.();
      lottieCleanup?.();
    },
  };
}

export interface StickerFrameProps {
  rarity: StickerRarity;
  showRarityLabel?: boolean;
  name?: string;
  description?: string;
  unlockedBy?: string;
  hideFrameOnCommon?: boolean;
  className?: string;
}

export function createStickerFrame(
  child: HTMLElement,
  options: StickerFrameProps,
): HTMLDivElement {
  const {
    rarity,
    showRarityLabel,
    description,
    name,
    unlockedBy,
    hideFrameOnCommon,
    className,
  } = options;

  const shouldHaveBorder = hideFrameOnCommon ? rarity !== "common" : true;

  const container = h(
    "div",
    {
      className: clsx(
        "sticker-frame",
        className,
        shouldHaveBorder && `sticker-frame-${rarity}`,
      ),
    },
    [
      showRarityLabel &&
        h(
          "span",
          { className: "sticker-frame-rarity", textContent: rarity },
          [],
        ),
      child,
      Boolean(name || description || unlockedBy) &&
        h("div", { className: "sticker-frame-info flow" }, [
          name &&
            h(
              "span",
              { className: "sticker-frame-name", textContent: name },
              [],
            ),
          description &&
            h(
              "span",
              {
                className: "sticker-frame-description",
                textContent: description,
              },
              [],
            ),
          unlockedBy &&
            h("span", { className: "sticker-frame-unlockedBy" }, [
              document.createTextNode("Unlocked by: "),
              h(
                "span",
                {
                  className: "sticker-frame-description",
                  textContent: unlockedBy,
                },
                [],
              ),
            ]),
        ]),
    ],
  );

  return container;
}
// #endregion

// #region Functions
export function canAddSticker(type: StickerTypes): boolean {
  const { stickers } = getStickerStore();

  // Ensure this is a valid sticker
  if (!(type in STICKER_TYPE_MAP)) {
    return false;
  }

  // Unique stickers can only be earned once, hence the name
  const stickerData = STICKER_TYPE_MAP[type];
  if (stickerData.rarity === "unique") {
    if (stickers.find((curr) => curr.type === type)) {
      return false;
    }
  }

  return true;
}

export function addSticker(sticker: StickerInfo): StickerInfo[] {
  const store = getStickerStore();
  const stickers = [...store.stickers];

  if (canAddSticker(sticker.type)) {
    stickers.push(sticker);
  }

  const copy = { ...store };
  copy.stickers = stickers;
  setStickerStore(copy);
  return store.stickers;
}

export function placeOnPage(
  stickerId: string,
  pageId: string | undefined,
  position: StickerInfo["position"],
): StickerInfo[] {
  const store = clone(getStickerStore());

  const sticker = store.stickers.find((s) => s.id === stickerId);
  if (!sticker) {
    return store.stickers;
  }

  sticker.zone = pageId;
  sticker.position = position;

  setStickerStore(store);
  return store.stickers;
}

export function removeFromPage(stickerId: string): StickerInfo[] {
  const store = clone(getStickerStore());

  const sticker = store.stickers.find((s) => s.id === stickerId);
  if (!sticker) {
    return store.stickers;
  }

  sticker.zone = undefined;
  sticker.position = { type: "none" };

  setStickerStore(store);
  return store.stickers;
}

export function toggleStickersEnabled(value?: boolean): boolean {
  const store = getStickerStore();

  const copy = { ...store };
  copy.enabled = value ?? !store.enabled;
  setStickerStore(copy);
  return store.enabled;
}

// #endregion
