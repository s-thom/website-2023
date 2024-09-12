import {
  Client,
  isFullDatabase,
  isFullPage,
  iteratePaginatedAPI,
} from "@notionhq/client";
import type {
  PageObjectResponse,
  QueryDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints";
import type { Loader } from "astro/loaders";
import { z } from "astro/zod";
import PQueue from "p-queue";
import { collectPageInfo } from "./api";
import { notionLoaderSchema, propertySchemas } from "./schema";

const INTERNAL_LOADER_VERSION = "2";

export interface NotionLoaderOptions {
  token: string;
  databaseId: string;
  sorts?: QueryDatabaseParameters["sorts"];
  filter?: QueryDatabaseParameters["filter"];
  verboseLogs?: boolean;
}

export function notionLoader(options: NotionLoaderOptions): Loader {
  const client = new Client({ auth: options.token });

  return {
    name: "sthom-notion-loader",
    load: async ({
      collection,
      store,
      logger,
      meta,
      generateDigest,
      parseData,
    }) => {
      const lastLoaderVersion = meta.get("version");
      let forceRefresh = false;
      if (lastLoaderVersion !== INTERNAL_LOADER_VERSION) {
        let reason: string;
        if (lastLoaderVersion === undefined) {
          reason = "empty cache";
        } else {
          reason = "loader update";
        }

        logger.info(`Collection ${collection} needs full sync (${reason})`);
        meta.set("version", INTERNAL_LOADER_VERSION);
        forceRefresh = true;
      }

      const database = await client.databases.retrieve({
        database_id: options.databaseId,
      });
      if (!isFullDatabase(database)) {
        throw new Error(
          `Database ${options.databaseId} for collection ${collection} is not fully accessible by this integration`,
        );
      }

      // Commented out as Notion doesn't update the last updated of the database when you edit a page inside it.
      // This means we still need to iterate over every page.
      // const lastModified = meta.get("last-modified");
      // if (!forceRefresh && database.last_edited_time === lastModified) {
      //   logger.info(
      //     `Collection ${collection} has not been edited since last update, skipping`,
      //   );
      //   return;
      // }

      const pagesIterable = iteratePaginatedAPI(client.databases.query, {
        database_id: options.databaseId,
        filter: options.filter,
        sorts: options.sorts,
      });

      // Pages that get found will be removed from this set, leaving only deleted ones by the end.
      const removePageIds = new Set(store.keys());

      const pagesQueue = new PQueue();

      // Need to keep track of the order we encounter pages. Since the requesting process
      // is async and done in parallel, things can get out of order.
      const orderedIds: string[] = [];
      const unchangedPages: string[] = [];
      const dataMap = new Map<string, Parameters<typeof store.set>[0]>();
      for await (const page of pagesIterable) {
        if (!isFullPage(page)) {
          throw new Error(
            `Page ${page.id} (in database ${options.databaseId}) is not fully accessible by this integration`,
          );
        }

        removePageIds.delete(page.id);
        orderedIds.push(page.id);

        // Get the previously stored page to see if it needs updating
        const previousPageData = store.get(page.id);
        const previousPage = previousPageData
          ? previousPageData.data.page
          : undefined;

        if (
          !forceRefresh &&
          previousPageData !== undefined &&
          typeof previousPage === "object" &&
          previousPage !== null &&
          (previousPage as PageObjectResponse).last_edited_time ===
            page.last_edited_time
        ) {
          // No changes necessary. Sill add to data map to ensure order is correct
          unchangedPages.push(page.id);
          dataMap.set(page.id, previousPageData);
        } else {
          // Need to queue the page update
          pagesQueue.add(async () => {
            const rawInfo = await collectPageInfo(page.id, logger);

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
      }

      await pagesQueue.onIdle();

      if (options.verboseLogs && unchangedPages.length > 0) {
        logger.info(
          `Pages not modified since last update: ${unchangedPages.join(", ")}`,
        );
      }

      for (const id of orderedIds) {
        store.set(dataMap.get(id)!);
      }

      for (const id of removePageIds) {
        store.delete(id);
      }

      meta.set("last-modified", database.last_edited_time);
      logger.info(`Collection ${collection} done!`);
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
