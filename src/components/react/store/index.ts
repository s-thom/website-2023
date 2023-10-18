/* eslint-disable no-param-reassign */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createFeaturesSlice } from "./features";
import { createStickersSlice } from "./stickers";
import { type AppState } from "./types";

export const useStore = create<AppState>()(
  persist(
    immer((...args) => ({
      ...createFeaturesSlice(...args),
      ...createStickersSlice(...args),
    })),
    { name: "sthom-website-2023" },
  ),
);
