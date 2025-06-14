// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@types/umami" />

interface ImportMetaEnv {
  readonly NOTION_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.astro" {}
