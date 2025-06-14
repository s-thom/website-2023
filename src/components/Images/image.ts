import { extension } from "mime-types";
import { webcrypto } from "node:crypto";
import { copyFile, stat, writeFile } from "node:fs/promises";
import { join, posix, sep } from "node:path";
import pMemo from "p-memoize";
import PQueue from "p-queue";
import sharp, { type Sharp } from "sharp";
import {
  CACHE_IMAGE_DIR,
  DEV_IMAGE_DIR,
  IMAGE_DIR,
  IMAGE_FORMAT_PRIORITIES,
  type ImageFormatInfo,
  type ImageInfo,
  type ImageTypeIdentifier,
} from "./constants";
import { addToManifest, getManifest, removeFromManifest } from "./manifest";

const fetchQueue = new PQueue({ concurrency: 3, throwOnTimeout: true });
const convertQueue = new PQueue({ concurrency: 3, throwOnTimeout: true });
const writeQueue = new PQueue({ concurrency: 3, throwOnTimeout: true });

const RAW_IMAGE_CACHE = new Map<string, Promise<ImageSourceData>>();

// While the external interface of this file is id -> formats -> sizes, internally
// it needs to be id -> sizes -> formats. This is so image content can be lazily
// retrieved in more scenarios, which will hopefully lead to fewer failures.
// I say hopefully as I haven't written the code as of writing this comment.

type ImageWidthCacheKey = `${string}_${number}`;
interface ImageWidthCacheFormat {
  id: ImageTypeIdentifier;
  mimeType: string;
  path: string;
  filePath: string;
}
interface ImageWidthCacheValue {
  width: number;
  cacheOnly: boolean;
  formats: ImageWidthCacheFormat[];
}
const IMAGE_WIDTHS_CACHE = new Map<
  ImageWidthCacheKey,
  Promise<ImageWidthCacheValue>
>();

const readManifestPromise = getManifest().then((manifest) => {
  const tempCache = new Map<ImageWidthCacheKey, ImageWidthCacheValue>();

  for (const [id, info] of Object.entries(manifest.images)) {
    if (!info) {
      continue;
    }

    for (const format of info.formats) {
      for (const size of format.sizes) {
        const key: ImageWidthCacheKey = `${id}_${size.width}`;
        const formatEntry: ImageWidthCacheFormat = {
          id: format.id,
          mimeType: format.mimeType,
          path: size.path,
          filePath: size.filePath,
        };

        const entry = tempCache.get(key);
        if (entry) {
          if (entry.formats.find((t) => t.id === format.id)) {
            // eslint-disable-next-line no-console
            console.warn(
              `[Image] Duplicate entry for ${key}:${format.id} in manifest`,
            );
          }
          entry.formats.push(formatEntry);
        } else {
          tempCache.set(key, {
            width: size.width,
            cacheOnly: true,
            formats: [formatEntry],
          });
        }
      }
    }
  }

  for (const [key, value] of tempCache.entries()) {
    IMAGE_WIDTHS_CACHE.set(key, Promise.resolve(value));
  }
});

function getWidthsForDensities(
  widths: number[],
  densities: number[],
): number[] {
  const allMultiplied = widths.flatMap((width) =>
    densities.map((density) => width * density),
  );

  const deDuplicated = Array.from(new Set(allMultiplied));

  return deDuplicated.sort((a, b) => a - b);
}

function getFilename(
  id: string,
  width: number,
  formatMimeType: string,
): string {
  const ext = extension(formatMimeType);
  return `${id}_${width}.${ext}`;
}

