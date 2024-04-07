import type { SlidersInitialisedEvent } from "./lib/shaders/sliders";
import type { AddStickerEventData } from "./stickers/types";

declare global {
  interface WindowEventMap {
    addsticker: CustomEvent<AddStickerEventData>;
    slidersinitialised: SlidersInitialisedEvent;
  }
}
