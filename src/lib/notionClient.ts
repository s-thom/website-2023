import { Client } from "@notionhq/client";

let singletonClient: Client;

export function getClient() {
  if (!singletonClient) {
    singletonClient = new Client({ auth: import.meta.env.NOTION_TOKEN });
  }

  return singletonClient;
}
