import { clsx } from "clsx";
import lottie from "lottie-web/build/player/lottie_light";
import { h } from "../../lib/h";
import { getOptionValue, subscribeToOption } from "../../lib/options";
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
