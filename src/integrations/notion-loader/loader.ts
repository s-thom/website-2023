import { Client, iteratePaginatedAPI } from "@notionhq/client";
import type { QueryDatabaseParameters } from "@notionhq/client/build/src/api-endpoints";
import type { Loader } from "astro/loaders";
import { collectPageInfo } from "./api";
import { pageDataSchema } from "./schema";

export const notionLoaderSchema = pageDataSchema;

export interface NotionLoaderOptions {
  token: string;
  databaseId: string;
  sorts?: QueryDatabaseParameters["sorts"];
  filter?: QueryDatabaseParameters["filter"];
}

export function notionLoader(options: NotionLoaderOptions): Loader {
  const client = new Client({ auth: options.token });

  return {
    name: "sthom-notion-loader",
    load: async ({ store, logger, generateDigest, parseData }) => {
      const pagesIterable = iteratePaginatedAPI(client.databases.query, {
        database_id: options.databaseId,
        filter: options.filter,
        sorts: options.sorts,
      });

      // Pages that get found will be removed from this set, leaving only deleted ones by the end.
      const previousPageIds = new Set(store.keys());

      for await (const page of pagesIterable) {
        const rawInfo = await collectPageInfo(page.id, logger);
        previousPageIds.delete(page.id);

        const data = await parseData({
          id: page.id,
          data: rawInfo as any,
        });

        store.set({
          id: page.id,
          digest: generateDigest({ lastEdited: rawInfo.page.last_edited_time }),
          data,
        });
      }

      for (const id of previousPageIds) {
        store.delete(id);
      }
    },
    schema: async () => pageDataSchema,
  };
}
