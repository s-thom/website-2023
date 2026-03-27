import { Pane } from "tweakpane";
import { tweakpaneCSS } from "../../css/misc/tweakpane";
import {
  addOptionsToPanel,
  type SlidersInitialisedEventData,
} from "../../lib/shaders/sliders";

const style = document.createElement("style");
style.textContent = tweakpaneCSS;
document.head.appendChild(style);

const container = document.createElement("div");
container.style.setProperty("position", "fixed");
container.style.setProperty("top", "16px");
container.style.setProperty("right", "16px");
container.style.setProperty("z-index", "9999");
document.body.appendChild(container);

const pane = new Pane({ container, title: "Sliders" });

window.addEventListener('load', ()=>{
const event = new CustomEvent<SlidersInitialisedEventData>("slidersinitialised", {
  detail: {
    registerSliders(id, options) {
      const folder = pane.addFolder({ title: id });
      addOptionsToPanel(folder, options);
    },
  },
});
window.dispatchEvent(event);
})
