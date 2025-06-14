import type { ClientDirective } from "astro";

/**
 * Stickers should load faster when there are stickers on this page.
 * Otherwise they are really low priority.
 */
const clientStickersEntrypoint: ClientDirective = (load, opts) => {
  const cb = () => {
    void load().then((hydrate) => hydrate());
  };

  // If there's a sticker for this page, then we want to load quickly.
  // That said, we don't want to block critical content so still wait for idle.
  if (opts.value) {
    // This is reading straight from the stored state, so is maybe a little flaky
    const regex = new RegExp(`"zone":"${opts.value}"`);
    if (
      "localStorage" in window &&
      window.localStorage.getItem("sthom-website-2023")?.match(regex)
    ) {
      // Load immediately
      cb();
      return;
    }
  }

  // If idle callback is available, wait for idle + 1 second.
  // Otherwise wait 3 seconds.
  // It's not like people are going to be that active on initial page load,
  // and stickers are a low-priority feature.
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  "requestIdleCallback" in window
    ? requestIdleCallback(() => setTimeout(cb, 1000), { timeout: 2000 })
    : setTimeout(cb, 3000);
};

export default clientStickersEntrypoint;
