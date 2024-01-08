import { extension } from "mime-types";
import { copyFile, writeFile } from "node:fs/promises";
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
import { addToManifest, getManifest } from "./manifest";

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
}
interface ImageWidthCacheValue {
  width: number;
  formats: ImageWidthCacheFormat[];
}
const IMAGE_WIDTHS_CACHE = new Map<
  ImageWidthCacheKey,
  Promise<ImageWidthCacheValue>
>();

const readManifestPromise = getManifest().then((manifest) => {
  const tempCache = new Map<ImageWidthCacheKey, ImageWidthCacheValue>();

  for (const [id, info] of Object.entries(manifest.images)) {
    for (const format of info.formats) {
      for (const size of format.sizes) {
        const key: ImageWidthCacheKey = `${id}_${size.width}`;
        const formatEntry = {
          id: format.id,
          mimeType: format.mimeType,
          path: size.path,
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

async function convertImageForWidth(
  id: string,
  getImage: () => Promise<ImageSourceData>,
  width: number,
): Promise<ImageWidthCacheFormat[]> {
  const { buffer, mimeType } = await getImage();

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

  const instance = sharp(buffer).resize(width, width);

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
          throw new Error(`Unable to convert to type ${format}`);
      }

      const ext = extension(formatMimeType);
      const filename = `${id}_${width}.${ext}`;
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

      return { id: format, mimeType: formatMimeType, path: pathForBrowser };
    },
  );

  return Promise.all(formatPromises);
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

  // Cache any values for later
  const sizePromises = widths.map((width) => {
    const key: ImageWidthCacheKey = `${id}_${width}`;
    if (!IMAGE_WIDTHS_CACHE.has(key)) {
      IMAGE_WIDTHS_CACHE.set(
        key,
        convertImageForWidth(id, getImageMemo, width).then((formats) => ({
          width,
          formats,
        })),
      );
    }
    return IMAGE_WIDTHS_CACHE.get(`${id}_${width}`)!;
  });

  // We get the results back as a list of sizes with formats, but we need it to
  // be a list of formats with sizes (as that's what the <source> element uses)
  const sizeResults = await Promise.all(sizePromises);
  const formats: ImageFormatInfo[] = [];
  for (const size of sizeResults) {
    for (const format of size.formats) {
      const existingFormat = formats.find((f) => f.id === format.id);
      if (existingFormat) {
        existingFormat.sizes.push({ width: size.width, path: format.path });
      } else {
        formats.push({
          id: format.id,
          mimeType: format.mimeType,
          sizes: [{ width: size.width, path: format.path }],
        });
      }
    }
  }

  // We want better formats first so browsers will chose them
  formats.sort(
    (a, z) => IMAGE_FORMAT_PRIORITIES[z.id] - IMAGE_FORMAT_PRIORITIES[a.id],
  );

  const info = { id, formats };
  await addToManifest(id, info);

  return info;
}
