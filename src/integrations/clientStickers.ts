import type { AstroIntegration } from "astro";

export default function sthomClientStickers(): AstroIntegration {
  return {
    name: "sthom-client-stickers",
    hooks: {
      "astro:config:setup": ({ addClientDirective }) => {
        addClientDirective({
          name: "stickers",
          entrypoint: "./src/integrations/clientStickersEntrypoint.ts",
        });
      },
    },
  };
}
