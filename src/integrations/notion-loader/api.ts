import { isFullBlock, isFullPageOrDatabase } from "@notionhq/client";
import type {
  BlockObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { AstroIntegrationLogger } from "astro";
import PQueue from "p-queue";
import { PAGE_PATH_PREFIX_OVERRIDES } from "../../lib/constants";
import { getBlockChildren, getPage } from "../../lib/notion/requests";
import { getUrlSlugForPage } from "../../lib/notion/titles";

const MAX_VISIT_DEPTH = 10;

export interface BlockInfo {
  block: BlockObjectResponse | PageObjectResponse;
  children?: string[];
}

export interface PageInfo<Properties extends object = object> {
  page: PageObjectResponse;
  slug: string;
  properties: Properties;
  blockMap: Record<string, BlockInfo>;
}

async function enqueueBlockChildrenInfo(
  queue: PQueue,
  blockId: string,
  blockMap: Record<string, BlockInfo>,
  depth: number,
  logger: AstroIntegrationLogger,
): Promise<void> {
  const self = blockMap[blockId];
  if (!self) {
    logger.error(
      `Trying to add children for block that doesn't exist: ${blockId}`,
    );
    throw new Error(
      `Trying to add children for block that doesn't exist: ${blockId}`,
    );
  }
  const children = await getBlockChildren(blockId);
  self.children = [];
  for (const child of children) {
    const blockType = self.block.object === "block" ? self.block.type : "page";
    if (!isFullBlock(child)) {
      logger.warn(
        `Encountered partial child ${child.id} of ${blockType} ${blockId}`,
      );
      continue;
    }

    self.children.push(child.id);

    if (blockMap[child.id]) {
      logger.warn(
        `Child ${child.id} of ${blockType} ${blockId} has already been added`,
      );
      continue;
    }

    // eslint-disable-next-line no-param-reassign
    blockMap[child.id] = { block: child, children: undefined };

    if (child.has_children && depth < MAX_VISIT_DEPTH) {
      queue.add(() =>
        enqueueBlockChildrenInfo(queue, child.id, blockMap, depth + 1, logger),
      );
    }
  }
}

function mapProperties(
  properties: PageObjectResponse["properties"],
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(properties).map(([key, property]) => [
      key,
      (property as any)[property.type],
    ]),
  );
}

export async function collectPageInfo(
  pageId: string,
  logger: AstroIntegrationLogger,
): Promise<PageInfo> {
  const page = await getPage(pageId);
  if (!isFullPageOrDatabase(page)) {
    throw new Error(`Could not get full page for ${pageId}`);
  }

  const properties = mapProperties(page.properties);
  // Save URL mapping
  const slug = PAGE_PATH_PREFIX_OVERRIDES[page.id] ?? getUrlSlugForPage(page);

  const queue = new PQueue();
  const blockMap: Record<string, BlockInfo> = {};
  // Kick off the traversal with the page
  blockMap[pageId] = { block: page, children: undefined };
  queue.add(() => enqueueBlockChildrenInfo(queue, pageId, blockMap, 0, logger));

  await queue.onIdle();

  return { page, slug, properties, blockMap };
}
