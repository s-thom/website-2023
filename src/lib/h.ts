type HTMLAttrMap<Tag extends keyof HTMLElementTagNameMap> = Omit<
  HTMLElementTagNameMap[Tag],
  "style"
> & {
  style: Partial<Omit<HTMLElementTagNameMap[Tag]["style"], "setProperty">>;
};

const EVENT_NAME_REGEX = /^on(.*)(capture)?$/;

export function h<Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  attributes: Partial<HTMLAttrMap<Tag>>,
  children: Node[] | string,
): HTMLElementTagNameMap[Tag] {
  const element = document.createElement(tag);

  for (const [key, value] of Object.entries(attributes)) {
    const eventNameMatch = key.match(EVENT_NAME_REGEX);
    if (eventNameMatch) {
      const isCapture = eventNameMatch[2] === "capture";
      element.addEventListener(eventNameMatch[1], value as any, {
        capture: isCapture,
      });
      break;
    }

    if (key === "style") {
      for (const [prop, propValue] of Object.entries(
        value as CSSStyleDeclaration,
      )) {
        element.style.setProperty(prop, propValue);
      }
      break;
    }

    element[key as keyof HTMLElementTagNameMap[Tag]] = value as any;
  }

  if (typeof children === "string") {
    element.textContent = children;
  } else {
    for (const child of children) {
      element.appendChild(child);
    }
  }

  return element;
}
