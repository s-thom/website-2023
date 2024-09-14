import type { SlidersInitialisedEvent } from "./lib/shaders/sliders";
import type { AddStickerEventData } from "./stickers/stickers";

declare global {
  interface WindowEventMap {
    addsticker: CustomEvent<AddStickerEventData>;
    slidersinitialised: SlidersInitialisedEvent;
  }
}
