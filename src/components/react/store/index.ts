/* eslint-disable no-param-reassign */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createFeaturesSlice, type FeaturesSlice } from "./features";
import { createStickersSlice, type StickersSlice } from "./stickers";

export type AppState = FeaturesSlice & StickersSlice;

export const useStore = create<AppState>()(
  persist(
    immer((...args) => ({
      ...createFeaturesSlice(...args),
      ...createStickersSlice(...args),
    })),
    { name: "sthom-website-2023" },
  ),
);
