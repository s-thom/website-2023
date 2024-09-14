import { useSyncExternalStore } from "react";
import {
  getOptions,
  getOptionsWithAuto,
  subscribeToOptions,
  type Options,
  type OptionsWithAuto,
} from "../../../lib/options";

export function useOptions(): Options {
  const value = useSyncExternalStore(
    subscribeToOptions,
    getOptions,
    getOptions,
  );

  return value;
}

export function useOptionsWithAuto(): OptionsWithAuto {
  const value = useSyncExternalStore(
    subscribeToOptions,
    getOptionsWithAuto,
    getOptionsWithAuto,
  );

  return value;
}
