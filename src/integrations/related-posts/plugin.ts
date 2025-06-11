import type { AstroIntegration, AstroIntegrationLogger } from "astro";
import type { DataEntryMap, InferEntrySchema } from "astro:content";
import { writeFile } from "node:fs/promises";
import remarkStringify from "remark-stringify";
import strip from "strip-markdown";
import { unified } from "unified";
import { notionToRemark } from "../../lib/unified/notionToRemark";
import { remarkCodeOverrides } from "../../lib/unified/remarkCodeOverrides";
import type { Page } from "../notion-loader/loader";
import { getRelatedPosts } from "./similarity";

const processor = unified()
  .use(remarkCodeOverrides, { mappers: { default: () => [] } }) // Remove all code blocks
  .use(strip)
  .use(remarkStringify);

async function pageToPlainText(page: Page<object>) {
  const tree = notionToRemark(page.id, page.data.blockMap);
  const processedTree = await processor.run(tree);
  const stringContent = processor.stringify(processedTree);

  return stringContent;
}

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

  async function getAndWriteEmbeddings(
    pages: Page<object>[],
    logger: AstroIntegrationLogger,
  ) {
    logger.info("Getting content of pages");
    const posts = await Promise.all(
      pages.map(async (page) => ({
        id: page.id,
        content: await pageToPlainText(page),
      })),
    );

    logger.info("Finding similar pages");
    const relations = await getRelatedPosts(posts);

    await writeFile(filePath, JSON.stringify(relations), "utf-8");
    logger.info(
      `Populated ${fileName} file with ${Object.keys(relations).length} entries`,
    );
  }

  return {
    name: `sthom-related-posts`,
    hooks: {
      "astro:config:setup": async ({ createCodegenDir }) => {
        const dir = createCodegenDir();
        filePath = new URL(fileName, dir);
      },
      "sthom-notion-loader:loaded": async ({
        logger,
        collection: c2,
        pages,
      }) => {
        if (c2 === collection) {
          const filtered = pages.filter((page) => filter(page.data as any));
          if (filtered.length === 0) {
            return;
          }

          await getAndWriteEmbeddings(filtered, logger);
        }
      },
    },
  };
}
