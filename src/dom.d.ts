import type {
  AddStickerEventData,
  StickersChangedEventData,
} from "./stickers/types";
import type { SlidersInitialisedEvent } from "./lib/shaders/sliders";

declare global {
  interface WindowEventMap {
    addsticker: CustomEvent<AddStickerEventData>;
    slidersinitialised: SlidersInitialisedEvent;
  }
}
