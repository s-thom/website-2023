import { defineCollection, z } from "astro:content";
import {
  notionLoader,
  notionLoaderSchema,
  propertySchemas,
} from "../integrations/notion-loader";
import { PAGES_COLLECTION_ID, PROJECTS_COLLECTION_ID } from "../lib/constants";

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
  sorts: [
    { property: "Status", direction: "descending" },
    { property: "Published", direction: "descending" },
    { property: "Last edited time", direction: "descending" },
    { property: "Created", direction: "descending" },
  ],
});

const projectsLoader = notionLoader({
  token: import.meta.env.NOTION_TOKEN,
  databaseId: PROJECTS_COLLECTION_ID,
  verboseLogs: true,
  filter: {
    and: [{ property: "Visibility", checkbox: { equals: true } }],
  },
  sorts: [
    { property: "Status", direction: "ascending" },
    { property: "Sorting", direction: "descending" },
  ],
});

export const collections = {
  pages: defineCollection({
    loader: pagesLoader,
    schema: notionLoaderSchema.extend({
      properties: z.object({
        Slug: propertySchemas.richText(),
        Published: propertySchemas.date(),
        Edited: propertySchemas.date(),
        "Cover Source": propertySchemas.richText(),
        Tags: propertySchemas.multiSelect(),
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
        GitHub: propertySchemas.richText(),
        URL: propertySchemas.url(),
      }),
    }),
  }),
};
