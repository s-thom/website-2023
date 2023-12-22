/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly NOTION_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.astro" {}
