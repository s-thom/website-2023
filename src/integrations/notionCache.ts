import type { AstroIntegration } from "astro";

export default function sthomNotionCache(): AstroIntegration {
  return {
    name: "sthom-notion-cache",
    hooks: {
      "astro:config:setup": ({ updateConfig, addDevToolbarApp, logger }) => {
        addDevToolbarApp("./src/integrations/notionCacheDevTools.ts");
        updateConfig({
          vite: {
            plugins: [
              {
                name: "sthom-notion-cache-vite",

                configureServer: (server) => {
                  server.ws.on("sthom:notion-cache", async (data, client) => {
                    logger.info(`Request to clear from page ${data.pageId}`);

                    const cachesModule =
                      await server.moduleGraph.getModuleByUrl(
                        "/src/lib/notion/caches.ts",
                      );
                    if (!cachesModule) {
                      logger.warn("Caches file not found");
                      return;
                    }
                    server.reloadModule(cachesModule);

                    client.send("sthom:reload", {});
                  });
                },
              },
            ],
          },
        });
      },
    },
  };
}
