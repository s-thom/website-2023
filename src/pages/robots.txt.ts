import type { APIContext } from "astro";

const ALLOWED_BOTS = [
  "archive.org_bot",
  "Googlebot",
  "Googlebot-Image",
  "BingBot",
  "DuckDuckBot",
  "search.marginalia.nu",
  "TinyGem",
];

export async function GET(context: APIContext): Promise<Response> {
  return new Response(`# Stuart Thomson's robots.txt

${ALLOWED_BOTS.map((name) => `User-agent: ${name}\nDisallow:`).join("\n")}

# Allowed
User-agent: *
Disallow: /

Sitemap: ${context.site}sitemap-index.xml
`);
}
