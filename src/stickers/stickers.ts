import { clsx } from "clsx";
import { h } from "../lib/h";
import { getOptionValue, subscribeToOption } from "../lib/options";
import { clone } from "../util";
import "./stickers.css";

// #region Coordinates
export interface NonePosition {
  type: "none";
}

export interface PagePosition {
  type: "page";
  coordinates: Vec2;
}

export interface ScreenPosition {
  type: "screen";
  coordinates: Vec2;
}

export interface CenterPosition {
  type: "center";
  coordinates: Vec2;
}

export type AllPosition =
  | NonePosition
  | PagePosition
  | ScreenPosition
  | CenterPosition;

export function toPagePosition(position: AllPosition): PagePosition {
  switch (position.type) {
    case "none":
      return { type: "page", coordinates: { x: 0, y: 0 } };
    case "center":
      return {
        type: "page",
        coordinates: {
          x: position.coordinates.x + document.documentElement.scrollWidth / 2,
          y: position.coordinates.y,
        },
      };
    case "screen":
      return {
        type: "page",
        coordinates: {
          x: position.coordinates.x + window.scrollX,
          y: position.coordinates.y + window.scrollY,
        },
      };
    case "page":
      return position;
    default:
      throw new Error(
        `Unknown position type ${(position as AllPosition).type}`,
      );
  }
}

export function pagePositionToType(
  type: AllPosition["type"],
  position: PagePosition,
): AllPosition {
  switch (type) {
    case "none":
      return { type };
    case "center":
      return {
        type: "center",
        coordinates: {
          x: position.coordinates.x - document.documentElement.scrollWidth / 2,
          y: position.coordinates.y,
        },
      };
    case "screen":
      return {
        type: "page",
        coordinates: {
          x: position.coordinates.x - window.scrollX,
          y: position.coordinates.y - window.scrollY,
        },
      };
    case "page":
      return position;
    default:
      throw new Error(
        `Unknown position type ${(position as AllPosition).type}`,
      );
  }
}
// #endregion

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

  // Rare
  "earth", // D&D pages

  // UNUSED RARES
  "rocket",
  "camping",

  // Legendary
  "fire-heart", // Sticker book page
  "construction", // How this website was made blog post
  "dragon", // Secret page
  "rainbow", // How this site handles interactivity blog post

  // UNUSED LEGENDARIES
  "turtle",
  "lizard",

  // Uniques
  "birthday-cake", // Birthday
  "camera-flash", // NOTHING, must be cheated in
  "chequered-flag", // Final blog post
  "glowing-star", // Latest blog post
  "goose", // Clicking the goose
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
}

export type StickerData = LottieStickerData;

export interface Vec2 {
  x: number;
  y: number;
}

export interface StickerStoreValue {
  stickers: StickerInfo[];
}

