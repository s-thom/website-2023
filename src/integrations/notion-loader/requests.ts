import {
  APIErrorCode,
  Client,
  collectPaginatedAPI,
  isNotionClientError,
} from "@notionhq/client";
import type {
  BlockObjectResponse,
  DatabaseObjectResponse,
  GetBlockResponse,
  GetPageResponse,
  PageObjectResponse,
  PartialBlockObjectResponse,
  PartialDatabaseObjectResponse,
  PartialPageObjectResponse,
  QueryDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints";
import type { AstroIntegrationLogger } from "astro";
import PQueue from "p-queue";

const NOISY_LOGS = import.meta.env.NOISY_LOGS === "true";

const requestQueue = new PQueue({
  concurrency: 4,
  throwOnTimeout: true,
  interval: 1000,
  intervalCap: 3,
});

function withQueue<Params extends unknown[], Return>(
  fn: (...args: Params) => Promise<Return>,
): (...args: Params) => Promise<Return> {
  function wrapper(...args: Params) {
    return requestQueue.add(() => fn(...args), { throwOnTimeout: true });
  }

  Object.defineProperty(wrapper, "name", { value: `withQueue(${fn.name})` });
  return wrapper;
}

let singletonClient: Client | undefined;

function getClient() {
  if (!singletonClient) {
    singletonClient = new Client({ auth: import.meta.env.NOTION_TOKEN });
  }

  return singletonClient;
}

export interface Requester {
  getBlock: (id: string) => Promise<GetBlockResponse>;
  getPage: (id: string) => Promise<GetPageResponse>;
  getBlockChildren: (
    id: string,
  ) => Promise<(BlockObjectResponse | PartialBlockObjectResponse)[]>;
  queryDatabase: (
    id: string,
    filter: QueryDatabaseParameters["filter"],
    sorts: QueryDatabaseParameters["sorts"],
  ) => Promise<
    (
      | PageObjectResponse
      | PartialPageObjectResponse
      | DatabaseObjectResponse
      | PartialDatabaseObjectResponse
    )[]
  >;
}

export function getRequester(logger: AstroIntegrationLogger): Requester {
  return {
    getBlock: withQueue(async function getBlock(
      id: string,
    ): Promise<GetBlockResponse> {
      if (NOISY_LOGS) {
        logger.info(`Requesting block ${id}`);
      }

      const client = getClient();

      const block = await client.blocks.retrieve({ block_id: id });

      return block;
    }),

    getPage: withQueue(async function getPage(
      id: string,
    ): Promise<GetPageResponse> {
      if (NOISY_LOGS) {
        logger.info(`Requesting page ${id}`);
      }

      const client = getClient();

      const page = await client.pages.retrieve({ page_id: id });

      return page;
    }),

    getBlockChildren: withQueue(async function getBlockChildren(
      id: string,
    ): Promise<(BlockObjectResponse | PartialBlockObjectResponse)[]> {
      if (NOISY_LOGS) {
        logger.info(`Requesting children of ${id}`);
      }

      const client = getClient();

      const blocks = await collectPaginatedAPI(client.blocks.children.list, {
        block_id: id,
      });

      return blocks;
    }),

    queryDatabase: withQueue(async function queryDatabase(
      id: string,
      filter: QueryDatabaseParameters["filter"],
      sorts: QueryDatabaseParameters["sorts"],
    ) {
      if (NOISY_LOGS) {
        logger.info(`Querying database ${id}`);
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
        if (
          isNotionClientError(err) &&
          err.code === APIErrorCode.ObjectNotFound
        ) {
          // This is likely a linked database problem, as the public API doesn't support linked databases
          logger.error(
            `Error querying database ${id}, it is likely a linked database`,
          );
          return [];
        }

        logger.error(`Error querying database ${id}, unknown cause`);
        throw err;
      }
    }),
    // getPageProperties: withQueue(async function getPageProperties(
    //   id: string,
    //   filter: QueryDatabaseParameters["filter"],
    //   sorts: QueryDatabaseParameters["sorts"],
    // ) {
    //   if (NOISY_LOGS) {
    //     logger.info(`Ruerying database ${id}`);
    //   }

    //   const client = getClient();

    //   const results = await collectPaginatedAPI(client.databases.query, {
    //     database_id: id,
    //     filter,
    //     sorts,
    //   });

    //   return results;
    // }),
  };
}
