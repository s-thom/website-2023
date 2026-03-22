import type { SlidersInitialisedEvent } from "./lib/shaders/sliders";

declare global {
  interface WindowEventMap {
    slidersinitialised: SlidersInitialisedEvent;
  }
}
