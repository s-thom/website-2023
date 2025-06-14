import type { AstroIntegration } from "astro";

export default function sthomStickersClientDirective(): AstroIntegration {
  return {
    name: "sthom-stickers-client-directive",
    hooks: {
      "astro:config:setup": ({ addClientDirective }) => {
        addClientDirective({
          name: "stickers",
          entrypoint:
            "./src/integrations/stickers-client-directive/integration.ts",
        });
      },
    },
  };
}
