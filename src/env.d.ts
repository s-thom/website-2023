/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly NOTION_TOKEN: string;
  readonly NOTION_SPACE: string;
  readonly NOTION_BLOG_COLLECTION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
