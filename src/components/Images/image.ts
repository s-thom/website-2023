import { extension } from "mime-types";
import { writeFile } from "node:fs/promises";
import { join, posix, sep } from "node:path";
import pMemo from "p-memoize";
import PQueue from "p-queue";
import sharp, { type Sharp } from "sharp";
import {
  DEV_IMAGE_DIR,
  IMAGE_DIR,
  type ImageFormatInfo,
  type ImageInfo,
  type ImageSizeInfo,
  type ImageTypeIdentifier,
} from "./constants";
import { addToManifest, getManifest } from "./manifest";

const convertQueue = new PQueue({ concurrency: 3, throwOnTimeout: true });
const writeQueue = new PQueue({ concurrency: 3, throwOnTimeout: true });

type ImageFormatWidthCacheKey = `${string}_${ImageTypeIdentifier}_${number}`;
const IMAGE_FORMAT_WIDTHS_CACHE = new Map<
  ImageFormatWidthCacheKey,
  Promise<ImageSizeInfo>
>();

const readManifestPromise = getManifest().then((manifest) => {
  for (const [id, info] of Object.entries(manifest.images)) {
    for (const format of info.formats) {
      for (const size of format.sizes) {
        IMAGE_FORMAT_WIDTHS_CACHE.set(
          `${id}_${format.id}_${size.width}`,
          Promise.resolve(size),
        );
      }
    }
  }
});

function getConvertFunctionFactory(
  id: string,
  buffer: ArrayBuffer,
  widths: number[],
) {
  let rootSharp: Sharp;
  const getIntrinsicWidth = pMemo(
    async () => (await rootSharp.metadata()).width!,
  );

  return (
    typeIdentifier: ImageTypeIdentifier,
  ): (() => Promise<ImageFormatInfo>) => {
    let mimeType: string;
    switch (typeIdentifier) {
      case "png":
        mimeType = "image/png";
        break;
      case "jpeg":
        mimeType = "image/jpeg";
        break;
      case "webp":
        mimeType = "image/webp";
        break;
      case "avif":
        mimeType = "image/avif";
        break;
      case "jxl":
        mimeType = "image/jxl";
        break;
      case "webp-lossless":
        mimeType = "image/webp";
        break;
      default:
        throw new Error(`Unknown image type identifier ${typeIdentifier}`);
    }

    const ext = extension(mimeType);

    return async (): Promise<ImageFormatInfo> => {
      if (!rootSharp) {
        rootSharp = sharp(buffer);
      }

      const intrinsicWidth = await getIntrinsicWidth();
      const widthsToGenerate = widths.filter((width) => width < intrinsicWidth);
      widthsToGenerate.unshift(intrinsicWidth);

      const getFormatClone = pMemo(async () => {
        if (!rootSharp) {
          rootSharp = sharp(buffer);
        }

        switch (typeIdentifier) {
          case "png":
            return rootSharp.clone().png();
          case "jpeg":
            return rootSharp.clone().jpeg();
          case "jxl":
            return rootSharp.clone().jxl();
          case "webp":
            return rootSharp.clone().webp();
          case "webp-lossless":
            return rootSharp.clone().webp({ lossless: true });
          case "avif":
            return rootSharp.clone().avif();
          default:
            throw new Error(`Unable to convert to type ${typeIdentifier}`);
        }
      });

      async function generateForWidth(width: number): Promise<ImageSizeInfo> {
        const formatClone = await getFormatClone();
        const widthClone = formatClone.clone().resize({ width });

        const filename = `${id}_${width}.${ext}`;
        const filePath = join(DEV_IMAGE_DIR, filename);
        const path = join(IMAGE_DIR, filename);
        const pathForBrowser = `/${path.split(sep).join(posix.sep)}`;

        const nodeBuffer = await convertQueue.add(() => widthClone.toBuffer());
        if (!nodeBuffer) {
          throw new Error("Conversion exceeded timeout");
        }
        await writeQueue.add(() => writeFile(filePath, nodeBuffer));

        return { path: pathForBrowser, width };
      }

      const generationPromises = widthsToGenerate.map(
        (width): Promise<ImageSizeInfo> => {
          const key: ImageFormatWidthCacheKey = `${id}_${typeIdentifier}_${width}`;
          if (!IMAGE_FORMAT_WIDTHS_CACHE.has(key)) {
            IMAGE_FORMAT_WIDTHS_CACHE.set(key, generateForWidth(width));
          }

          return IMAGE_FORMAT_WIDTHS_CACHE.get(key)!;
        },
      );

      const sizes = await Promise.all(generationPromises);
      return { id: typeIdentifier, mimeType, sizes };
    };
  };
}

export interface ImageSourceData {
  id: string;
  buffer: ArrayBuffer;
  mimeType: string;
}

/**
 * @param id An ID for this image. MUST be unique across the entire application for this image
 * @param url The URL of the image
 * @param widths Widths to generate. A version for the images intrinsic width is always generated, as well as any given widths smaller
 *
 * @example
 * const info = await getImageInfo(
 *   'my-image',
 *   'https://example.com/image.png',
 *   [1920, 720, 360]
 * );
 */
export async function getImageInfo(
  image: ImageSourceData,
  widths: number[],
): Promise<ImageInfo> {
  // This function assumes that the app is running in a single-threaded
  // environment, which is at least true for local dev and static builds.

  // Ensure old entries have been added to the cache
  await readManifestPromise;

  const convertForType = getConvertFunctionFactory(
    image.id,
    image.buffer,
    widths,
  );

  const outputs: ReturnType<ReturnType<typeof getConvertFunctionFactory>>[] =
    [];
  switch (image.mimeType) {
    case "image/png":
      outputs.push(convertForType("webp-lossless"));
      outputs.push(convertForType("png"));
      break;
    // case "image/jxl":
    case "image/jpeg":
    case "image/avif":
    case "image/webp":
      outputs.push(
        // convertForType("jxl"), // Not supported
        convertForType("avif"),
        convertForType("webp"),
        convertForType("jpeg"),
      );
      break;
    default:
      throw new Error(`Unsupported MIME type ${image.mimeType}`);
  }

  const formats = await Promise.all(outputs.map(async (fn) => fn()));

  const info: ImageInfo = { id: image.id, formats };
  await addToManifest(image.id, info);
  // // eslint-disable-next-line no-console
  // console.log(`Saved image ${id}`);

  return info;
}
