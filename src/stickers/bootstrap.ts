import { getStickerStore } from "./store";
import type { StickerTypes } from "./types";

export interface PageStickerData {
  pageId: string;
  enabled: boolean;
  unlockOnScroll?: boolean;
  special?: StickerTypes;
}

function startStickerApp(data: PageStickerData) {
  import("./scrollUnlock").then(({ ScrollUnlockHandler }) => {
    const handler = new ScrollUnlockHandler(
      data.pageId,
      data.unlockOnScroll ?? false,
      data.special,
    );
    handler.start();
  });
}

export function bootstrap() {
  const stickerDataEl = document.getElementById("sticker-data");
  if (!stickerDataEl) {
    return;
  }
  const data: PageStickerData = JSON.parse(stickerDataEl.textContent ?? "");
  if (!data.enabled) {
    return;
  }

  const idleCallback =
    window.requestIdleCallback ?? ((fn: () => void) => setTimeout(fn, 0));
  const letsGo = () => idleCallback(() => startStickerApp(data));
  const state = getStickerStore();
  if (state.stickers.find((sticker) => sticker.zone === data.pageId)) {
    letsGo();
  } else if (state.stickers.length > 0) {
    setTimeout(letsGo, 1000);
  } else {
    setTimeout(letsGo, 5000);
  }
}
