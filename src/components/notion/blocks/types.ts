import type { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export interface NotionOverrideableProps {
  overrides: { [type in BlockObjectResponse["type"]]?: any };
}
