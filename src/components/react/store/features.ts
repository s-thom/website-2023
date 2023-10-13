/* eslint-disable no-param-reassign */
import type { SimpleStateCreator } from "./types";

export interface FeaturesSlice {
  features: {
    stickers: boolean;
  };
  toggleFeature: (
    name: keyof FeaturesSlice["features"],
    value?: boolean,
  ) => void;
}

export const createFeaturesSlice: SimpleStateCreator<FeaturesSlice> = (
  set,
  get,
) => ({
  features: {
    stickers: true,
  },
  toggleFeature: (name, value) =>
    set((state) => {
      let newVal = value;
      if (newVal === undefined) {
        newVal = !get().features[name];
      }
      state.features[name] = newVal;
    }),
});
