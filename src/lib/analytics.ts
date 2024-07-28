export function sendEvent(
  type: string,
  data: { [key: string]: string | number },
) {
  // @ts-ignore
  if (typeof umami !== "undefined") {
    // @ts-ignore
    umami.track(type, data);
  }
}
