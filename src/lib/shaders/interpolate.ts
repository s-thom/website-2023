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

/**
 * A stateful interpolation object
 */
export class Interpolate {
  private fn: EasingFunction;

  private initialValue: number;

  private initialTime: DOMHighResTimeStamp;

  private goalDuration: number;

  private goalValue: number;

  constructor(fn: EasingFunction, initialValue: number) {
    this.fn = fn;
    this.initialValue = initialValue;
    this.initialTime = performance.now();
    this.goalValue = initialValue;
    this.goalDuration = 0;
  }

  setTarget(value: number, durationMs: number): void {
    this.initialValue = this.getValue();
    this.goalValue = value;
    this.goalDuration = durationMs;
    this.initialTime = performance.now();
  }

  getValue(): number {
    const time = performance.now();

    // Early exit (does this save time? Fewer function calls at the cost of a few more instructions when active)
    if (this.initialTime + this.goalDuration < time) {
      return this.goalValue;
    }

    const deltaTime = time - this.initialTime;
    const t = Math.min(Math.max(deltaTime / this.goalDuration, 0), 1);
    const factor = this.fn(t);

    const result = (1 - factor) * this.initialValue + factor * this.goalValue;
    return result;
  }
}
