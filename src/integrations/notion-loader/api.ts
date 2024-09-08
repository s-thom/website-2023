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

export interface PageInfo {
  page: PageObjectResponse;
  slug: string;
  blockMap: Map<string, BlockInfo>;
}

async function enqueueBlockChildrenInfo(
  queue: PQueue,
  blockId: string,
  blockMap: Map<string, BlockInfo>,
  depth: number,
  logger: AstroIntegrationLogger,
): Promise<void> {
  const self = blockMap.get(blockId);
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

    if (blockMap.has(child.id)) {
      logger.warn(
        `Child ${child.id} of ${blockType} ${blockId} has already been added`,
      );
      continue;
    }

    blockMap.set(child.id, { block: child, children: undefined });

    if (child.has_children && depth < MAX_VISIT_DEPTH) {
      queue.add(() =>
        enqueueBlockChildrenInfo(queue, child.id, blockMap, depth + 1, logger),
      );
    }
  }
}

export async function collectPageInfo(
  pageId: string,
  logger: AstroIntegrationLogger,
): Promise<PageInfo> {
  const page = await getPage(pageId);
  if (!isFullPageOrDatabase(page)) {
    throw new Error(`Could not get full page for ${pageId}`);
  }

  // Save URL mapping
  const slug = PAGE_PATH_PREFIX_OVERRIDES[page.id] ?? getUrlSlugForPage(page);

  const queue = new PQueue();
  const blockMap = new Map<string, BlockInfo>();
  // Kick off the traversal with the page
  blockMap.set(pageId, { block: page as any, children: undefined });
  queue.add(() => enqueueBlockChildrenInfo(queue, pageId, blockMap, 0, logger));

  await queue.onIdle();

  return { page, slug, blockMap };
}
