import type { FolderApi, Pane } from "tweakpane";

export interface BaseOption<T> {
  type: unknown;
  label?: string;
  value: T;
  readonly?: boolean;
}

export interface ButtonOption extends BaseOption<unknown> {
  type: "button";
  onClick: () => void;
}
export interface BooleanOption extends BaseOption<boolean> {
  type: "boolean";
}

export interface FloatOption extends BaseOption<number> {
  type: "float";
  min?: number;
  max?: number;
  step?: number;
}

export interface IntOption extends BaseOption<number> {
  type: "int";
  min?: number;
  max?: number;
}

export interface StringOption extends BaseOption<string> {
  type: "string";
}

export interface Vec2Option extends BaseOption<[number, number]> {
  type: "vec2";
  min?: number;
  max?: number;
  step?: number;
  invertY?: boolean;
}

export interface ColorRgbOption extends BaseOption<[number, number, number]> {
  type: "rgb";
}

export interface ColorRgbAOption
  extends BaseOption<[number, number, number, number]> {
  type: "rgba";
}

export type AllOptions =
  | ButtonOption
  | BooleanOption
  | FloatOption
  | IntOption
  | StringOption
  | Vec2Option
  | ColorRgbOption
  | ColorRgbAOption;

export interface SlidersOptionsMap {
  [id: string]: AllOptions;
}

export interface SlidersInitialisedEventData {
  registerSliders(id: string, options: SlidersOptionsMap): void;
}
export const SlidersInitialisedEvent = CustomEvent<SlidersInitialisedEventData>;

export function addOptionsToPanel(
  container: Pane | FolderApi,
  options: SlidersOptionsMap,
) {
  for (const [key, option] of Object.entries(options)) {
    switch (option.type) {
      case "button":
        container
          .addButton({ title: option.label ?? key })
          .on("click", option.onClick);
        break;
      case "boolean":
      case "string":
        container.addBinding(option, "value", {
          label: option.label ?? key,
          readonly: option.readonly,
        });
        break;
      case "float":
        container.addBinding(option, "value", {
          label: option.label ?? key,
          readonly: option.readonly,
          min: option.min ?? 0,
          max: option.max ?? 100,
          step: option.step ?? 1,
        });
        break;
      case "int":
        container.addBinding(option, "value", {
          label: option.label ?? key,
          readonly: option.readonly,
          min: option.min ?? 0,
          max: option.max ?? 100,
          step: 1,
        });
        break;
      case "rgb":
        // eslint-disable-next-line no-case-declarations
        const rgbContainer = {
          rgb: {
            r: option.value[0],
            g: option.value[1],
            b: option.value[2],
          },
        };
        container
          .addBinding(rgbContainer, "rgb", {
            label: option.label ?? key,
            readonly: option.readonly,
            picker: "inline",
            color: { type: "float" },
          })
          .on("change", (ev) => {
            option.value = [ev.value.r, ev.value.g, ev.value.b];
          });
        break;
      case "rgba":
        // eslint-disable-next-line no-case-declarations
        const rgbaContainer = {
          rgba: {
            r: option.value[0],
            g: option.value[1],
            b: option.value[2],
            a: option.value[3],
          },
        };
        container
          .addBinding(rgbaContainer, "rgba", {
            label: option.label ?? key,
            readonly: option.readonly,
            picker: "inline",
            color: { type: "float" },
          })
          .on("change", (ev) => {
            option.value = [ev.value.r, ev.value.g, ev.value.b, ev.value.a];
          });
        break;
      case "vec2":
        // eslint-disable-next-line no-case-declarations
        const vec2Container = {
          vec2: {
            x: option.value[0],
            y: option.value[1],
          },
        };
        container
          .addBinding(vec2Container, "vec2", {
            label: option.label ?? key,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
            readonly: option.readonly ?? (false as any),
            picker: "inline",
            x: {
              min: option.min ?? -100,
              max: option.max ?? 100,
              step: option.step ?? 0.01,
            },
            y: {
              min: option.min ?? -100,
              max: option.max ?? 100,
              step: option.step ?? 0.01,
              inverted: option.invertY,
            },
          })
          .on("change", (ev) => {
            option.value = [ev.value.x, ev.value.y];
          });
        break;
      default:
        throw new Error(`Unsupported option type for ${key}`);
    }
  }
}
