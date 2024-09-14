import { Fragment, useSyncExternalStore } from "react";
import {
  getOptionsWithAuto,
  setOptionValue,
  subscribeToOptions,
  type Options,
  type OptionsWithAuto,
} from "../../../lib/options";

const OPTION_KEYS: Partial<{
  [k in keyof Options]: {
    title: string;
    description?: string;
    values: { value: OptionsWithAuto[k]; label: string }[];
  };
}> = {
  theme: {
    title: "Theme",
    values: [
      { value: "light", label: "Light" },
      { value: "dark", label: "Dark" },
      { value: "auto", label: "System default" },
    ],
  },
  font: {
    title: "Font",
    values: [
      { value: "serif", label: "Serif" },
      { value: "sans-serif", label: "Sans serif" },
      { value: "comic-sans", label: "Comic Sans" },
      { value: "auto", label: "Theme default" },
    ],
  },
  motion: {
    title: "Motion",
    description: "Enable or disable animated effects.",
    values: [
      { value: "reduced", label: "Off" },
      { value: "no-preference", label: "On" },
      { value: "auto", label: "System default" },
    ],
  },
};

export function SettingsPanelContent() {
  const options = useSyncExternalStore(
    subscribeToOptions,
    getOptionsWithAuto,
    getOptionsWithAuto,
  );

  const onOptionChange = <K extends keyof Options>(
    key: K,
    value: OptionsWithAuto[K],
  ) => {
    setOptionValue(key, value);
    document.documentElement.dataset[key] = value;
  };

  return (
    <div className="settings-content">
      <h2 className="settings-heading">Preferences</h2>
      {Object.keys(OPTION_KEYS).map((k) => {
        const key = k as keyof Options;
        const v = OPTION_KEYS[key]!;
        return (
          <Fragment key={key}>
            <h3 className="settings-setting-heading">{v.title}</h3>
            {v.description ? <p>{v.description}</p> : null}
            <div className="input-container">
              {v.values.map((value) => (
                <Fragment key={value.value}>
                  <input
                    id={`${key}-${value.value}`}
                    type="radio"
                    name={key}
                    value={value.value}
                    checked={options[key] === value.value}
                    onChange={() => onOptionChange(key, value.value)}
                    data-umami-event={key}
                    data-umami-event-theme={value.value}
                  />
                  <label
                    htmlFor={`${key}-${value.value}`}
                    tabIndex={0}
                    {...{ [`data-${key}`]: value.value }}
                  >
                    {value.label}
                  </label>
                </Fragment>
              ))}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
