/* eslint @typescript-eslint/no-use-before-define: ["error", { "functions": false }] */
import type {
  BlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client";
import type {
  ListItem,
  Nodes,
  PhrasingContent,
  Root,
  RootContent,
  TableRow,
} from "mdast";
import type { BlockInfo, BlockMap } from "../../integrations/notion-loader/api";
import { getPageTitleComponents } from "../notion/titles";
import { richTextToUnformattedString } from "../notion/util";

const BLOCK_GROUP_TYPE = "_block-group";

interface BlockGroup {
  type: typeof BLOCK_GROUP_TYPE;
  blockType: BlockObjectResponse["type"];
  children: BlockInfo[];
}

function compressPhrasingContent(
  content: PhrasingContent[],
): PhrasingContent[] {
  let previousNode: PhrasingContent | undefined;
  const compressed = content.flatMap<PhrasingContent>((node) => {
    if (!("children" in node)) {
      // Node if of a different type, so need to clear state.
      previousNode = undefined;
      return [node];
    }

    if (previousNode === undefined || previousNode.type !== node.type) {
      // Compress children now that all children that will be in the previous node have been added
      if (previousNode && "children" in previousNode) {
        previousNode.children = compressPhrasingContent(previousNode.children);
      }

      // Set new previous node
      previousNode = node;

      return [node];
    }

    // Compress nodes of the same type
    previousNode.children.push(...node.children);
    return [];
  });

  if (previousNode && "children" in previousNode) {
    previousNode.children = compressPhrasingContent(previousNode.children);
  }

  return compressed;
}

export function richTextToMarkdownNodes(
  richText: RichTextItemResponse[],
): PhrasingContent[] {
  const rawContent = richText.map((item) => {
    let node: PhrasingContent = { type: "text", value: item.plain_text };

    if (item.annotations.code) {
      node = { type: "inlineCode", value: item.plain_text };
    }
    if (item.annotations.bold) {
      node = { type: "strong", children: [node] };
    }
    if (item.annotations.italic) {
      node = { type: "emphasis", children: [node] };
    }
    if (item.annotations.strikethrough) {
      node = { type: "delete", children: [node] };
    }
    if (item.href) {
      node = { type: "link", children: [node], url: item.href };
    }

    return node;
  });

  // TODO: Compress neighbouring types of thing.
  return compressPhrasingContent(rawContent);
}

function convertChildren(info: BlockInfo, blockMap: BlockMap): Nodes[] {
  if (!info.children) {
    return [];
  }

  const children = info.children
    .map((id) => blockMap[id])

    .filter((child) => child !== undefined);

  const convertedChildren: Nodes[] = [];
  let currentGroup: BlockGroup | undefined;

  function addCurrentGroup() {
    if (!currentGroup) {
      return;
    }

    // Append new group when the type differs
    switch (currentGroup.blockType) {
      case "bulleted_list_item":
        convertedChildren.push({
          type: "list",
          ordered: false,
          children: currentGroup.children.map(
            (nestedChild) => convertNode(nestedChild, blockMap) as ListItem,
          ),
        });
        break;
      case "numbered_list_item":
        convertedChildren.push({
          type: "list",
          ordered: true,
          start: 1,
          children: currentGroup.children.map(
            (nestedChild) => convertNode(nestedChild, blockMap) as ListItem,
          ),
        });
        break;
      case "to_do":
        convertedChildren.push({
          type: "list",
          ordered: false,
          children: currentGroup.children.map(
            (nestedChild) => convertNode(nestedChild, blockMap) as ListItem,
          ),
        });
        break;
      default:
      // Do nothing special
    }

    currentGroup = undefined;
  }

  for (const child of children) {
    if (child.block.object === "page") {
      continue;
    }

    const { block } = child;

    if (currentGroup) {
      // Add to existing group if types are the same
      if (currentGroup.blockType === block.type) {
        currentGroup.children.push(child);
        continue;
      }

      addCurrentGroup();
    }

    switch (block.type) {
      case "bulleted_list_item":
        currentGroup = {
          type: BLOCK_GROUP_TYPE,
          blockType: block.type,
          children: [child],
        };
        continue;
      case "numbered_list_item":
        currentGroup = {
          type: BLOCK_GROUP_TYPE,
          blockType: block.type,
          children: [child],
        };
        continue;
      case "to_do":
        currentGroup = {
          type: BLOCK_GROUP_TYPE,
          blockType: block.type,
          children: [child],
        };
        continue;
      // Column list and column are just containers so flatten them
      case "column_list":
      case "column":
        convertedChildren.push(...convertChildren(child, blockMap));
        break;
      case "toggle":
        convertedChildren.push(
          {
            type: "html",
            value: `<details><summary>${richTextToUnformattedString(block.toggle.rich_text)}</summary>`,
          },
          ...convertChildren(child, blockMap),
          { type: "html", value: "</details>" },
        );
        break;
      case "link_to_page":
      case "table_of_contents":
      case "breadcrumb":
      case "link_preview":
      case "child_page":
      case "child_database":
      case "template":
      case "synced_block":
      case "bookmark":
      case "unsupported":
        throw new Error(
          `Unsupported block type ${block.type} when converting children to Markdown`,
        );
      default:
        convertedChildren.push(convertNode(child, blockMap));
    }
  }

  addCurrentGroup();

  return convertedChildren;
}

function convertNode(info: BlockInfo, blockMap: BlockMap): Nodes {
  const { block } = info;

  if (block.object === "page") {
    const root: Root = {
      type: "root",
      children: [
        {
          type: "heading",
          depth: 1,
          children: richTextToMarkdownNodes(getPageTitleComponents(block)),
        },
        ...(convertChildren(info, blockMap) as RootContent[]),
      ],
    };

    return root;
  }

  switch (block.type) {
    case "code":
      return {
        type: "code",
        lang: block.code.language,
        value: richTextToUnformattedString(block.code.rich_text),
      };
    case "image":
      return {
        type: "paragraph",
        children: [
          {
            type: "image",
            alt: richTextToUnformattedString(block.image.caption),
            url:
              block.image.type === "file"
                ? block.image.file.url
                : block.image.external.url,
          },
        ],
      };
    case "paragraph":
      return {
        type: "paragraph",
        children: richTextToMarkdownNodes(block.paragraph.rich_text),
      };
    case "heading_1":
      return {
        type: "heading",
        depth: 2,
        children: richTextToMarkdownNodes(block.heading_1.rich_text),
      };
    case "heading_2":
      return {
        type: "heading",
        depth: 3,
        children: richTextToMarkdownNodes(block.heading_2.rich_text),
      };
    case "heading_3":
      return {
        type: "heading",
        depth: 4,
        children: richTextToMarkdownNodes(block.heading_3.rich_text),
      };
    case "bulleted_list_item":
      return {
        type: "listItem",
        children: [
          {
            type: "paragraph",
            children: richTextToMarkdownNodes(
              block.bulleted_list_item.rich_text,
            ),
          },
          ...(convertChildren(info, blockMap) as never[]),
        ],
      };
    case "numbered_list_item":
      return {
        type: "listItem",
        children: [
          {
            type: "paragraph",
            children: richTextToMarkdownNodes(
              block.numbered_list_item.rich_text,
            ),
          },
          ...(convertChildren(info, blockMap) as never[]),
        ],
      };
    case "quote":
      return {
        type: "blockquote",
        children: [
          {
            type: "paragraph",
            children: richTextToMarkdownNodes(block.quote.rich_text),
          },
          ...(convertChildren(info, blockMap) as never[]),
        ],
      };
    case "to_do":
      return {
        type: "listItem",
        checked: block.to_do.checked,
        children: [
          {
            type: "paragraph",
            children: richTextToMarkdownNodes(block.to_do.rich_text),
          },
          ...(convertChildren(info, blockMap) as never[]),
        ],
      };
    case "equation":
      return {
        type: "paragraph",
        children: [{ type: "inlineCode", value: block.equation.expression }],
      };
    case "callout":
      return {
        type: "blockquote",
        children: [
          {
            type: "paragraph",
            children: richTextToMarkdownNodes(block.callout.rich_text),
          },
          ...(convertChildren(info, blockMap) as never[]),
        ],
      };
    case "divider":
      return {
        type: "thematicBreak",
      };
    case "embed":
      return {
        type: "paragraph",
        children: [
          {
            type: "link",
            url: block.embed.url,
            children: richTextToMarkdownNodes(block.embed.caption),
          },
        ],
      };
    case "video":
      return {
        type: "paragraph",
        children: [
          {
            type: "image",
            alt: richTextToUnformattedString(block.video.caption),
            url:
              block.video.type === "file"
                ? block.video.file.url
                : block.video.external.url,
          },
        ],
      };
    case "pdf":
      return {
        type: "paragraph",
        children: [
          {
            type: "image",
            alt: richTextToUnformattedString(block.pdf.caption),
            url:
              block.pdf.type === "file"
                ? block.pdf.file.url
                : block.pdf.external.url,
          },
        ],
      };
    case "file":
      return {
        type: "paragraph",
        children: [
          {
            type: "image",
            alt: richTextToUnformattedString(block.file.caption),
            url:
              block.file.type === "file"
                ? block.file.file.url
                : block.file.external.url,
          },
        ],
      };
    case "audio":
      return {
        type: "paragraph",
        children: [
          {
            type: "image",
            alt: richTextToUnformattedString(block.audio.caption),
            url:
              block.audio.type === "file"
                ? block.audio.file.url
                : block.audio.external.url,
          },
        ],
      };

    case "table":
      return {
        type: "table",
        children: convertChildren(info, blockMap) as TableRow[],
      };
    case "table_row":
      return {
        type: "tableRow",
        children: block.table_row.cells.map((cell) => ({
          type: "tableCell",
          children: richTextToMarkdownNodes(cell),
        })),
      };
    // Requires special handling that's deferred to convertChildren()
    case "bookmark":
    case "link_to_page":
    case "column_list":
    case "column":
    case "table_of_contents":
    case "breadcrumb":
    case "link_preview":
    case "child_page":
    case "child_database":
    case "toggle":
    case "template":
    case "synced_block":
    case "unsupported":
    default:
      throw new Error(
        `Unknown block type ${block.type} when converting to Markdown`,
      );
  }
}

export function notionToRemark(rootId: string, blockMap: BlockMap): Root {
  const root = blockMap[rootId];
  if (!root) {
    throw new Error(`Root node ${rootId} not found`);
  }

  return convertNode(root, blockMap) as Root;
}
