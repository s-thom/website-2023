export function delay(ms: number) {
  return new Promise<void>((res) => {
    setTimeout(() => res(), ms);
  });
}

export function arrayRandom<T>(arr: T[]): T {
  if (arr.length === 0) {
    throw new Error("Array must have items");
  }

  return arr[Math.floor(Math.random() * arr.length)];
}
