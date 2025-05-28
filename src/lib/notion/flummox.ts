import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";
import { objects } from "friendly-words";
import seedrandom, { type PRNG } from "seedrandom";
import type { BlockInfo } from "../../integrations/notion-loader/api";
import { arrayRandom } from "../../util";
import { getPageTitleComponents } from "./titles";

const MIN_WORD_LENGTH = 4;
const RANDOM_CHANCE = 0.2;

function randomWord(random: PRNG): string {
  return arrayRandom(objects, random);
}

function randomLink(random: PRNG): string {
  return `https://en.wikipedia.org/wiki/${randomWord(random)}`;
}

function flummoxRichText(
  random: PRNG,
  components: RichTextItemResponse | RichTextItemResponse[],
): RichTextItemResponse[] {
  const asArray = Array.isArray(components) ? components : [components];

  return asArray.map((component) => {
    if (component.type !== "text") {
      return component;
    }

    const words = component.plain_text.split(/\b/);
    const flummoxedWords = words.map((word) =>
      word.length >= MIN_WORD_LENGTH && random() < RANDOM_CHANCE
        ? randomWord(random)
        : word,
    );
    const flummoxedText = flummoxedWords.join("");

    return {
      ...component,
      text: {
        ...component.text,
        content: flummoxedText,
        link: component.text.link
          ? {
              ...component.text.link,
              url: component.text.link.url.startsWith("/")
                ? randomLink(random)
                : component.text.link.url,
            }
          : null,
      },
      plain_text: flummoxedText,
    };
  });
}

function flummoxBlock(
  random: PRNG,
  blockId: string,
  blockInfo: BlockInfo,
): BlockInfo {
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
            rich_text: flummoxRichText(random, titleComponents),
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
            rich_text: flummoxRichText(
              random,
              blockInfo.block.paragraph.rich_text,
            ),
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
            rich_text: flummoxRichText(
              random,
              blockInfo.block.heading_1.rich_text,
            ),
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
            rich_text: flummoxRichText(
              random,
              blockInfo.block.heading_2.rich_text,
            ),
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
            rich_text: flummoxRichText(
              random,
              blockInfo.block.heading_3.rich_text,
            ),
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
            rich_text: flummoxRichText(
              random,
              blockInfo.block.callout.rich_text,
            ),
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
            rich_text: flummoxRichText(
              random,
              blockInfo.block.toggle.rich_text,
            ),
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
              random,
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
              random,
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
            caption: flummoxRichText(random, blockInfo.block.image.caption),
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
            rich_text: flummoxRichText(random, blockInfo.block.quote.rich_text),
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
            rich_text: flummoxRichText(random, blockInfo.block.to_do.rich_text),
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
              flummoxRichText(random, cell),
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
  seed: string,
): Record<string, BlockInfo> {
  const random = seedrandom(seed);

  const newBlockMap: Record<string, BlockInfo> = {};

  for (const [blockId, blockInfo] of Object.entries(blockMap)) {
    newBlockMap[blockId] = flummoxBlock(random, blockId, blockInfo);
  }

  return newBlockMap;
}
