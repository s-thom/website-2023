import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getUrlSlugForPage } from "../../lib/notion";
import { getFilteredBlogItems } from "../../lib/notion/blog";
import { richTextToUnformattedString } from "../../lib/notion/util";

export async function GET(context: APIContext) {
  const pages = await getFilteredBlogItems();

  return rss({
    title: "Stuart Thomson’s Blog",
    description: "The blog of Stuart Thomson",
    site: `${context.site!}blog/`,
    // Array of `<item>`s in output xml
    // See "Generating items" section for examples using content collections and glob imports
    items: pages.map((page) => ({
      // TODO: get rid of anys if possible
      title: richTextToUnformattedString((page.properties.Name as any).title),
      pubDate: new Date((page.properties.Published as any).date.start),
      link: `${context.site}blog/${getUrlSlugForPage(page)}`,
      // TODO: Get description and optionally content
      // description,
    })),
    stylesheet: `${context.site!}static/pretty-feed-v3.xsl`,
  });
}
