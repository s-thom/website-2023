/* eslint-disable import/no-extraneous-dependencies */
// eslint-disable-next-line import/no-unresolved
import react from "@astrojs/react";
// eslint-disable-next-line import/no-unresolved
import sitemap from "@astrojs/sitemap";
// eslint-disable-next-line import/no-unresolved
import { defineConfig } from "astro/config";
import glsl from "vite-plugin-glsl";
import sthomClientStickers from "./src/integrations/clientStickers";
import sthomFavicon from "./src/integrations/favicon";
import sthomImages from "./src/integrations/images-old";
import sthomNotionLoader from "./src/integrations/notion-loader/integration";
import sthomRelatedPosts from "./src/integrations/related-posts/integration";
import sthomSliders from "./src/integrations/sliders";
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
    sthomNotionLoader(),
    sthomSliders(),
    sthomRelatedPosts({
      collection: "pages",
      label: "blog-posts",
      filter: (pageInfo) =>
        pageInfo.properties.Type?.name === "blog" &&
        pageInfo.properties.Status?.name === "Listed",
    }),
    react(),
    sitemap({ filter: (page) => !page.includes("/flummoxed/") }),
  ],
  experimental: {
    csp: false,
    // csp: {
    //   directives: ["default-src 'self'", "frame-ancestors 'none'"],
    // },
  },
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
    plugins: [glsl()],
  },
});
