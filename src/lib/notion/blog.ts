import type {
  DatabaseObjectResponse,
  QueryDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints";
import { BLOG_COLLECTION_ID, PAGES_COLLECTION_ID } from "../constants";
import { queryDatabase } from "./caches";

const PAGES_SORT: QueryDatabaseParameters["sorts"] = [
  { property: "Published", direction: "descending" },
];

interface FilterOptions {
  allowUnpublished?: boolean;
  allowUnlisted?: boolean;
}

export function getFilter({
  allowUnlisted,
  allowUnpublished,
}: FilterOptions): QueryDatabaseParameters["filter"] {
  // Notion doesn't export types for these.
  const filters: any[] = [];

  if (!allowUnlisted) {
    filters.push({
      property: "Tags",
      multi_select: { does_not_contain: "unlisted" },
    });
  }

  if (!allowUnpublished) {
    filters.push(
      {
        property: "Published",
        date: { on_or_before: new Date().toISOString() },
      },
      {
        property: "Tags",
        multi_select: { does_not_contain: "no-publish" },
      },
    );
  }

  if (filters.length) {
    return {
      and: filters,
    };
  }

  return undefined;
}

export async function getFilteredBlogItems(filter: FilterOptions) {
  const pages = await queryDatabase(
    BLOG_COLLECTION_ID,
    getFilter(filter),
    PAGES_SORT,
  );

  return pages as unknown as DatabaseObjectResponse[];
}

export async function getFilteredPageItems(filter: FilterOptions) {
  const pages = await queryDatabase(
    PAGES_COLLECTION_ID,
    getFilter(filter),
    PAGES_SORT,
  );

  return pages as unknown as DatabaseObjectResponse[];
}
