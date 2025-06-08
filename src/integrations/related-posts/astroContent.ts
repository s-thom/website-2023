import type { DataEntryMap, InferEntrySchema } from "astro:content";
import { parse } from "devalue";
import { readFile } from "node:fs/promises";
import remarkStringify from "remark-stringify";
import strip from "strip-markdown";
import { unified } from "unified";
import { notionToRemark } from "../../lib/unified/notionToRemark";
import type { BlockInfo } from "../notion-loader/api";

interface PageMinimal {
  id: string;
  blockMap: Record<string, BlockInfo>;
}

const DATA_STORE_LOCATION = ".astro/data-store.json";

const processor = unified().use(strip).use(remarkStringify);

async function getBlogPosts<C extends keyof DataEntryMap>(
  collectionName: C,
  filter: (entry: InferEntrySchema<C>) => boolean,
): Promise<PageMinimal[]> {
  // We can't use Astro's virtual `astro:content` import here because it doesn't exist.
  // Instead, we're doing it live by reading the manifest file that Astro produces.
  // This is almost certainly going to break one day and I will curse myself for doing this.
  // Have I come back to curse myself yet: No (insert date here).
  const rawData = await readFile(DATA_STORE_LOCATION, "utf-8");
  const data: Map<string, unknown> = parse(rawData);

  if (!(data instanceof Map)) {
    throw new Error(
      "Parsed data is not a Map, Astro's content store has changed.",
    );
  }

  const entryMap: Map<string, unknown> = data.get(collectionName) as any; // TODO: replace with parameter
  if (!(entryMap instanceof Map)) {
    throw new Error(
      "Entries are not in a Map, Astro's content store has changed.",
    );
  }

  return Array.from(entryMap.entries()).flatMap(([key, entry]) => {
    if (typeof entry !== "object" || entry == null || !("data" in entry)) {
      throw new Error(
        "Entry isn't in the right format, Astro's content store has changed.",
      );
    }
    if (typeof entry.data !== "object" || entry.data == null) {
      throw new Error(
        "Entry isn't in the right format, Astro's content store has changed.",
      );
    }

    const pageInfo: InferEntrySchema<C> = entry.data as any;

    if (!filter(pageInfo)) {
      return [];
    }

    return {
      id: key,
      // This ties the implementation to my custom Notion loader. Maybe one day this will change.
      blockMap: (pageInfo as any).blockMap,
    };
  });
}

async function entryToPlainText(page: PageMinimal) {
  const tree = notionToRemark(page.id, page.blockMap);
  const processedTree = await processor.run(tree);
  const stringContent = processor.stringify(processedTree);

  return stringContent;
}

export async function getNotionPagesPlainText<C extends keyof DataEntryMap>(
  collectionName: C,
  filter: (entry: InferEntrySchema<C>) => boolean,
): Promise<{ id: string; content: string }[]> {
  const posts = await getBlogPosts(collectionName, filter);

  const postContents = await Promise.all(
    posts.map((post) =>
      entryToPlainText(post).then((content) => ({ id: post.id, content })),
    ),
  );

  return postContents;
}
