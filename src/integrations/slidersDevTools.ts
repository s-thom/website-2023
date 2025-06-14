import { type DevToolbarApp } from "astro";
import { Pane } from "tweakpane";
import { tweakpaneCSS } from "../css/misc/tweakpane";
import { h } from "../lib/h";
import {
  addOptionsToPanel,
  type SlidersInitialisedEventData,
} from "../lib/shaders/sliders";

const notionCacheDevTools: DevToolbarApp = {
  init(canvas, app) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const container = h(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "astro-dev-overlay-window" as any,
      { style: { padding: "0px", borderRadius: "7px" } },
      [h("style", {}, tweakpaneCSS)],
    );
    canvas.appendChild(container);

    let pane: Pane | undefined;

    app.onToggled(({ state }) => {
      if (state) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        pane = new Pane({ container, title: "Sliders" });

        const event = new CustomEvent<SlidersInitialisedEventData>(
          "slidersinitialised",
          {
            detail: {
              registerSliders(id, options) {
                if (pane) {
                  const folder = pane.addFolder({ title: id });
                  addOptionsToPanel(folder, options);
                }
              },
            },
          },
        );
        window.dispatchEvent(event);
      } else {
        if (pane) {
          pane.dispose();
        }
      }
    });
  },
};

export default notionCacheDevTools;
