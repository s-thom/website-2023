import { clsx, type ClassArray } from "clsx/lite";

export interface ElOptions {
  classes?: ClassArray;
  events?: Partial<{
    [event in keyof HTMLElementEventMap]: (
      this: EventTarget,
      ev: HTMLElementEventMap[event],
    ) => void;
  }>;
  textContent?: string;
}

export function el<T extends keyof HTMLElementTagNameMap>(
  type: T,
  options?: ElOptions,
  children?: (Node | 0 | "" | false | undefined | null)[],
): HTMLElementTagNameMap[T] {
  const element = document.createElement(type);

  if (options?.classes) {
    element.className = clsx(...options.classes);
  }
  if (options?.events) {
    for (const [name, listener] of Object.entries(options.events)) {
      element.addEventListener(name, listener as any);
    }
  }

  if (children) {
    for (const child of children.filter(Boolean)) {
      element.appendChild(child as Node);
    }
  }

  if (options?.textContent) {
    element.textContent = options.textContent;
  }

  return element;
}
