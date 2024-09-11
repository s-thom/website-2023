import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { join } from "node:path/posix";
import { getPageTitleComponents } from "../../lib/notion/titles";
import { richTextToUnformattedString } from "../../lib/notion/util";

export async function GET(context: APIContext) {
  const listedBlogPosts = await getCollection(
    "pages",
    (entry) =>
      entry.data.properties.Type?.name === "blog" &&
      entry.data.properties.Status?.name === "Listed",
  );

  return rss({
    title: "Stuart Thomson’s Blog",
    description: "The blog of Stuart Thomson",
    site: `${context.site!}blog/`,
    // Array of `<item>`s in output xml
    // See "Generating items" section for examples using content collections and glob imports
    items: await Promise.all(
      listedBlogPosts.map(async (item) => {
        const url = new URL(join("/blog", item.data.slug), context.site);

        const publishedDateString =
          item.data.properties.Published?.start ?? new Date().toString();

        return {
          title: richTextToUnformattedString(
            getPageTitleComponents(item.data.page),
          ),
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
