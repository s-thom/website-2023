import { collectPaginatedAPI } from "@notionhq/client";
import type {
  BlockObjectResponse,
  DatabaseObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { getClient } from "./notionClient";

export async function getFilteredPageCollectionItems(collectionId: string) {
  const client = getClient();

  const queryResponse = await collectPaginatedAPI(client.databases.query, {
    database_id: collectionId,
    filter: {
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
  });

  return queryResponse as unknown as DatabaseObjectResponse[];
}

export async function getBlock(id: string) {
  const client = getClient();

  const block = await client.blocks.retrieve({ block_id: id });

  return block;
}

export async function getPage(id: string) {
  const client = getClient();

  const page = await client.pages.retrieve({ page_id: id });

  return page;
}

export async function getPageBlocks(
  id: string,
): Promise<BlockObjectResponse[]> {
  const client = getClient();

  const blocks = await collectPaginatedAPI(client.blocks.children.list, {
    block_id: id,
  });

  return blocks as BlockObjectResponse[];
}

export async function getPageIdFromSlug(slug: string) {
  if (!slug) {
    throw new Error("Slug must be truthy");
  }

  // TODO: Use page title in URLs instead of IDs

  return slug;
}

export function getUrlSlugForPage(page: DatabaseObjectResponse) {
  // TODO: Use page title in URLs instead of IDs

  return page.id;
}

export function richTextToUnformattedString(
  components: RichTextItemResponse[],
): string {
  return components.map((component) => component.plain_text).join("");
}
