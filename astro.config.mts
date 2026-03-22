import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";
import glsl from "vite-plugin-glsl";
import sthomFavicon from "./src/integrations/favicon/integration";
import sthomImagesOld from "./src/integrations/images-old/integration";
import sthomNotionLoader from "./src/integrations/notion-loader/integration";
import sthomRelatedPosts from "./src/integrations/related-posts/integration";
import sthomSliders from "./src/integrations/sliders-dev-tools/integration";
import sthomStickersClientDirective from "./src/integrations/stickers-client-directive/integration";
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
    sthomStickersClientDirective(),
    sthomImagesOld(),
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
  security: { csp: false },
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
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Parclo Serif",
      cssVariable: "--font-parclo-serif",
      fallbacks: ["Georgia", "serif"],
      options: {
        variants: [
          {
            src: [
              "./src/resources/fonts/ParcloSerif/ParcloSerif-Black.woff2",
              "./src/resources/fonts/ParcloSerif/ParcloSerif-Black.woff",
            ],
            weight: 900,
            style: "normal",
          },
          {
            src: [
              "./src/resources/fonts/ParcloSerif/ParcloSerif-BlackItalic.woff2",
              "./src/resources/fonts/ParcloSerif/ParcloSerif-BlackItalic.woff",
            ],
            weight: 900,
            style: "italic",
          },
          {
            src: [
              "./src/resources/fonts/ParcloSerif/ParcloSerif-Bold.woff2",
              "./src/resources/fonts/ParcloSerif/ParcloSerif-Bold.woff",
            ],
            weight: 700,
            style: "normal",
          },
          {
            src: [
              "./src/resources/fonts/ParcloSerif/ParcloSerif-BoldItalic.woff2",
              "./src/resources/fonts/ParcloSerif/ParcloSerif-BoldItalic.woff",
            ],
            weight: 700,
            style: "italic",
          },
          {
            src: [
              "./src/resources/fonts/ParcloSerif/ParcloSerif-ExtraBlack.woff2",
              "./src/resources/fonts/ParcloSerif/ParcloSerif-ExtraBlack.woff",
            ],
            weight: 950,
            style: "normal",
          },
          {
            src: [
              "./src/resources/fonts/ParcloSerif/ParcloSerif-ExtraBlackItalic.woff2",
              "./src/resources/fonts/ParcloSerif/ParcloSerif-ExtraBlackItalic.woff",
            ],
            weight: 950,
            style: "italic",
          },
          {
            src: [
              "./src/resources/fonts/ParcloSerif/ParcloSerif-Italic.woff2",
              "./src/resources/fonts/ParcloSerif/ParcloSerif-Italic.woff",
            ],
            weight: 400,
            style: "italic",
          },
          {
            src: [
              "./src/resources/fonts/ParcloSerif/ParcloSerif-Light.woff2",
              "./src/resources/fonts/ParcloSerif/ParcloSerif-Light.woff",
            ],
            weight: 300,
            style: "normal",
          },
          {
            src: [
              "./src/resources/fonts/ParcloSerif/ParcloSerif-LightItalic.woff2",
              "./src/resources/fonts/ParcloSerif/ParcloSerif-LightItalic.woff",
            ],
            weight: 300,
            style: "italic",
          },
          {
            src: [
              "./src/resources/fonts/ParcloSerif/ParcloSerif-Medium.woff2",
              "./src/resources/fonts/ParcloSerif/ParcloSerif-Medium.woff",
            ],
            weight: 500,
            style: "normal",
          },
          {
            src: [
              "./src/resources/fonts/ParcloSerif/ParcloSerif-MediumItalic.woff2",
              "./src/resources/fonts/ParcloSerif/ParcloSerif-MediumItalic.woff",
            ],
            weight: 500,
            style: "italic",
          },
          {
            src: [
              "./src/resources/fonts/ParcloSerif/ParcloSerif-Regular.woff2",
              "./src/resources/fonts/ParcloSerif/ParcloSerif-Regular.woff",
            ],
            weight: 400,
            style: "normal",
          },
          {
            src: [
              "./src/resources/fonts/ParcloSerif/ParcloSerif-SemiBold.woff2",
              "./src/resources/fonts/ParcloSerif/ParcloSerif-SemiBold.woff",
            ],
            weight: 600,
            style: "normal",
          },
          {
            src: [
              "./src/resources/fonts/ParcloSerif/ParcloSerif-SemiBoldItalic.woff2",
              "./src/resources/fonts/ParcloSerif/ParcloSerif-SemiBoldItalic.woff",
            ],
            weight: 600,
            style: "italic",
          },
          {
            src: [
              "./src/resources/fonts/ParcloSerif/ParcloSerif-Thin.woff2",
              "./src/resources/fonts/ParcloSerif/ParcloSerif-Thin.woff",
            ],
            weight: 100,
            style: "normal",
          },
          {
            src: [
              "./src/resources/fonts/ParcloSerif/ParcloSerif-ThinItalic.woff2",
              "./src/resources/fonts/ParcloSerif/ParcloSerif-ThinItalic.woff",
            ],
            weight: 100,
            style: "italic",
          },
          {
            src: [
              "./src/resources/fonts/ParcloSerif/ParcloSerif-Ultra.woff2",
              "./src/resources/fonts/ParcloSerif/ParcloSerif-Ultra.woff",
            ],
            weight: 975,
            style: "normal",
          },
          {
            src: [
              "./src/resources/fonts/ParcloSerif/ParcloSerif-UltraItalic.woff2",
              "./src/resources/fonts/ParcloSerif/ParcloSerif-UltraItalic.woff",
            ],
            weight: 975,
            style: "italic",
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: "Source Code Pro",
      cssVariable: "--font-source-code",
      fallbacks: [
        "Cascadia Code",
        "Menlo",
        "Consolas",
        "DejaVu Sans Mono",
        "ui-monospace",
        "monospace",
      ],
      options: {
        variants: [
          {
            src: [
              "./src/resources/fonts/SourceCodePro/SourceCodeVF-Upright.ttf.woff2",
            ],
            weight: "200 900",
            style: "normal",
          },
          {
            src: [
              "./src/resources/fonts/SourceCodePro/SourceCodeVF-Italic.ttf.woff2",
            ],
            weight: "200 900",
            style: "italic",
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: "Trunic",
      cssVariable: "--font-trunic",
      fallbacks: ["monospace"],
      optimizedFallbacks: false,
      options: {
        variants: [
          {
            src: ["./src/resources/fonts/Trunic/Trunic-Bold.woff2"],
            weight: 700,
            style: "normal",
          },
          {
            src: ["./src/resources/fonts/Trunic/Trunic-Regular.woff2"],
            weight: 400,
            style: "normal",
          },
        ],
      },
    },
  ],
});
