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
    stickers: true,
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
