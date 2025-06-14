import { readFile } from "node:fs/promises";
import { join } from "node:path/posix";
import type { RelatedPostInfo } from "./types";

const BASE_PATH = ".astro/integrations/sthom-related-posts/";

export async function getRelatedPosts(
  collectionLabel: string,
  pageId: string,
): Promise<RelatedPostInfo[]> {
  const rawData = await readFile(
    join(BASE_PATH, `${collectionLabel}.json`),
    "utf-8",
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data: Record<string, RelatedPostInfo[]> = JSON.parse(rawData);

  return data[pageId] ?? [];
}
