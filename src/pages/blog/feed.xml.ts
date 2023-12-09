import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getFilteredBlogItems } from "../../lib/notion/blog";
import { getInfoForPage } from "../../lib/notion/caches";
import { getPageTitleComponents } from "../../lib/notion/titles";
import { richTextToUnformattedString } from "../../lib/notion/util";

export async function GET(context: APIContext) {
  const results = await getFilteredBlogItems({
    allowUnpublished: false,
    allowUnlisted: false,
  });

  return rss({
    title: "Stuart Thomson’s Blog",
    description: "The blog of Stuart Thomson",
    site: `${context.site!}blog/`,
    // Array of `<item>`s in output xml
    // See "Generating items" section for examples using content collections and glob imports
    items: await Promise.all(
      results.map(async (result) => {
        const info = await getInfoForPage(result.id);

        const url = new URL(info.path, context.site);

        return {
          title: richTextToUnformattedString(getPageTitleComponents(result)),
          // TODO: get rid of any if possible
          pubDate: new Date((result.properties.Published as any).date.start),
          link: url.toString(),
          // TODO: Get description and optionally content
          // description,
        };
      }),
    ),
    stylesheet: `${context.site!}static/pretty-feed-v3.xsl`,
  });
}
