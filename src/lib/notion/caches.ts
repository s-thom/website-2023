import { isFullBlock, isFullPageOrDatabase } from "@notionhq/client";
import type {
  BlockObjectResponse,
  PageObjectResponse,
  QueryDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints";
import isDeepEqual from "fast-deep-equal";
import { join } from "node:path/posix";
import PQueue from "p-queue";
import {
  IGNORE_FROM_ALL,
  NOISY_LOGS,
  PAGE_PATH_PREFIX_INVERSE_OVERRIDES,
  PAGE_PATH_PREFIX_OVERRIDES,
  ROOT_PAGE_ID,
} from "../constants";
import {
  getBlock as baseGetBlock,
  getBlockChildren as baseGetBlockChildren,
  getPage as baseGetPage,
  queryDatabase as baseQueryDatabase,
} from "./requests";
import { getUrlSlugForPage } from "./titles";
import { isPageListed, isPagePublished } from "./util";

let allPagesPromise: Promise<PageObjectResponse[]> | undefined;

type QueryResponseValue = Awaited<ReturnType<typeof baseQueryDatabase>>;

const BLOCK_CACHE = new Map<string, Promise<BlockObjectResponse>>();
const PAGE_CACHE = new Map<string, Promise<PageObjectResponse>>();
const CHILDREN_CACHE = new Map<string, Promise<BlockObjectResponse[]>>();
const QUERY_CACHE = new Map<
  string,
  { key: any; promise: Promise<QueryResponseValue> }[]
>();

export interface BasicPageInfo {
  id: string;
  slug: string;
  path: string;
  isPublished: boolean;
  isListed: boolean;
}

const PAGE_ID_TO_SLUG = new Map<string, BasicPageInfo>();

export function getBlock(id: string): Promise<BlockObjectResponse> {
  const cached = BLOCK_CACHE.get(id);
  if (cached) {
    return cached;
  }

  const promise = (async () => {
    const block = await baseGetBlock(id);
    if (!isFullBlock(block)) {
      throw new Error(`Could not get full block for ${id}`);
    }
    return block;
  })();

  BLOCK_CACHE.set(id, promise);
  return promise;
}

export function getPage(id: string): Promise<PageObjectResponse> {
  const cached = PAGE_CACHE.get(id);
  if (cached) {
    return cached;
  }

  const promise = (async () => {
    const page = await baseGetPage(id);
    if (!isFullPageOrDatabase(page)) {
      throw new Error(`Could not get full page for ${id}`);
    }
    return page;
  })();

  PAGE_CACHE.set(id, promise);
  return promise;
}

export function getBlockChildren(id: string): Promise<BlockObjectResponse[]> {
  const cached = CHILDREN_CACHE.get(id);
  if (cached) {
    return cached;
  }

  const promise = (async () => {
    const children = await baseGetBlockChildren(id);
    // eslint-disable-next-line no-restricted-syntax
    for (const child of children) {
      if (!isFullBlock(child)) {
        // eslint-disable-next-line no-console
        console.warn(`child ${child.id} is not a full block`);
        continue;
      }

      if (!BLOCK_CACHE.has(child.id)) {
        BLOCK_CACHE.set(child.id, Promise.resolve(child));
      }
    }

    return children as BlockObjectResponse[];
  })();

  CHILDREN_CACHE.set(id, promise);
  return promise;
}

export function queryDatabase(
  id: string,
  filter: QueryDatabaseParameters["filter"],
  sorts: QueryDatabaseParameters["sorts"],
): Promise<QueryResponseValue> {
  let cachedQueries = QUERY_CACHE.get(id);
  if (!cachedQueries) {
    cachedQueries = [];
    QUERY_CACHE.set(id, cachedQueries);
  }

  const key = { id, filter, sorts };
  // eslint-disable-next-line no-restricted-syntax
  for (const entry of cachedQueries) {
    if (isDeepEqual(key, entry.key)) {
      return entry.promise;
    }
  }

  const promise = (async () => {
    return baseQueryDatabase(id, filter, sorts);
  })();

  cachedQueries.push({ key, promise });

  QUERY_CACHE.set(id, cachedQueries);
  return promise;
}

async function getAllPagesInner(root: string): Promise<PageObjectResponse[]> {
  // These are used for both pages and databases
  const allPagesQueue = new PQueue({ concurrency: 4 });
  const processed = new Set<string>();

  IGNORE_FROM_ALL.forEach((ignored) => processed.add(ignored));

  function enqueuePage(id: string, parentPath: string) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    allPagesQueue.add(() => processPage(id, parentPath), {
      throwOnTimeout: true,
    });
  }

  function enqueueDatabase(id: string, parentPath: string) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    allPagesQueue.add(() => processDatabase(id, parentPath), {
      throwOnTimeout: true,
    });
  }

  async function processPage(id: string, parentPath: string) {
    // Ensure we don't have duplicates running
    if (processed.has(id)) {
      return;
    }
    // And prevent any new duplicates
    processed.add(id);

    // Ensure page is in cache
    const page = await getPage(id);

    // Save URL mapping
    const slug = getUrlSlugForPage(page);
    const path = PAGE_PATH_PREFIX_OVERRIDES[id] ?? join(parentPath, slug);
    PAGE_ID_TO_SLUG.set(id, {
      id,
      slug,
      path,
      isPublished: isPagePublished(page),
      isListed: isPageListed(page),
    });

    const children = await getBlockChildren(id);
    const directChildPages = children.filter(
      (child) => child.type === "child_page" || child.type === "link_to_page",
    );
    directChildPages.forEach((child) => enqueuePage(child.id, path));

    const databases = children.filter(
      (child) => child.type === "child_database",
    );
    databases.forEach((database) => enqueueDatabase(database.id, path));
  }

  async function processDatabase(id: string, parentPath: string) {
    // Ensure we don't have duplicates running
    if (processed.has(id)) {
      return;
    }
    // And prevent any new duplicates
    processed.add(id);

    const path = PAGE_PATH_PREFIX_OVERRIDES[id] ?? parentPath;

    const results = await queryDatabase(id, undefined, undefined);
    results.forEach((result) => enqueuePage(result.id, path));
  }

  // Start everything off
  enqueuePage(root, "/");
  await allPagesQueue.onIdle();

  // Post-processing
  // At this point we can expect that all relevant pages have been cached.

  // Cache the URL slug mappings
  // eslint-disable-next-line no-restricted-syntax
  const pagePromises = Array.from(PAGE_CACHE.values());
  const pagesOrNot = await Promise.all(
    pagePromises.map((pagePromise) => pagePromise.catch(() => undefined)),
  );

  const pages = pagesOrNot.filter((page): page is PageObjectResponse => !!page);
  return pages;
}

