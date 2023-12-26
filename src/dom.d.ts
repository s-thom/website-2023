import type { AddStickerEvent } from "./components/react/StickerBook/types";

declare global {
  interface WindowEventMap {
    addsticker: AddStickerEvent;
  }
}
