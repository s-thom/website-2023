import type { AstroIntegrationLogger } from "astro";
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

export async function getAndWriteEmbeddings(
  pages: Page<object>[],
  filePath: URL,
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
  return relations;
}