async function convertImageForWidth(
  id: string,
  image: Sharp,
  { mimeType }: ImageSourceData,
  width: number,
): Promise<ImageWidthCacheFormat[]> {
  const formatsToGenerate: ImageTypeIdentifier[] = [];
  switch (mimeType) {
    case "image/png":
      formatsToGenerate.push("webp-lossless");
      formatsToGenerate.push("png");
      break;
    // case "image/jxl":
    case "image/jpeg":
    case "image/avif":
    case "image/webp":
      formatsToGenerate.push(
        // "jxl", // Not supported
        "avif",
        "webp",
        "jpeg",
      );
      break;
    default:
      throw new Error(`Unsupported MIME type ${mimeType}`);
  }

  const instance = image.clone().resize(width);

  const formatPromises = formatsToGenerate.map<Promise<ImageWidthCacheFormat>>(
    async (format) => {
      let clone: Sharp;
      let formatMimeType: string;
      switch (format) {
        case "png":
          clone = instance.clone().png();
          formatMimeType = "image/png";
          break;
        case "jpeg":
          clone = instance.clone().jpeg();
          formatMimeType = "image/jpeg";
          break;
        case "jxl":
          clone = instance.clone().jxl();
          formatMimeType = "image/jxl";
          break;
        case "webp":
          clone = instance.clone().webp();
          formatMimeType = "image/webp";
          break;
        case "webp-lossless":
          clone = instance.clone().webp({ lossless: true });
          formatMimeType = "image/webp";
          break;
        case "avif":
          clone = instance.clone().avif();
          formatMimeType = "image/avif";
          break;
        default:
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          throw new Error(`Unable to convert to type ${format}`);
      }

      const filename = getFilename(id, width, formatMimeType);
      const cacheFilePath = join(CACHE_IMAGE_DIR, filename);
      const publicFilePath = join(DEV_IMAGE_DIR, filename);
      const path = join(IMAGE_DIR, filename);
      const pathForBrowser = `/${path.split(sep).join(posix.sep)}`;

      const nodeBuffer = await convertQueue.add(() => clone.toBuffer());
      if (!nodeBuffer) {
        throw new Error("Conversion exceeded timeout");
      }
      await writeQueue.add(async () => {
        await writeFile(publicFilePath, nodeBuffer);
        await copyFile(publicFilePath, cacheFilePath);
      });

      return {
        id: format,
        mimeType: formatMimeType,
        path: pathForBrowser,
        filePath: publicFilePath,
      };
    },
  );

  return Promise.all(formatPromises);
}

async function convertAndCacheWidth(
  id: string,
  image: Sharp,
  width: number,
  sourceData: ImageSourceData,
) {
  const key: ImageWidthCacheKey = `${id}_${width}`;
  if (!IMAGE_WIDTHS_CACHE.has(key)) {
    IMAGE_WIDTHS_CACHE.set(
      key,
      convertImageForWidth(id, image, sourceData, width).then((formats) => ({
        width,
        cacheOnly: false,
        formats,
      })),
    );
  }

  const result = await IMAGE_WIDTHS_CACHE.get(key)!;
  // If it has been written to the public directory already, then don't bother
  if (!result.cacheOnly) {
    return result;
  }

  // This flag needs to be set synchronously to avoid double copies.
  // Even though the file technically hasn't been written yet, it will be so it's
  // pretty safe to flip it here.
  result.cacheOnly = false;

  const copyPromises = result.formats.map(async (format) => {
    const filename = getFilename(id, width, format.mimeType);
    const cacheFilePath = join(CACHE_IMAGE_DIR, filename);
    const publicFilePath = join(DEV_IMAGE_DIR, filename);

    await writeQueue.add(async () => {
      // We only need to copy the file if it doesn't already exist.
      // The control flow is a bit weird, but it works ¯\_(ツ)_/¯
      try {
        const fileStat = await stat(publicFilePath);
        if (fileStat.isFile()) {
          return;
        }

        throw new Error("Must copy file");
      } catch (err) {
        await copyFile(cacheFilePath, publicFilePath);
      }
    });
  });
  await Promise.all(copyPromises);

  return result;
}

export interface ImageSourceData {
  buffer: ArrayBuffer;
  mimeType: string;
}

/**
 * @param id An ID for this image. MUST be unique across the entire application for this image
 * @param getImage A function to get the original data of the image
 * @param widths Widths to generate. A version for the images intrinsic width is always generated, as well as any given widths smaller
 *
 * @example
 * const info = await getImageInfo(
 *   'my-image',
 *   getImageDataFunction,
 *   [1920, 720, 360]
 * );
 */
