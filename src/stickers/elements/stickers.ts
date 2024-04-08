import lottie, {
  type AnimationItem,
} from "lottie-web/build/player/lottie_light";
import { STICKER_TYPE_MAP } from "../data";
import type { StickerTypes } from "../types";
import "./stickers.css";

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
  anim: AnimationItem;
} {
  const data = STICKER_TYPE_MAP[type];
  // By the time this function is called we know the data is cached here.
  const animationData = LOTTIE_SNEAKY_CACHE[type];

  const element = document.createElement("div");
  element.classList.add("lottie-sticker");

  const anim = lottie.loadAnimation({
    container: element,
    animationData,
    loop: true,
    autoplay: false,
    rendererSettings: { className: "lottie-animation" },
  });

  element.addEventListener("pointerover", (event: PointerEvent) => {
    if (event.currentTarget === element) {
      anim.play();
    }
  });
  element.addEventListener("pointerleave", (event: PointerEvent) => {
    if (event.currentTarget === element) {
      anim.goToAndStop(data.initialFrame, true);
    }
  });
  anim.goToAndStop(data.initialFrame, true);

  return { element, anim };
}

function createLoadingElement(): HTMLDivElement {
  const element = document.createElement("div");
  element.classList.add("lottie-sticker", "lottie-fallback");

  element.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="lottie-fallback-dots" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`;

  return element;
}

export interface CreateStickerOptions {
  className?: string;
}

export function createStickerElement(
  type: StickerTypes,
  options: CreateStickerOptions = {},
): HTMLDivElement {
  const container = document.createElement("div");
  container.classList.add("sticker");
  if (options.className) {
    container.classList.add(...options.className.split(/\s+/g));
  }

  const data = STICKER_TYPE_MAP[type];
  if (data.type === "lottie") {
    if (LOTTIE_SNEAKY_CACHE[type]) {
      const { element } = createLottieAnimation(type);
      container.appendChild(element);
    } else {
      const loading = createLoadingElement();
      container.appendChild(loading);

      getLottieData(type).then(() => {
        container.removeChild(loading);
        const { element } = createLottieAnimation(type);
        container.appendChild(element);
      });
    }
  }

  return container;
}
