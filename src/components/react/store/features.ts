/* eslint-disable no-param-reassign */
import type { SimpleStateCreator } from "./types";

export interface FeaturesSlice {
  enabled: {
    stickers: boolean;
  };
  toggleFeature: (
    name: keyof FeaturesSlice["enabled"],
    value?: boolean,
  ) => void;
}

export const createFeaturesSlice: SimpleStateCreator<FeaturesSlice> = (
  set,
  get,
) => ({
  enabled: {
    // We sneakily use the stickers feature as an "is client" check in a couple of places, allowing
    // client:idle to be used in places instead of client:only
    // This is naughty and will almost certainly cause issues that bite me later.
    stickers: !("process" in globalThis),
  },
  toggleFeature: (name, value) =>
    set((state) => {
      let newVal = value;
      if (newVal === undefined) {
        newVal = !get().enabled[name];
      }
      state.enabled[name] = newVal;
    }),
});
