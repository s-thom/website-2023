/**
 * @param t Time progress, from 0-1
 * @returns 0-1
 */
export type EasingFunction = (t: number) => number;

/**
 * https://easings.net/#easeInOutCubic
 */
export function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

type InterpolateEvents = {
  start: { current: number; target: number; durationMs: number };
  end: { current: number };
};

type InterpolateEventListeners = {
  [K in keyof InterpolateEvents]: (value: InterpolateEvents[K]) => void;
};

/**
 * A stateful interpolation object
 */
export class Interpolate {
  private fn: EasingFunction;

  private initialValue: number;

  private initialTime: DOMHighResTimeStamp;

  private goalDuration: number;

  private goalValue: number;

  private didSendEndEvent: boolean;

  private listeners: {
    [K in keyof InterpolateEventListeners]: InterpolateEventListeners[K][];
  };

  constructor(fn: EasingFunction, initialValue: number) {
    this.fn = fn;
    this.initialValue = initialValue;
    this.initialTime = performance.now();
    this.goalValue = initialValue;
    this.goalDuration = 0;
    this.didSendEndEvent = true;

    this.listeners = {
      start: [],
      end: [],
    };
  }

  setTarget(value: number, durationMs: number): void {
    this.initialValue = this.getValue();
    this.goalValue = value;
    this.goalDuration = durationMs;
    this.initialTime = performance.now();
    this.didSendEndEvent = false;

    for (const fn of this.listeners.start) {
      try {
        fn({
          current: this.initialValue,
          target: this.goalValue,
          durationMs: this.goalDuration,
        });
      } catch (err) {
        // Don't do anything
      }
    }
  }

  getValue(): number {
    const time = performance.now();

    // Early exit (does this save time? Fewer function calls at the cost of a few more instructions when active)
    if (this.initialTime + this.goalDuration < time) {
      if (!this.didSendEndEvent) {
        this.didSendEndEvent = true;

        for (const fn of this.listeners.end) {
          try {
            fn({
              current: this.goalValue,
            });
          } catch (err) {
            // Don't do anything
          }
        }
      }

      return this.goalValue;
    }

    const deltaTime = time - this.initialTime;
    const t = Math.min(Math.max(deltaTime / this.goalDuration, 0), 1);
    const factor = this.fn(t);

    const result = (1 - factor) * this.initialValue + factor * this.goalValue;
    return result;
  }

  on<K extends keyof InterpolateEventListeners>(
    name: K,
    listener: InterpolateEventListeners[K],
  ): () => void {
    const listeners = this.listeners[name];
    listeners.push(listener);

    return () => {
      const index = listeners.findIndex((fn) => fn === listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }
}
