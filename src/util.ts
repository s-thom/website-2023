/**
 * @param arr Array to choose from
 * @returns A random item from the given array
 */
export function arrayRandom<T>(arr: T[], random = () => Math.random()): T {
  if (arr.length === 0) {
    throw new Error("Array must have items");
  }

  return arr[Math.floor(random() * arr.length)];
}

/**
 * @param length Number of items to generate in the array
 * @returns An array from 0 to length - 1
 */
export function range(length: number): number[] {
  return [...Array<number>(length)].map((_, i) => i);
}

export function clone<T>(value: T): T {
  if (typeof structuredClone !== "undefined") {
    return structuredClone(value);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return JSON.parse(JSON.stringify(value));
}

export function combine(...fns: (() => void)[]): () => void {
  return () => {
    fns.forEach((fn) => {
      fn();
    });
  };
}

export const isBrowser = "window" in globalThis;
