import type { QueryDatabaseParameters } from "@notionhq/client/build/src/api-endpoints";

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

export function getSort(): QueryDatabaseParameters["sorts"] {
  return [{ property: "Published", direction: "descending" }];
}
