import type { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { BLOG_COLLECTION_ID } from "../constants";
import { queryDatabase } from "./caches";

export async function getFilteredBlogItems() {
  const pages = await queryDatabase(
    BLOG_COLLECTION_ID,
    {
      and: [
        {
          property: "Published",
          date: { on_or_before: new Date().toISOString() },
        },
        {
          property: "Tags",
          multi_select: { does_not_contain: "no-publish" },
        },
      ],
    },
    [{ property: "Published", direction: "descending" }],
  );

  return pages as unknown as DatabaseObjectResponse[];
}