export async function getAllPages(): Promise<PageObjectResponse[]> {
  if (!allPagesPromise) {
    allPagesPromise = getAllPagesInner(ROOT_PAGE_ID);

    if (NOISY_LOGS) {
      allPagesPromise.then(() => {
        // eslint-disable-next-line no-console
        console.log(
          `[Notion] All pages paths:\n${Array.from(PAGE_ID_TO_SLUG.values())
            .map((info) => `    ${info.id}: ${info.path}`)
            .join("\n")}`,
        );
      });
    }
  }

  return allPagesPromise;
}

export async function getPageIdFromPath(path: string) {
  await getAllPages();

  if (PAGE_PATH_PREFIX_INVERSE_OVERRIDES[path]) {
    return PAGE_PATH_PREFIX_INVERSE_OVERRIDES[path];
  }

  const possibleIds: string[] = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const [id, info] of PAGE_ID_TO_SLUG) {
    if (info.path === path) {
      possibleIds.push(id);
    }
  }

  if (possibleIds.length === 0) {
    throw new Error(`Unknown path ${path}`);
  } else if (possibleIds.length > 1) {
    possibleIds.sort();

    // eslint-disable-next-line no-console
    console.warn(
      `[Notion] WARNING: Multiple pages have path ${path} (${possibleIds.join(
        ", ",
      )}). Using first ID`,
    );
  }

  return possibleIds[0];
}

/** @deprecated Migrate towards {@link getPageIdFromPath} instead */
export async function getPageIdFromSlug(slug: string) {
  await getAllPages();

  const possibleIds: string[] = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const [id, info] of PAGE_ID_TO_SLUG) {
    if (info.slug === slug) {
      possibleIds.push(id);
    }
  }

  if (possibleIds.length === 0) {
    throw new Error(`Unknown slug ${slug}`);
  } else if (possibleIds.length > 1) {
    possibleIds.sort();

    // eslint-disable-next-line no-console
    console.warn(
      `[Notion] Multiple pages have slug ${slug} (${possibleIds.join(
        ", ",
      )}). Using first ID`,
    );
  }

  return possibleIds[0];
}

export async function getInfoForPage(id: string) {
  await getAllPages();

  const info = PAGE_ID_TO_SLUG.get(id);
  if (!info) {
    throw new Error(`URLs for page ${id} not found`);
  }

  return info;
}
