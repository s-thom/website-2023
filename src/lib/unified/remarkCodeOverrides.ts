import type { getCollection } from "astro:content";
import type { Code, Nodes, Root, RootContent } from "mdast";
import { join } from "node:path/posix";
import type { Transformer } from "unified";
import { getPageTitleComponents } from "../notion/titles";
import { getCodeBlockContentInfo } from "../shiki";
import { richTextToMarkdownNodes } from "./notionToRemark";

function flatMapNodesRecursive(ast: Nodes, mapper: (node: Nodes) => Nodes[]) {
  function mapChild(node: Nodes) {
    if ("children" in node) {
      const newChildren = [];

      for (let i = 0; i < node.children.length; i++) {
        const mappedChild = mapChild(node.children[i]);
        if (Array.isArray(mappedChild)) {
          newChildren.push(...mappedChild);
        }
      }

      node.children = newChildren as never;
    }

    return mapper(node);
  }

  return mapChild(ast)[0];
}

export interface RemarkCodeOverridesOptions {
  /**
   * Mapper for each type of override.
   *
   * `default` is a special case.
   */
  mappers: Record<string, (node: Code) => RootContent[]>;
}

export function remarkCodeOverrides({
  mappers = {},
}: RemarkCodeOverridesOptions): Transformer<Root> {
  return function remarkCodeOverrides(tree) {
    flatMapNodesRecursive(tree, (node) => {
      if (node.type !== "code") {
        return [node];
      }

      const info = getCodeBlockContentInfo(node.value, node.lang);
      if (info.type !== "override") {
        return [node];
      }

      if (typeof mappers[info.component] === "function") {
        return mappers[info.component](node);
      }
      if (typeof mappers.default === "function") {
        return mappers.default(node);
      }

      return [node];
    });
  };
}

export function getMapBlogCollection(
  blogEntries: Awaited<ReturnType<typeof getCollection<"pages">>>,
  pathPrefix?: string,
) {
  return function mapBlogCollection(): RootContent[] {
    return [
      {
        type: "list",
        children: blogEntries.map((entry) => ({
          type: "listItem",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "link",
                  url: pathPrefix
                    ? join("/", pathPrefix, "blog", entry.data.slug)
                    : join("/blog", entry.data.slug),
                  children: richTextToMarkdownNodes(
                    getPageTitleComponents(entry.data.page),
                  ),
                },
              ],
            },
          ],
        })),
      },
    ];
  };
}

export function mapRedactContent(): RootContent[] {
  return [{ type: "code", value: "// Code hidden" }];
}
