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

export type BlockMap = Partial<Record<string, BlockInfo>>;

export interface PageInfo<Properties extends object = object> {
  page: PageObjectResponse;
  slug: string;
  properties: Properties;
  blockMap: BlockMap;
}

type ExternalPageIconResponse = {
  type: "external";
  external: {
    url: string;
  };
};
type FilePageIconResponse = {
  type: "file";
  file: {
    url: string;
    expiry_time: string;
  };
};

type ExternalResponse = ExternalPageIconResponse | FilePageIconResponse;

async function saveFileOrExternal(
  id: string,
  fileOrExternal: ExternalResponse,
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
  blockMap: BlockMap,
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
  const { block } = self;

  // Behaviour specific to different block types.
  // Mostly used to deal with images
  if (block.object === "page") {
    // Request cover images and icon
    if (block.cover !== null) {
      void queue.add(() =>
        saveFileOrExternal(
          `${block.id}_cover`,
          block.cover!,
          block.last_edited_time,
          logger,
        ),
      );
    }
    if (block.icon && block.icon.type !== "emoji") {
      void queue.add(() =>
        saveFileOrExternal(
          `${block.id}_icon`,
          block.icon as ExternalResponse,
          block.last_edited_time,
          logger,
        ),
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  } else if (block.object === "block") {
    if (block.type === "image") {
      void queue.add(() =>
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
        void queue.add(() =>
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
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

      blockMap[child.id] = { block: child, children: undefined };

      void queue.add(() =>
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
      (property as never)[property.type],
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
  const blockMap: BlockMap = {};
  // Kick off the traversal with the page
  blockMap[pageId] = { block: page, children: undefined };
  void queue.add(() =>
    processBlock(queue, requester, pageId, blockMap, 0, logger),
  );

  await queue.onIdle();

  return { page, slug, properties, blockMap };
}
