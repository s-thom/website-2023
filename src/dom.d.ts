import type { AddStickerEvent } from "./components/react/StickerBook/types";
import type { SlidersInitialisedEvent } from "./lib/shaders/sliders";

declare global {
  interface WindowEventMap {
    addsticker: AddStickerEvent;
    slidersinitialised: SlidersInitialisedEvent;
  }
}
