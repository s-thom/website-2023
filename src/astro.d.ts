import "astro";

declare module "astro" {
  interface AstroClientDirectives {
    "client:stickers"?: string;
  }
}
