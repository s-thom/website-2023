import type { AstroIntegration } from "astro";
import type { DataEntryMap, InferEntrySchema } from "astro:content";
import { getAndWriteEmbeddings } from "./content";

export interface SthomRelatedPostsOptions<C extends keyof DataEntryMap> {
  collection: C;
  label?: string;
  filter?: (entry: InferEntrySchema<C>) => boolean;
}

export default function sthomRelatedPosts<
  CollectionName extends keyof DataEntryMap,
>({
  collection,
  label = collection,
  filter = () => true,
}: SthomRelatedPostsOptions<CollectionName>): AstroIntegration {
  const fileName = `${label}.json`;
  let filePath: URL;

  return {
    name: `sthom-related-posts`,
    hooks: {
      "astro:config:setup": ({ createCodegenDir }) => {
        const dir = createCodegenDir();
        filePath = new URL(fileName, dir);
      },
      "sthom-notion-loader:loaded": async ({
        logger,
        collection: c2,
        pages,
      }) => {
        if (c2 === collection) {
          const filtered = pages.filter((page) => filter(page.data as never));
          if (filtered.length === 0) {
            return;
          }

          const relations = await getAndWriteEmbeddings(
            filtered,
            filePath,
            logger,
          );
          logger.info(
            `Populated ${fileName} file with ${Object.keys(relations).length} entries`,
          );
        }
      },
    },
  };
}
