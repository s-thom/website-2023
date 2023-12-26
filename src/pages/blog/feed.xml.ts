import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getFilteredBlogItems } from "../../lib/notion/blog";
import { getInfoForPage, getPage } from "../../lib/notion/caches";
import { getPageTitleComponents } from "../../lib/notion/titles";
import {
  getPagePropertyByName,
  richTextToUnformattedString,
} from "../../lib/notion/util";

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

        const page = await getPage(info.id);
        const publishedProperty = getPagePropertyByName(
          page,
          "Published",
          "date",
        );
        const publishedDateString =
          publishedProperty?.date?.start ?? new Date().toString();

        return {
          title: richTextToUnformattedString(getPageTitleComponents(result)),
          pubDate: new Date(publishedDateString),
          link: url.toString(),
          // TODO: Get description and optionally content
          // description,
        };
      }),
    ),
    stylesheet: `${context.site!}static/pretty-feed-v3.xsl`,
  });
}
