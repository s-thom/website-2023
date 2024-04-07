/**
 * @param arr Array to choose from
 * @returns A random item from the given array
 */
export function arrayRandom<T>(arr: T[]): T {
  if (arr.length === 0) {
    throw new Error("Array must have items");
  }

  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * @param length Number of items to generate in the array
 * @returns An array from 0 to length - 1
 */
export function range(length: number): number[] {
  return [...Array(length)].map((_, i) => i);
}

export function clone<T>(value: T): T {
  if (typeof structuredClone !== "undefined") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

export const isBrowser = "window" in globalThis;
