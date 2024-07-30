export interface BaseOption<T> {
  type: unknown;
  value: T;
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
  | BooleanOption
  | FloatOption
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
