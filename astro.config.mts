// eslint-disable-next-line import/no-unresolved
import react from "@astrojs/react";
// eslint-disable-next-line import/no-unresolved
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import sthomClientStickers from "./src/integrations/clientStickers";
import sthomFavicon from "./src/integrations/favicon";
import sthomImages from "./src/integrations/images";
import sthomNotionCache from "./src/integrations/notionCache";
import { IMAGE_OPTIMISATION_ALLOWED_DOMAINS } from "./src/lib/constants";

function getSiteUrl() {
  if (process.env.SITE_URL) {
    return process.env.SITE_URL;
  }
  if (process.env.CF_PAGES_URL) {
    return process.env.CF_PAGES_URL;
  }

  return process.env.NODE_ENV === "production"
    ? "https://sthom.kiwi"
    : "http://localhost:4321";
}

// https://astro.build/config
export default defineConfig({
  site: getSiteUrl(),
  integrations: [
    sthomClientStickers(),
    sthomImages(),
    sthomFavicon({ src: "./src/resources/profile-2023.jpg" }),
    sthomNotionCache(),
    react(),
    sitemap(),
  ],
  scopedStyleStrategy: "class",
  build: {
    assets: "static/build",
    format: "file",
  },
  trailingSlash: "never",
  image: {
    domains: IMAGE_OPTIMISATION_ALLOWED_DOMAINS,
  },
  vite: {
    ssr: {
      external: ["@resvg/resvg-js"],
    },
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
});
