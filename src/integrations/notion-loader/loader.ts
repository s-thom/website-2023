import { Client, iteratePaginatedAPI } from "@notionhq/client";
import type { QueryDatabaseParameters } from "@notionhq/client/build/src/api-endpoints";
import type { Loader } from "astro/loaders";
import { z } from "astro/zod";
import PQueue from "p-queue";
import { collectPageInfo } from "./api";
import { notionLoaderSchema, propertySchemas } from "./schema";

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

      const pagesQueue = new PQueue();

      // Need to keep track of the order we encounter pages. Since the requesting process
      // is async and done in parallel, things can get out of order.
      const orderedIds: string[] = [];
      const dataMap = new Map<string, Parameters<typeof store.set>[0]>();
      for await (const page of pagesIterable) {
        orderedIds.push(page.id);
        pagesQueue.add(async () => {
          const rawInfo = await collectPageInfo(page.id, logger);
          previousPageIds.delete(page.id);

          const data = await parseData({
            id: page.id,
            data: rawInfo as any,
          });

          dataMap.set(page.id, {
            id: page.id,
            digest: generateDigest({
              lastEdited: rawInfo.page.last_edited_time,
            }),
            data,
          });
        });
      }

      await pagesQueue.onIdle();

      for (const id of orderedIds) {
        store.set(dataMap.get(id)!);
      }

      for (const id of previousPageIds) {
        store.delete(id);
      }
    },
    schema: async () => {
      const database = await client.databases.retrieve({
        database_id: options.databaseId,
      });

      const properties = Object.fromEntries(
        Object.entries(database.properties).map(([key, property]) => {
          let schema: z.ZodType;
          switch (property.type) {
            case "number":
              schema = propertySchemas.number();
              break;
            case "formula":
              schema = propertySchemas.formula();
              break;
            case "select":
              schema = propertySchemas.select();
              break;
            case "multi_select":
              schema = propertySchemas.multiSelect();
              break;
            case "status":
              schema = propertySchemas.status();
              break;
            case "relation":
              schema = propertySchemas.relation();
              break;
            case "rollup":
              schema = propertySchemas.rollup();
              break;
            case "unique_id":
              schema = propertySchemas.uniqueId();
              break;
            case "title":
              schema = propertySchemas.title();
              break;
            case "rich_text":
              schema = propertySchemas.richText();
              break;
            case "url":
              schema = propertySchemas.url();
              break;
            case "people":
              schema = propertySchemas.people();
              break;
            case "files":
              schema = propertySchemas.files();
              break;
            case "email":
              schema = propertySchemas.email();
              break;
            case "phone_number":
              schema = propertySchemas.phoneNumber();
              break;
            case "date":
              schema = propertySchemas.date();
              break;
            case "checkbox":
              schema = propertySchemas.checkbox();
              break;
            case "created_by":
              schema = propertySchemas.createdBy();
              break;
            case "created_time":
              schema = propertySchemas.createdTime();
              break;
            case "last_edited_by":
              schema = propertySchemas.lastEditedBy();
              break;
            case "last_edited_time":
              schema = propertySchemas.lastEditedTime();
              break;
            default:
              throw new Error(
                `Unknown property type ${(property as any).type}`,
              );
          }

          return [key, schema];
        }),
      ) as z.ZodRawShape;

      return notionLoaderSchema.extend({ properties: z.object(properties) });
    },
  };
}
