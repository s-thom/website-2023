import type { AstroIntegration } from "astro";

const NOTION_SVG =
  '<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M61.35 0.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723 0.967 5.053 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257 -3.89c5.433 -0.387 6.99 -2.917 6.99 -7.193V20.64c0 -2.21 -0.873 -2.847 -3.443 -4.733L74.167 3.143c-4.273 -3.107 -6.02 -3.5 -12.817 -2.917zM25.92 19.523c-5.247 0.353 -6.437 0.433 -9.417 -1.99L8.927 11.507c-0.77 -0.78 -0.383 -1.753 1.557 -1.947l53.193 -3.887c4.467 -0.39 6.793 1.167 8.54 2.527l9.123 6.61c0.39 0.197 1.36 1.36 0.193 1.36l-54.933 3.307 -0.68 0.047zM19.803 88.3V30.367c0 -2.53 0.777 -3.697 3.103 -3.893L86 22.78c2.14 -0.193 3.107 1.167 3.107 3.693v57.547c0 2.53 -0.39 4.67 -3.883 4.863l-60.377 3.5c-3.493 0.193 -5.043 -0.97 -5.043 -4.083zm59.6 -54.827c0.387 1.75 0 3.5 -1.75 3.7l-2.91 0.577v42.773c-2.527 1.36 -4.853 2.137 -6.797 2.137 -3.107 0 -3.883 -0.973 -6.21 -3.887l-19.03 -29.94v28.967l6.02 1.363s0 3.5 -4.857 3.5l-13.39 0.777c-0.39 -0.78 0 -2.723 1.357 -3.11l3.497 -0.97v-38.3L30.48 40.667c-0.39 -1.75 0.58 -4.277 3.3 -4.473l14.367 -0.967 19.8 30.327v-26.83l-5.047 -0.58c-0.39 -2.143 1.163 -3.7 3.103 -3.89l13.4 -0.78z" fill="currentColor"/></svg>';

export default function sthomNotionLoader(): AstroIntegration {
  return {
    name: "sthom-notion-loader",
    hooks: {
      "astro:config:setup": ({ addDevToolbarApp }) => {
        addDevToolbarApp({
          id: "sthom-notion-loader-dev-tools",
          name: "Notion Cache",
          icon: NOTION_SVG,
          entrypoint: new URL("./dev-tools.ts", import.meta.url),
        });
      },
      "astro:server:setup": ({ server, refreshContent, logger }) => {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        server.ws.on("sthom-notion-loader:reload", async (data, client) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          logger.info(`Request to clear from page ${data.pageId}`);

          if (refreshContent) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            client.send("sthom-notion-loader:reload-started", {});
            await refreshContent({
              loaders: ["sthom-notion-loader"],
              context: {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                pageId: data.pageId as never,
              },
            });
          }

          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          client.send("sthom-notion-loader:reload-complete", {});
        });
      },
    },
  };
}
