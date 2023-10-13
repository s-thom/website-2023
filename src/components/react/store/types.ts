import type { StateCreator } from "zustand";
import type { StickersSlice } from "./stickers";

interface FeaturesSlice {
  features: {
    stickers: boolean;
  };
  toggleFeature: (
    name: keyof FeaturesSlice["features"],
    value?: boolean,
  ) => void;
}

export type AppState = FeaturesSlice & StickersSlice;

export type SimpleStateCreator<T> = StateCreator<
  AppState,
  [["zustand/immer", never], ["zustand/persist", unknown], never],
  [],
  T
>;
