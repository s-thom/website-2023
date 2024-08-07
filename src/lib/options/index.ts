const PREFERENCES_STORAGE_KEY = "sthom-preferences";

export type Options = {
  theme: "light" | "dark";
  motion: "reduced" | "no-preference";
  stickers: "on" | "off";
  font: "serif" | "sans-serif" | "comic-sans";
};

type OptionListener<V> = (value: V, valueWithAuto: V | "auto") => void;

type OptionResult<V> = {
  value: V;
  autoValue: V;
  isAuto: boolean;
  listeners: OptionListener<V>[];
};

type OptionsState = { [Key in keyof Options]: OptionResult<Options[Key]> };

function themeMatchToValue(matches: boolean): Options["theme"] {
  return matches ? "dark" : "light";
}
function motionMatchToValue(matches: boolean): Options["motion"] {
  return matches ? "reduced" : "no-preference";
}

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

function getInitialState(): OptionsState {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );

  const storedState: Partial<Options> = getStorageState();

  const options: OptionsState = {
    theme: {
      value: storedState.theme ?? themeMatchToValue(prefersDark.matches),
      autoValue: themeMatchToValue(prefersDark.matches),
      isAuto: !("theme" in storedState),
      listeners: [],
    },
    motion: {
      value:
        storedState.motion ?? motionMatchToValue(prefersReducedMotion.matches),
      autoValue: motionMatchToValue(prefersReducedMotion.matches),
      isAuto: !("motion" in storedState),
      listeners: [],
    },
    stickers: {
      value: storedState.stickers ?? "on",
      autoValue: "on",
      isAuto: !("stickers" in storedState),
      listeners: [],
    },
    font: {
      value: storedState.font ?? "sans-serif",
      autoValue: "sans-serif",
      isAuto: !("font" in storedState),
      listeners: [],
    },
  };

  prefersDark.addEventListener("change", (event) => {
    const value = themeMatchToValue(event.matches);
    options.theme.autoValue = value;

    if (options.theme.isAuto) {
      options.theme.value = value;

      notifyListeners(options.theme);
    } else {
      const stored = getStorageState();
      stored.theme = value;
      setStorageState(stored);
    }
  });

  prefersReducedMotion.addEventListener("change", (event) => {
    const value = motionMatchToValue(event.matches);
    options.motion.autoValue = value;

    if (options.motion.isAuto) {
      options.motion.value = value;

      notifyListeners(options.motion);
    } else {
      const stored = getStorageState();
      stored.motion = value;
      setStorageState(stored);
    }
  });

  window.addEventListener("storage", (event) => {
    if (
      event.storageArea === window.localStorage &&
      event.key === PREFERENCES_STORAGE_KEY &&
      event.newValue != null
    ) {
      const parsed = JSON.parse(event.newValue) as Partial<Options>;

      for (const k of Object.keys(options)) {
        const key = k as keyof typeof options;
        const option = options[key];

        if (key in parsed && parsed[key] != null) {
          option.value = parsed[key];
          option.isAuto = false;
          notifyListeners(option as any);
        } else if (!option.isAuto) {
          option.isAuto = true;
          option.value = option.autoValue;
          notifyListeners(option as any);
        }
      }
    }
  });

  return options;
}

const STATE: OptionsState = getInitialState();

export function getOptionValue<K extends keyof Options>(key: K): Options[K] {
  return STATE[key].value;
}

export function getOptionValueWithAuto<K extends keyof Options>(
  key: K,
): Options[K] | "auto" {
  const option = STATE[key];
  return option.isAuto ? "auto" : option.value;
}

export function setOptionValue<K extends keyof Options>(
  key: K,
  value: Options[K] | "auto",
): void {
  const stored = getStorageState();
  const option = STATE[key];

  if (value === "auto") {
    option.isAuto = true;
    option.value = option.autoValue;

    notifyListeners(option as any);

    delete stored[key];
    setStorageState(stored);
    return;
  }

  option.isAuto = false;
  option.value = value;

  notifyListeners(option);
  stored[key] = value;
  setStorageState(stored);
}

export function subscribeToOption<K extends keyof Options>(
  key: K,
  fn: OptionListener<Options[K]>,
): () => void {
  const { listeners } = STATE[key];

  listeners.push(fn);

  return () => {
    const index = listeners.indexOf(fn);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}