export interface StickerInfo {
  id: string;
  type: StickerTypes;
  unlockTime: number;
  unlockPageId: string | undefined;
  zone: string | undefined;
  position: NonePosition | CenterPosition;
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
  },
  "birthday-cake": {
    type: "lottie",
    rarity: "unique",
    name: "Birthday Cake",
    description: "Happy birthday to me?",
    unlockedBy: "visiting this site on one particular day of the year",
    url: "/static/lottie/birthday-cake.json",
  },
  "camera-flash": {
    type: "lottie",
    rarity: "unique",
    name: "Camera Flash",
    description: "Caught in 4k",
    unlockedBy: "cheating it in yourself",
    url: "/static/lottie/camera-flash.json",
  },
  camping: {
    type: "lottie",
    rarity: "rare",
    name: "Camping",
    url: "/static/lottie/camping.json",
  },
  "chequered-flag": {
    type: "lottie",
    rarity: "unique",
    name: "Chequered Flag",
    unlockedBy: "reading the earliest blog post",
    url: "/static/lottie/chequered-flag.json",
  },
  clap: {
    type: "lottie",
    rarity: "common",
    name: "Clap",
    url: "/static/lottie/clap.json",
  },
  construction: {
    type: "lottie",
    rarity: "legendary",
    name: "Construction",
    description: "This website is perpetually under construction",
    url: "/static/lottie/construction.json",
  },
  dragon: {
    type: "lottie",
    rarity: "legendary",
    name: "Dragon",
    url: "/static/lottie/dragon.json",
  },
  earth: {
    type: "lottie",
    rarity: "rare",
    name: "Earth",
    url: "/static/lottie/earth.json",
  },
  fire: {
    type: "lottie",
    rarity: "uncommon",
    name: "Fire",
    url: "/static/lottie/fire.json",
  },
  "fire-heart": {
    type: "lottie",
    rarity: "legendary",
    name: "Fire Heart",
    url: "/static/lottie/fire-heart.json",
  },
  "glowing-star": {
    type: "lottie",
    rarity: "unique",
    name: "Glowing Star",
    unlockedBy: "reading the latest blog post",
    url: "/static/lottie/glowing-star.json",
  },
  goose: {
    type: "lottie",
    rarity: "unique",
    name: "Goose",
    description: "It's a lovely morning on the internet...",
    unlockedBy: "clicking the goose",
    url: "/static/lottie/goose.json",
  },
  heart: {
    type: "lottie",
    rarity: "common",
    name: "Heart",
    url: "/static/lottie/heart.json",
  },
  joy: {
    type: "lottie",
    rarity: "common",
    name: "Joy",
    url: "/static/lottie/joy.json",
  },
  laughing: {
    type: "lottie",
    rarity: "common",
    name: "Laughing",
    url: "/static/lottie/laughing.json",
  },
  "light-bulb": {
    type: "lottie",
    rarity: "common",
    name: "Light bulb",
    url: "/static/lottie/light-bulb.json",
  },
  lizard: {
    type: "lottie",
    rarity: "legendary",
    name: "Lizard",
    url: "/static/lottie/lizard.json",
  },
  "mind-blown": {
    type: "lottie",
    rarity: "uncommon",
    name: "Mind blown",
    url: "/static/lottie/mind-blown.json",
  },
  "party-popper": {
    type: "lottie",
    rarity: "common",
    name: "Party popper",
    url: "/static/lottie/party-popper.json",
  },
  rainbow: {
    type: "lottie",
    rarity: "legendary",
    name: "Rainbow",
    url: "/static/lottie/rainbow.json",
  },
  rocket: {
    type: "lottie",
    rarity: "rare",
    name: "Rocket",
    url: "/static/lottie/rocket.json",
  },
  rofl: {
    type: "lottie",
    rarity: "uncommon",
    name: "ROFL",
    url: "/static/lottie/rofl.json",
  },
  smile: {
    type: "lottie",
    rarity: "common",
    name: "Smile",
    url: "/static/lottie/smile.json",
  },
  thinking: {
    type: "lottie",
    rarity: "common",
    name: "Thinking",
    url: "/static/lottie/thinking.json",
  },
  "thumbs-up": {
    type: "lottie",
    rarity: "common",
    name: "Thumbs up",
    url: "/static/lottie/thumbs-up.json",
  },
  turtle: {
    type: "lottie",
    rarity: "legendary",
    name: "Turtle",
    url: "/static/lottie/turtle.json",
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

const listeners: Listener<unknown>[] = [];

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
    lastValue: {} as T, // Must be any unique value, doesn't matter what it is at this stage
  };
  const listenerUK = listener as Listener<unknown>;

  listeners.push(listenerUK);

  sendToListener(listenerUK, getStickerStore());

  return () => {
    const index = listeners.indexOf(listenerUK);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

function sendToListener(listener: Listener<unknown>, value: StickerStoreValue) {
  try {
    const newValue = listener.mapper(value);
    if (newValue !== listener.lastValue) {
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
    try {
      sendToListener(listener, value);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error in sticker store listener", error);
    }
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

// #region Animation listeners
export interface StickerAnimationStop {
  type: "page" | "screen";
  coordinates: Vec2;
}

export interface BaseAnimation {
  callback?: () => void;
}

export interface StickerAddAnimation extends BaseAnimation {
  type: "add";
  sticker: StickerTypes;
}

export type StickerAnimationOptions = StickerAddAnimation;

const animationListeners = new Set<
  (animation: StickerAnimationOptions) => void
>();

export function addAnimationListener(
  listener: (animation: StickerAnimationOptions) => void,
) {
  animationListeners.add(listener);

  return () => {
    animationListeners.delete(listener);
  };
}

export function animate(animation: StickerAnimationOptions) {
  for (const listener of animationListeners) {
    try {
      listener(animation);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error in sticker animation store listener", error);
    }
  }
}

// #endregion

// #region Elements
async function requestLottieFile(url: string) {
  const response = await fetch(url);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const json = await response.json();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return json;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LOTTIE_PROMISE_CACHE: { [key: string]: Promise<any> | undefined } = {};
// For the most part you want to use the Promise cache but in special
// circumstances it's nice to get the actual value, even if it's a bit
// unsafe to do so. Hopefully the word "sneaky" in the name gives a
// clue that this really shouldn't be used.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LOTTIE_SNEAKY_CACHE: { [key: string]: any } = {};

export function getLottieData(type: StickerTypes) {
  const data = STICKER_TYPE_MAP[type];

  if (!LOTTIE_PROMISE_CACHE[type]) {
    LOTTIE_PROMISE_CACHE[type] = requestLottieFile(data.url).then((json) => {
      LOTTIE_SNEAKY_CACHE[type] = json as never;
      return json as never;
    });
  }

  return LOTTIE_PROMISE_CACHE[type];
}

type LottieType =
  (typeof import("lottie-web/build/player/lottie_light"))["default"];

let _lottie: LottieType | undefined;
async function lazyLoadLottie() {
  const result = await import("lottie-web/build/player/lottie_light");
  _lottie = result.default;
  return _lottie;
}

function createLottieAnimation(
  lottie: LottieType,
  type: StickerTypes,
): {
  element: HTMLDivElement;
  cleanup: () => void;
} {
  // By the time this function is called we know the data is cached here.
  const animationData = LOTTIE_SNEAKY_CACHE[type] as never;

  let motionState = getOptionValue("motion");

  const element = h(
    "div",
    {
      className: "lottie-sticker",
      onpointerover: (event) => {
        if (event.currentTarget === element && motionState !== "reduced") {
          anim.play();
        }
      },
      onpointerleave: (event) => {
        if (event.currentTarget === element) {
          anim.goToAndStop("rest", true);
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
  anim.goToAndStop("rest", true);

  const unsubscribe = subscribeToOption("motion", (value) => {
    motionState = value;
    if (value === "reduced") {
      anim.goToAndStop("rest", true);
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
  let lottieCleanup: (() => void) | undefined;
  let cleanupDraggable: (() => void) | undefined;

  const data = STICKER_TYPE_MAP[type];

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (data.type === "lottie") {
    // Use sneaky cache (with unwrapped values) if possible
    if (LOTTIE_SNEAKY_CACHE[type] && _lottie) {
      const { element, cleanup } = createLottieAnimation(_lottie, type);
      lottieCleanup = cleanup;
      container.appendChild(element);
    } else {
      const loading = createLoadingElement();
      container.appendChild(loading);

      void Promise.all([lazyLoadLottie(), getLottieData(type)]).then(
        ([lottie]) => {
          if (isDestroyed) {
            return;
          }
          container.removeChild(loading);
          const { element, cleanup } = createLottieAnimation(lottie, type);
          lottieCleanup = cleanup;
          container.appendChild(element);
        },
      );
    }
  }

  if (options.draggable) {
    void import(
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
export async function preloadStickerData(type: StickerTypes): Promise<void> {
  switch (STICKER_TYPE_MAP[type].type) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    case "lottie":
      await getLottieData(type);
      break;
    default:
  }
}

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
// #endregion
