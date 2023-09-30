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

export async function getPageBlocks(
  id: string,
): Promise<BlockObjectResponse[]> {
  const client = getClient();

  const blocks = await collectPaginatedAPI(client.blocks.children.list, {
    block_id: id,
  });

  return blocks as BlockObjectResponse[];
}

export function getUrlSlugForPage(page: DatabaseObjectResponse) {
  return page.id;
}

export function richTextToUnformattedString(
  components: RichTextItemResponse[],
): string {
  return components.map((component) => component.plain_text).join("");
}
