import type { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { BlockInfo } from "./api";

export function getBlockChildren(
  blockId: string,
  blockMap: Record<string, BlockInfo>,
): BlockObjectResponse[] {
  const parentNode = blockMap[blockId];
  if (!parentNode) {
    throw new Error(`Unable to find parent node ${blockId}`);
  }

  const children = parentNode.children
    ? parentNode.children.map((childId) => {
        const node = blockMap[childId];
        if (!node) {
          if (!node) {
            throw new Error(`Unable to find child node ${blockId}`);
          }
        }
        if (node.block.object === "page") {
          throw new Error(`Child node ${blockId} is a page`);
        }

        return node.block;
      })
    : [];

  return children;
}
