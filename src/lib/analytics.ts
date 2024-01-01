export function sendEvent(
  type: string,
  data: { [key: string]: string | number },
) {
  if (typeof umami !== "undefined") {
    umami.track(type, data);
  }
}
