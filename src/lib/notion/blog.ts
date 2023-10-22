import type {
  DatabaseObjectResponse,
  QueryDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints";
import { BLOG_COLLECTION_ID, PAGES_COLLECTION_ID } from "../constants";
import { queryDatabase } from "./caches";

const PAGES_FILTER: QueryDatabaseParameters["filter"] = !import.meta.env.DEV
  ? {
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
    }
  : undefined;
const PAGES_SORT: QueryDatabaseParameters["sorts"] = [
  { property: "Published", direction: "descending" },
];

export async function getFilteredBlogItems() {
  const pages = await queryDatabase(
    BLOG_COLLECTION_ID,
    PAGES_FILTER,
    PAGES_SORT,
  );

  return pages as unknown as DatabaseObjectResponse[];
}

export async function getFilteredPageItems() {
  const pages = await queryDatabase(
    PAGES_COLLECTION_ID,
    PAGES_FILTER,
    PAGES_SORT,
  );

  return pages as unknown as DatabaseObjectResponse[];
}
