import type { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { BlockInfo } from "../../../integrations/notion-loader/api";

export interface BaseBlockComponentProps {
  block: BlockObjectResponse;
  blockMap: Record<string, BlockInfo>;
}
