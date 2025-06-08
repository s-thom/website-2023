import { pipeline } from "@huggingface/transformers";
import type { RelatedPostInfo } from "./types";

// Heavily inspired by (read: directly copied from)
// https://alexop.dev/posts/semantic-related-posts-astro-transformersjs/

const NUM_SIMILAR_POSTS = 2;

function normalise(vector: Float32Array): Float32Array {
  const length = Math.hypot(...vector);
  if (length === 0) {
    return vector;
  }

  return new Float32Array(vector.map((x) => x / length));
}

/**
 * Computes dot product of two same-length vectors.
 * Vectors MUST be normalized before using this for cosine similarity!
 */
function dotProduct(a: Float32Array, b: Float32Array) {
  return a.reduce((sum, num, i) => sum + num * b[i], 0);
}

async function embedStrings(
  entries: { id: string; content: string }[],
): Promise<{ id: string; embedding: Float32Array }[]> {
  if (entries.length === 0) {
    return [];
  }

  const featureExtractor = await pipeline(
    "feature-extraction",
    "sentence-transformers/all-MiniLM-L6-v2",
    { dtype: "fp32" },
  );

  // From https://alexop.dev/posts/semantic-related-posts-astro-transformersjs/
  // We need to normalise the resulting vectors ourselves. It's a bit more
  // processing, but this happens during build which is already slow for this site :)
  const result = await featureExtractor(
    entries.map((entry) => entry.content),
    { pooling: "mean", normalize: false },
  );
  const [height, width] = result.dims;
  const data = result.data as Float32Array;

  if (height !== entries.length) {
    throw new Error(
      `Incorrect number of extracted results when getting embeddings. Expected: ${entries.length} Got: ${height}`,
    );
  }

  return entries.map((entry, i) => ({
    id: entry.id,
    embedding: normalise(data.slice(i * width, (i + 1) * width)),
  }));
}

function getMostSimilar(
  currentItem: { id: string; embedding: Float32Array },
  allItems: { id: string; embedding: Float32Array }[],
  count: number,
  threshold = 0,
): RelatedPostInfo[] {
  return allItems
    .map<RelatedPostInfo>((item) => ({
      id: item.id,
      similarity:
        item.id === currentItem.id
          ? -Infinity // Prevent matching against self
          : dotProduct(currentItem.embedding, item.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, count)
    .filter((item) => item.similarity >= threshold);
}

export async function getRelatedPosts(
  posts: { id: string; content: string }[],
): Promise<Record<string, RelatedPostInfo[]>> {
  const embeddings = await embedStrings(posts);

  const relatedPosts = embeddings.map<[string, RelatedPostInfo[]]>((item) => [
    item.id,
    getMostSimilar(item, embeddings, NUM_SIMILAR_POSTS),
  ]);

  return Object.fromEntries(relatedPosts);
}
