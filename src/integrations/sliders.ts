import type { AstroIntegration } from "astro";

export default function sthomSliders(): AstroIntegration {
  return {
    name: "sthom-sliders",
    hooks: {
      "astro:config:setup": ({ addDevToolbarApp }) => {
        addDevToolbarApp("./src/integrations/slidersDevTools.ts");
      },
    },
  };
}
