import type { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { BlockMap } from "../../../integrations/notion-loader/api";

export interface BaseBlockComponentProps {
  block: BlockObjectResponse;
  blockMap: BlockMap;
}

export const BLOCK_GROUP_TYPE = "_block-group";

export interface BlockGroup {
  type: typeof BLOCK_GROUP_TYPE;
  blockType: BlockObjectResponse["type"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wrapper: (_props: any) => any;
  items: BlockObjectResponse[];
}
