import {
  APIErrorCode,
  Client,
  collectPaginatedAPI,
  isNotionClientError,
} from "@notionhq/client";
import type {
  BlockObjectResponse,
  GetBlockResponse,
  GetPageResponse,
  PartialBlockObjectResponse,
  QueryDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints";
import PQueue from "p-queue";
import { NOISY_LOGS } from "../constants";

const requestQueue = new PQueue({
  concurrency: 4,
  throwOnTimeout: true,
  interval: 1000,
  intervalCap: 3,
});

function withQueue<Params extends unknown[], Return>(
  fn: (...args: Params) => Return,
): (...args: Params) => Promise<Return> {
  function wrapper(...args: Params) {
    return requestQueue.add(() => fn(...args), { throwOnTimeout: true });
  }

  Object.defineProperty(wrapper, "name", { value: `withQueue(${fn.name})` });
  return wrapper;
}

let singletonClient: Client;

export function getClient() {
  if (!singletonClient) {
    singletonClient = new Client({ auth: import.meta.env.NOTION_TOKEN });
  }

  return singletonClient;
}

export const getBlock = withQueue(async function getBlock(
  id: string,
): Promise<GetBlockResponse> {
  if (NOISY_LOGS) {
    // eslint-disable-next-line no-console
    console.log(`[Notion] requesting block ${id}`);
  }

  const client = getClient();

  const block = await client.blocks.retrieve({ block_id: id });

  return block;
});

export const getPage = withQueue(async function getPage(
  id: string,
): Promise<GetPageResponse> {
  if (NOISY_LOGS) {
    // eslint-disable-next-line no-console
    console.log(`[Notion] requesting page ${id}`);
  }

  const client = getClient();

  const page = await client.pages.retrieve({ page_id: id });

  return page;
});

export const getBlockChildren = withQueue(async function getBlockChildren(
  id: string,
): Promise<(BlockObjectResponse | PartialBlockObjectResponse)[]> {
  if (NOISY_LOGS) {
    // eslint-disable-next-line no-console
    console.log(`[Notion] requesting children of ${id}`);
  }

  const client = getClient();

  const blocks = await collectPaginatedAPI(client.blocks.children.list, {
    block_id: id,
  });

  return blocks;
});

export const queryDatabase = withQueue(async function queryDatabase(
  id: string,
  filter: QueryDatabaseParameters["filter"],
  sorts: QueryDatabaseParameters["sorts"],
) {
  if (NOISY_LOGS) {
    // eslint-disable-next-line no-console
    console.log(`[Notion] querying database ${id}`);
  }

  const client = getClient();

  try {
    const results = await collectPaginatedAPI(client.databases.query, {
      database_id: id,
      filter,
      sorts,
    });

    return results;
  } catch (err) {
    if (isNotionClientError(err) && err.code === APIErrorCode.ObjectNotFound) {
      // This is likely a linked database problem, as the public API doesn't support linked databases
      // eslint-disable-next-line no-console
      console.error(
        `[Notion] error querying database ${id}, it is likely a linked database`,
      );
      return [];
    }
    // eslint-disable-next-line no-console
    console.error(`[Notion] error querying database ${id}, unknown cause`);
    throw err;
  }
});

// export const getPageProperties = withQueue(async function getPageProperties(
//   id: string,
//   filter: QueryDatabaseParameters["filter"],
//   sorts: QueryDatabaseParameters["sorts"],
// ) {
//   if (NOISY_LOGS) {
//     // eslint-disable-next-line no-console
//     console.log(`[Notion] querying database ${id}`);
//   }

//   const client = getClient();

//   const results = await collectPaginatedAPI(client.databases.query, {
//     database_id: id,
//     filter,
//     sorts,
//   });

//   return results;
// });
