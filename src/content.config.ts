import { z } from "astro/zod";
import { defineCollection } from "astro:content";
import {
  notionLoader,
  notionLoaderSchema,
  propertySchemas,
} from "./integrations/notion-loader";
import { PAGES_COLLECTION_ID, PROJECTS_COLLECTION_ID } from "./lib/constants";

const pagesLoader = notionLoader({
  token: import.meta.env.NOTION_TOKEN,
  databaseId: PAGES_COLLECTION_ID,
  verboseLogs: true,
  filter: {
    and: [
      { property: "Type", select: { is_not_empty: true } },
      import.meta.env.DEV
        ? { property: "Status", status: { is_not_empty: true } }
        : {
            or: [
              { property: "Status", status: { equals: "Listed" } },
              { property: "Status", status: { equals: "Unlisted" } },
            ],
          },
    ],
  },
});

const projectsLoader = notionLoader({
  token: import.meta.env.NOTION_TOKEN,
  databaseId: PROJECTS_COLLECTION_ID,
  verboseLogs: true,
  filter: {
    and: [{ property: "Visibility", checkbox: { equals: true } }],
  },
});

export const collections = {
  pages: defineCollection({
    loader: pagesLoader,
    schema: notionLoaderSchema.extend({
      properties: z.object({
        Slug: propertySchemas.rich_text(),
        Published: propertySchemas.date(),
        Edited: propertySchemas.date(),
        "Cover Source": propertySchemas.rich_text(),
        Tags: propertySchemas.multi_select(),
        "Page View Stickers": propertySchemas.select(),
        Type: propertySchemas.select(),
        Theme: propertySchemas.select(),
        Status: propertySchemas.status(),
      }),
    }),
  }),
  projects: defineCollection({
    loader: projectsLoader,
    schema: notionLoaderSchema.extend({
      properties: z.object({
        Status: propertySchemas.status(),
        GitHub: propertySchemas.rich_text(),
        URL: propertySchemas.url(),
      }),
    }),
  }),
};
