/* eslint-disable no-param-reassign */
const PREFERENCES_STORAGE_KEY = "sthom-preferences";

function memo<K, V>(fn: (key: K) => V): (key: K) => V {
  // Need to initialise to some unique value to ensure first run populates cache
  let lastKey: K | object = {};
  let value: V;

  return function memoInner(key) {
    if (lastKey !== key) {
      value = fn(key);
      lastKey = key;
    }

    // We know that value has a value here.
    return value!;
  };
}

export type Options = {
  theme: "light" | "dark";
  motion: "reduced" | "no-preference";
  stickers: "on" | "off";
  font: "serif" | "sans-serif" | "comic-sans";
};

export type OptionsWithAuto = {
  [Key in keyof Options]: Options[Key] | "auto";
};

const DEFAULT_OPTIONS: Options = {
  theme: "light",
  font: "sans-serif",
  motion: "no-preference",
  stickers: "on",
};

type OptionListener<V> = (value: V, valueWithAuto: V | "auto") => void;

type OptionResult<V> = {
  value: V;
  autoValue: V;
  isAuto: boolean;
  listeners: OptionListener<V>[];
};

type OptionsState = { [Key in keyof Options]: OptionResult<Options[Key]> };

function getStorageState(): Partial<Options> {
  const storedValue = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
  if (storedValue != null) {
    try {
      const parsed = JSON.parse(storedValue) as Partial<Options>;
      return parsed;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Error reading stored options, defaulting to auto", { err });
    }
  }

  return {};
}

function setStorageState(options: Partial<Options>): void {
  window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(options));
}

function notifyListeners<V>(result: OptionResult<V>): void {
  for (const listener of result.listeners) {
    try {
      listener(result.value, result.isAuto ? "auto" : result.value);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error during options listener", { err });
    }
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
let __state_singleton: OptionsState;
function getState(): OptionsState {
  if (!__state_singleton) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    __state_singleton = getInitialState();
  }

  return __state_singleton;
}

function mergeState<K extends keyof Options>(
  key: K,
  result: OptionResult<Options[K]>,
) {
  __state_singleton = { ...getState(), [key]: result };

  notifyListeners(result);

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  setStorageState(getOptions());
}

export function setOptionValue<K extends keyof Options>(
  key: K,
  value:
    | OptionsWithAuto[K]
    | ((prev: Options[K], isAuto: boolean) => OptionsWithAuto[K]),
) {
  const prevState = getState();
  const prevResult = prevState[key];

  const newValue =
    typeof value === "function"
      ? value(prevResult.value, prevResult.isAuto)
      : value;

  const newResult: OptionResult<Options[K]> = {
    value:
      newValue === "auto" ? prevResult.autoValue : (newValue as Options[K]),
    autoValue: prevResult.autoValue,
    isAuto: newValue === "auto",
    listeners: prevResult.listeners,
  };

  mergeState(key, newResult);
}

function updateStateAuto<K extends keyof Options>(
  key: K,
  autoValue: Options[K],
) {
  const prevState = getState();
  const prevResult = prevState[key];

  const newResult: OptionResult<Options[K]> = {
    value: prevResult.isAuto ? autoValue : prevResult.value,
    autoValue,
    isAuto: prevResult.isAuto,
    listeners: prevResult.listeners,
  };

  mergeState(key, newResult);
}

function mapMediaQueryMatch(
  key: keyof Options,
  b: boolean,
): Options[typeof key] {
  switch (key) {
    case "theme":
      return b ? "dark" : "light";
    case "motion":
      return b ? "reduced" : "no-preference";
    case "stickers":
    case "font":
    default:
      throw new Error(`No mapping for media query related to ${key}`);
  }
}

function subscribeToMedia(
  query: string,
  key: keyof OptionsState,
  initialState: OptionsState,
) {
  const match = window.matchMedia(query);
  const initialValue = mapMediaQueryMatch(key, match.matches);
  // This is the only time where mutation is allowed.
  initialState[key].autoValue = initialValue;
  if (initialState[key].isAuto) {
    initialState[key].value = initialValue;
  }
  // End mutation

  match.addEventListener("change", (event) => {
    const value = mapMediaQueryMatch(key, event.matches);
    updateStateAuto(key, value);
  });
}

function getInitialState(): OptionsState {
  const isBrowser = "window" in globalThis;

  const storedState: Partial<Options> = isBrowser ? getStorageState() : {};

  const state = Object.fromEntries(
    Object.entries(DEFAULT_OPTIONS).map(([k, defaultValue]) => {
      const key = k as keyof Options;
      return [
        key,
        {
          value: storedState[key] ?? defaultValue,
          autoValue: defaultValue,
          isAuto: !(key in storedState),
          listeners: [],
        },
      ];
    }),
  ) as unknown as OptionsState;

  if (!isBrowser) {
    return state;
  }

  subscribeToMedia("(prefers-color-scheme: dark)", "theme", state);
  subscribeToMedia("(prefers-reduced-motion: reduce)", "motion", state);

  return state;
}

const memoGetOptions = memo<OptionsState, Options>(
  (state) =>
    Object.fromEntries(
      Object.entries(state).map(([key, option]) => [key, option.value]),
    ) as Options,
);
const memoGetOptionsAuto = memo<OptionsState, OptionsWithAuto>(
  (state) =>
    Object.fromEntries(
      Object.entries(state).map(([key, option]) => [
        key,
        option.isAuto ? "auto" : option.value,
      ]),
    ) as OptionsWithAuto,
);

export function getOptionValue<K extends keyof Options>(key: K): Options[K] {
  const state = getState();
  const options = memoGetOptions(state);
  return options[key];
}

export function getOptions(): Options {
  const state = getState();
  const options = memoGetOptions(state);
  return options;
}

export function getOptionsWithAuto(): OptionsWithAuto {
  const state = getState();
  const options = memoGetOptionsAuto(state);
  return options;
}

export function subscribeToOption<K extends keyof Options>(
  key: K,
  fn: OptionListener<Options[K]>,
): () => void {
  const { listeners } = getState()[key];

  listeners.push(fn);

  return () => {
    const index = listeners.indexOf(fn);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

export function subscribeToOptions(fn: () => void): () => void {
  const subscriptionCallback = () => {
    fn();
  };

  const unsubscriptionCallbacks = Object.keys(getState()).map((key) =>
    subscribeToOption(key as keyof Options, subscriptionCallback),
  );

  return () => {
    for (const cb of unsubscriptionCallbacks) {
      cb();
    }
  };
}
