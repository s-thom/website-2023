import type { AstroIntegration, AstroIntegrationLogger } from "astro";
import type { DataEntryMap, InferEntrySchema } from "astro:content";
import { writeFile } from "node:fs/promises";
import { getNotionPagesPlainText } from "./astroContent";
import { getRelatedPosts } from "./similarity";

export interface SthomRelatedPostsOptions<C extends keyof DataEntryMap> {
  collection: C;
  label?: string;
  filter?: (entry: InferEntrySchema<C>) => boolean;
}

export function sthomRelatedPosts<CollectionName extends keyof DataEntryMap>({
  collection,
  label = collection,
  filter = () => true,
}: SthomRelatedPostsOptions<CollectionName>): AstroIntegration {
  const fileName = `${label}.json`;

  let filePath: URL;

  async function getAndWriteEmbeddings(logger: AstroIntegrationLogger) {
    logger.info(`Getting pages from the ${collection} collection`);
    const posts = await getNotionPagesPlainText(collection, filter);
    logger.info("Finding similar pages");
    const relations = await getRelatedPosts(posts);

    await writeFile(filePath, JSON.stringify(relations), "utf-8");
    logger.info(
      `Populated ${fileName} file with ${Object.keys(relations).length} entries`,
    );
  }

  return {
    name: "sthom-related-posts",
    hooks: {
      "astro:config:setup": async ({ createCodegenDir, logger }) => {
        const dir = createCodegenDir();
        filePath = new URL(fileName, dir);

        await writeFile(filePath, "{}", "utf-8");
        logger.info(`Created ${fileName} file`);
      },
      "astro:build:start": async ({ logger }) => {
        await getAndWriteEmbeddings(logger);
      },
      "astro:server:setup": async ({ logger }) => {
        await getAndWriteEmbeddings(logger);
      },
    },
  };
}
