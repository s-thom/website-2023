import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";
import type { BlockInfo } from "../../integrations/notion-loader/api";
import { getPageTitleComponents } from "./titles";

function flummoxWord(str: string): string {
  return str.replace(/./g, "x");
}

function flummoxRichText(
  components: RichTextItemResponse | RichTextItemResponse[],
): RichTextItemResponse[] {
  const asArray = Array.isArray(components) ? components : [components];

  return asArray.map((component) => {
    if (component.type !== "text") {
      return component;
    }

    const words = component.plain_text.split(" ");
    const flummoxedWords = words.map((word) => flummoxWord(word));
    const flummoxedText = flummoxedWords.join(" ");

    return {
      ...component,
      text: {
        ...component.text,
        content: flummoxedText,
      },
      plain_text: flummoxedText,
    };
  });
}

function flummoxBlock(blockId: string, blockInfo: BlockInfo): BlockInfo {
  if (blockInfo.block.object === "page") {
    const titleComponents = getPageTitleComponents(blockInfo.block);

    return {
      ...blockInfo,
      block: {
        ...blockInfo.block,
        properties: {
          ...blockInfo.block.properties,
          title: {
            type: "rich_text",
            rich_text: flummoxRichText(titleComponents),
            id: "title",
          },
        },
      },
    };
  }

  switch (blockInfo.block.type) {
    case "paragraph":
      return {
        ...blockInfo,
        block: {
          ...blockInfo.block,
          paragraph: {
            ...blockInfo.block.paragraph,
            rich_text: flummoxRichText(blockInfo.block.paragraph.rich_text),
          },
        },
      };
    case "heading_1":
      return {
        ...blockInfo,
        block: {
          ...blockInfo.block,
          heading_1: {
            ...blockInfo.block.heading_1,
            rich_text: flummoxRichText(blockInfo.block.heading_1.rich_text),
          },
        },
      };
    case "heading_2":
      return {
        ...blockInfo,
        block: {
          ...blockInfo.block,
          heading_2: {
            ...blockInfo.block.heading_2,
            rich_text: flummoxRichText(blockInfo.block.heading_2.rich_text),
          },
        },
      };
    case "heading_3":
      return {
        ...blockInfo,
        block: {
          ...blockInfo.block,
          heading_3: {
            ...blockInfo.block.heading_3,
            rich_text: flummoxRichText(blockInfo.block.heading_3.rich_text),
          },
        },
      };
    case "callout":
      return {
        ...blockInfo,
        block: {
          ...blockInfo.block,
          callout: {
            ...blockInfo.block.callout,
            rich_text: flummoxRichText(blockInfo.block.callout.rich_text),
          },
        },
      };
    case "code":
      // Don't bother with code.
      return blockInfo;
    case "toggle":
      return {
        ...blockInfo,
        block: {
          ...blockInfo.block,
          toggle: {
            ...blockInfo.block.toggle,
            rich_text: flummoxRichText(blockInfo.block.toggle.rich_text),
          },
        },
      };
    case "bulleted_list_item":
      return {
        ...blockInfo,
        block: {
          ...blockInfo.block,
          bulleted_list_item: {
            ...blockInfo.block.bulleted_list_item,
            rich_text: flummoxRichText(
              blockInfo.block.bulleted_list_item.rich_text,
            ),
          },
        },
      };
    case "numbered_list_item":
      return {
        ...blockInfo,
        block: {
          ...blockInfo.block,
          numbered_list_item: {
            ...blockInfo.block.numbered_list_item,
            rich_text: flummoxRichText(
              blockInfo.block.numbered_list_item.rich_text,
            ),
          },
        },
      };
    case "image":
      return {
        ...blockInfo,
        block: {
          ...blockInfo.block,
          image: {
            ...blockInfo.block.image,
            caption: flummoxRichText(blockInfo.block.image.caption),
          },
        },
      };
    case "quote":
      return {
        ...blockInfo,
        block: {
          ...blockInfo.block,
          quote: {
            ...blockInfo.block.quote,
            rich_text: flummoxRichText(blockInfo.block.quote.rich_text),
          },
        },
      };
    case "divider":
      return blockInfo;
    case "column_list":
      return blockInfo;
    case "column":
      return blockInfo;
    case "to_do":
      return {
        ...blockInfo,
        block: {
          ...blockInfo.block,
          to_do: {
            ...blockInfo.block.to_do,
            rich_text: flummoxRichText(blockInfo.block.to_do.rich_text),
          },
        },
      };
    case "table":
      return blockInfo;
    case "table_row":
      return {
        ...blockInfo,
        block: {
          ...blockInfo.block,
          table_row: {
            ...blockInfo.block.table_row,
            cells: blockInfo.block.table_row.cells.map((cell) =>
              flummoxRichText(cell),
            ),
          },
        },
      };
    case "template":
    case "synced_block":
    case "child_page":
    case "child_database":
    case "equation":
    case "breadcrumb":
    case "table_of_contents":
    case "link_to_page":
    case "embed":
    case "bookmark":
    case "video":
    case "pdf":
    case "file":
    case "audio":
    case "link_preview":
    case "unsupported":
    default:
      return blockInfo;
  }
}

export function flummoxBlockMap(
  blockMap: Record<string, BlockInfo>,
): Record<string, BlockInfo> {
  const newBlockMap: Record<string, BlockInfo> = {};

  for (const [blockId, blockInfo] of Object.entries(blockMap)) {
    newBlockMap[blockId] = flummoxBlock(blockId, blockInfo);
  }

  return newBlockMap;
}
