// eslint-disable-next-line import/no-unresolved
import react from "@astrojs/react";
// import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import sthomFavicon from "./src/integrations/favicon";
import sthomImages from "./src/integrations/images";
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
    sthomImages(),
    sthomFavicon({ src: "./src/resources/profile-2023.jpg" }),
    react(),
    // sitemap(),
  ],
  scopedStyleStrategy: "class",
  build: {
    assets: "static/build",
  },
  image: {
    domains: IMAGE_OPTIMISATION_ALLOWED_DOMAINS,
  },
});
