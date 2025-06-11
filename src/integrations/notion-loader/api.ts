import { isFullBlock, isFullPageOrDatabase } from "@notionhq/client";
import type {
  BlockObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { AstroIntegrationLogger } from "astro";
import PQueue from "p-queue";
import { PAGE_PATH_PREFIX_OVERRIDES } from "../../lib/constants";
import { getUrlSlugForPage } from "../../lib/notion/titles";
import { saveImage } from "./images";
import { getRequester, type Requester } from "./requests";

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

async function saveFileOrExternal(
  id: string,
  fileOrExternal: NonNullable<PageObjectResponse["cover"]>,
  key: string,
  logger: AstroIntegrationLogger | undefined,
): Promise<void> {
  const url =
    fileOrExternal.type === "file"
      ? fileOrExternal.file.url
      : fileOrExternal.external.url;

  return saveImage({
    id,
    url,
    key,
    logger,
  });
}

async function processBlock(
  queue: PQueue,
  requester: Requester,
  blockId: string,
  blockMap: Record<string, BlockInfo>,
  depth: number,
  logger: AstroIntegrationLogger,
): Promise<void> {
  const self = blockMap[blockId];
  const { block } = self;
  if (!self) {
    logger.error(
      `Trying to add children for block that doesn't exist: ${blockId}`,
    );
    throw new Error(
      `Trying to add children for block that doesn't exist: ${blockId}`,
    );
  }

  // Behaviour specific to different block types.
  // Mostly used to deal with images
  if (block.object === "page") {
    // Request cover images and icon
    if (block.cover !== null) {
      queue.add(() =>
        saveFileOrExternal(
          `${block.id}_cover`,
          block.cover as any,
          block.last_edited_time,
          logger,
        ),
      );
    }
    if (block.icon && block.icon.type !== "emoji") {
      queue.add(() =>
        saveFileOrExternal(
          `${block.id}_icon`,
          block.icon as any,
          block.last_edited_time,
          logger,
        ),
      );
    }
  } else if (block.object === "block") {
    if (block.type === "image") {
      queue.add(() =>
        saveFileOrExternal(
          block.id,
          block.image,
          block.last_edited_time,
          logger,
        ),
      );
    } else if (block.type === "callout") {
      const { icon } = block.callout;
      if (icon && (icon.type === "file" || icon.type === "external")) {
        queue.add(() =>
          saveFileOrExternal(
            `${block.id}_icon`,
            icon,
            block.last_edited_time,
            logger,
          ),
        );
      }
    }
  }

  // Process children
  if (
    (block.object === "page" ||
      (block.object === "block" && block.has_children)) &&
    depth < MAX_VISIT_DEPTH
  ) {
    const children = await requester.getBlockChildren(blockId);
    if (children.length > 0) {
      self.children = [];
    }
    for (const child of children) {
      const blockType = block.object === "block" ? block.type : "page";
      if (!isFullBlock(child)) {
        logger.warn(
          `Encountered partial child ${child.id} of ${blockType} ${blockId}`,
        );
        continue;
      }

      self.children!.push(child.id);

      if (blockMap[child.id]) {
        logger.warn(
          `Child ${child.id} of ${blockType} ${blockId} has already been added`,
        );
        continue;
      }

      // eslint-disable-next-line no-param-reassign
      blockMap[child.id] = { block: child, children: undefined };

      queue.add(() =>
        processBlock(queue, requester, child.id, blockMap, depth + 1, logger),
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
  const requester = getRequester(logger);

  const page = await requester.getPage(pageId);
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
  queue.add(() => processBlock(queue, requester, pageId, blockMap, 0, logger));

  await queue.onIdle();

  return { page, slug, properties, blockMap };
}
