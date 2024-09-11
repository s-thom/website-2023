import type { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { BlockInfo } from "../../../integrations/notion-loader/api";

export interface NotionOverrideableProps {
  block: BlockObjectResponse;
  overrides: { [type in BlockObjectResponse["type"]]?: any };
  blockMap: Record<string, BlockInfo>;
}
