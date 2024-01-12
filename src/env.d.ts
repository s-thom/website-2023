/// <reference types="astro/client" />

import "astro";

interface ImportMetaEnv {
  readonly NOTION_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.astro" {}

declare module "astro" {
  interface AstroClientDirectives {
    "client:stickers"?: string;
  }
}
