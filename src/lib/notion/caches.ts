import { isFullBlock, isFullPageOrDatabase } from "@notionhq/client";
import type {
  BlockObjectResponse,
  PageObjectResponse,
  QueryDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints";
import isDeepEqual from "fast-deep-equal";
import PQueue from "p-queue";
import { IGNORE_FROM_ALL, ROOT_PAGE_ID } from "../constants";
import {
  getBlock as baseGetBlock,
  getBlockChildren as baseGetBlockChildren,
  getPage as baseGetPage,
  queryDatabase as baseQueryDatabase,
} from "./requests";
import { getUrlSlugForPage } from "./titles";

// eslint-disable-next-line prefer-const
let hasRequestedAllPages = false;

type QueryResponseValue = Awaited<ReturnType<typeof baseQueryDatabase>>;

const BLOCK_CACHE = new Map<string, Promise<BlockObjectResponse>>();
const PAGE_CACHE = new Map<string, Promise<PageObjectResponse>>();
const CHILDREN_CACHE = new Map<string, Promise<BlockObjectResponse[]>>();
const QUERY_CACHE = new Map<
  string,
  { key: any; promise: Promise<QueryResponseValue> }[]
>();

const PAGE_ID_TO_SLUG = new Map<string, string>();
const SLUG_TO_PAGE_ID = new Map<string, string>();

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

export async function getAllPages(root: string): Promise<PageObjectResponse[]> {
  // These are used for both pages and databases
  const allPagesQueue = new PQueue({ concurrency: 4 });
  const processed = new Set<string>();

  IGNORE_FROM_ALL.forEach((ignored) => processed.add(ignored));

  function enqueuePage(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    allPagesQueue.add(() => processPage(id), { throwOnTimeout: true });
  }

  function enqueueDatabase(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    allPagesQueue.add(() => processDatabase(id), { throwOnTimeout: true });
  }

  async function processPage(id: string) {
    // Ensure we don't have duplicates running
    if (processed.has(id)) {
      return;
    }
    // And prevent any new duplicates
    processed.add(id);

    // Ensure page is in cache
    await getPage(id);

    const children = await getBlockChildren(id);
    const directChildPages = children.filter(
      (child) => child.type === "child_page" || child.type === "link_to_page",
    );
    directChildPages.forEach((child) => enqueuePage(child.id));

    const databases = children.filter(
      (child) => child.type === "child_database",
    );
    databases.forEach((database) => enqueueDatabase(database.id));
  }

  async function processDatabase(id: string) {
    // Ensure we don't have duplicates running
    if (processed.has(id)) {
      return;
    }
    // And prevent any new duplicates
    processed.add(id);

    const results = await queryDatabase(id, undefined, undefined);
    results.forEach((result) => enqueuePage(result.id));
  }

  if (!hasRequestedAllPages) {
    // Start everything off
    enqueuePage(root);
    await allPagesQueue.onIdle();
  }

  // Post-processing
  // At this point we can expect that all relevant pages have been cached.

  // Cache the URL slug mappings
  // eslint-disable-next-line no-restricted-syntax
  const pagePromises = Array.from(PAGE_CACHE.values());
  const pagesOrNot = await Promise.all(
    pagePromises.map((pagePromise) =>
      pagePromise.then(
        (page) => {
          const slug = getUrlSlugForPage(page);

          PAGE_ID_TO_SLUG.set(page.id, slug);
          SLUG_TO_PAGE_ID.set(slug, page.id);

          return page;
        },
        () => undefined,
      ),
    ),
  );

  const pages = pagesOrNot.filter((page): page is PageObjectResponse => !!page);
  return pages;
}

export async function getPageIdFromSlug(slug: string) {
  if (!hasRequestedAllPages) {
    await getAllPages(ROOT_PAGE_ID);
  }

  const pageId = SLUG_TO_PAGE_ID.get(slug);
  if (pageId === undefined) {
    throw new Error(`Unknown slug ${slug}`);
  }

  return pageId;
}