export async function getImageInfo(
  id: string,
  getImage: () => Promise<ImageSourceData>,
  widths: number[],
  densities: number[],
): Promise<ImageInfo> {
  // This function assumes that the app is running in a single-threaded
  // environment, which is at least true for local dev and static builds.

  // Ensure old entries have been added to the cache
  await readManifestPromise;

  // This needs to be memoised and cached to prevent the source being requested
  // multiple times unnecessarily. Oh, and the actual requests are queued.
  // It's kind of ridiculous.
  const getImageMemo = pMemo(() => {
    if (!RAW_IMAGE_CACHE.has(id)) {
      RAW_IMAGE_CACHE.set(
        id,
        fetchQueue.add(() => getImage(), { throwOnTimeout: true }),
      );
    }
    return RAW_IMAGE_CACHE.get(id)!;
  });

  const sourceData = await getImageMemo();
  const manifest = await getManifest();
  const digestBuffer = await webcrypto.subtle.digest(
    "SHA-256",
    sourceData.buffer,
  );
  const digest = `sha256:${Buffer.from(digestBuffer).toString("hex")}`;

  // Remove all entries for this image from cache if the digest doesn't match.
  // Since `getImageMemo()` is so heavily memoised, this should only happen at most once.
  const shouldResetCache = manifest.images[id]
    ? manifest.images[id].digest !== digest
    : false;

  if (shouldResetCache) {
    removeFromManifest(id);

    const keysToRemove: ImageWidthCacheKey[] = [];
    const keyRegex = new RegExp(`/^${id}_\\d+$/`);
    for (const [key] of IMAGE_WIDTHS_CACHE.entries()) {
      if (keyRegex.test(key)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => IMAGE_WIDTHS_CACHE.delete(key));
  }

  const imSharp = sharp(sourceData.buffer);
  let intrinsicWidth: number;
  try {
    const meta = await imSharp.metadata();
    intrinsicWidth = meta.width!;
  } catch (err) {
    if (err instanceof Error) {
      if (sourceData.mimeType === "application/xml") {
        // eslint-disable-next-line no-console
        console.warn(
          "xml image data",
          Buffer.from(sourceData.buffer).toString(),
        );
      }
      throw new Error(
        `Error when loading ${sourceData.mimeType} image ${id}: ${err.message}`,
      );
    }

    throw err;
  }

  const allWidths = getWidthsForDensities(widths, densities).filter(
    (w) => w <= intrinsicWidth,
  );

  // Convert image for all relevant sizes, using cache if possible
  const sizePromises = allWidths.map((width) =>
    convertAndCacheWidth(id, imSharp, width, sourceData),
  );

  // Also save a copy of the original size for fallback.
  // This does actually get re-processed, along with generating multiple formats.
  // I just don't feel like rewriting this file _again_ just for this.
  const originalSize = await convertAndCacheWidth(
    id,
    imSharp,
    intrinsicWidth,
    sourceData,
  );
  const originalSizeFormat = originalSize.formats.find(
    (format) => format.mimeType === sourceData.mimeType,
  );
  if (!originalSizeFormat) {
    throw new Error(
      `Image conversion for ${id} did not save in original format`,
    );
  }

  // We get the results back as a list of sizes with formats, but we need it to
  // be a list of formats with sizes (as that's what the <source> element uses)
  const sizeResults = await Promise.all(sizePromises);
  const formats: ImageFormatInfo[] = [];
  for (const size of sizeResults) {
    for (const format of size.formats) {
      const existingFormat = formats.find((f) => f.id === format.id);
      if (existingFormat) {
        existingFormat.sizes.push({
          width: size.width,
          path: format.path,
          filePath: format.filePath,
        });
      } else {
        formats.push({
          id: format.id,
          mimeType: format.mimeType,
          sizes: [
            {
              width: size.width,
              path: format.path,
              filePath: format.filePath,
            },
          ],
        });
      }
    }
  }

  // We want better formats first so browsers will chose them
  formats.sort(
    (a, z) => IMAGE_FORMAT_PRIORITIES[z.id] - IMAGE_FORMAT_PRIORITIES[a.id],
  );

  const info: ImageInfo = {
    id,
    digest,
    formats,
    original: {
      mimeType: sourceData.mimeType,
      width: intrinsicWidth,
      path: originalSizeFormat.path,
      filePath: originalSizeFormat.filePath,
    },
  };
  await addToManifest(id, info);

  return info;
}
