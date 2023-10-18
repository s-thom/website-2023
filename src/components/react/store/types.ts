import type { StateCreator } from "zustand";
import type { FeaturesSlice } from "./features";
import type { StickersSlice } from "./stickers";

export type AppState = FeaturesSlice & StickersSlice;

export type SimpleStateCreator<T> = StateCreator<
  AppState,
  [["zustand/immer", never], ["zustand/persist", unknown], never],
  [],
  T
>;
