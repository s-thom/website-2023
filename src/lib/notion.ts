import { collectPaginatedAPI } from "@notionhq/client";
import type { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
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

  return queryResponse;
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
