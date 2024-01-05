import { extension } from "mime-types";
import { writeFile } from "node:fs/promises";
import { join, posix, sep } from "node:path";
import pMemo from "p-memoize";
import PQueue from "p-queue";
import sharp, { type Sharp } from "sharp";
import { NOISY_LOGS } from "../../lib/constants";
import {
  DEV_IMAGE_DIR,
  IMAGE_DIR,
  type ImageFormatInfo,
  type ImageInfo,
  type ImageSizeInfo,
} from "./constants";
import { addToManifest, getFromManifest } from "./manifest";

type ImageTypeIdentifier =
  | "png"
  | "jpeg"
  | "webp"
  | "avif"
  | "jxl"
  | "webp-lossless";

const convertQueue = new PQueue({ concurrency: 3, throwOnTimeout: true });
const writeQueue = new PQueue({ concurrency: 3, throwOnTimeout: true });

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
      const widthsToGenerate = widths
        .filter((width) => width < intrinsicWidth)
        .sort();
      widthsToGenerate.unshift(intrinsicWidth);

      let clone = rootSharp.clone();

      switch (typeIdentifier) {
        case "png":
          clone = clone.png();
          break;
        case "jpeg":
          clone = clone.jpeg();
          break;
        case "jxl":
          clone = clone.jxl();
          break;
        case "webp":
          clone = clone.webp();
          break;
        case "webp-lossless":
          clone = clone.webp({ lossless: true });
          break;
        case "avif":
          clone = clone.avif();
          break;
        default:
          throw new Error(`Unable to convert to type ${typeIdentifier}`);
      }

      const generationPromises = widthsToGenerate.map(
        async (width): Promise<ImageSizeInfo> => {
          const widthClone = clone.clone().resize({ width });

          const filename = `${id}_${width}.${ext}`;
          const filePath = join(DEV_IMAGE_DIR, filename);
          const path = join(IMAGE_DIR, filename);
          const pathForBrowser = `/${path.split(sep).join(posix.sep)}`;

          const nodeBuffer = await convertQueue.add(() =>
            widthClone.toBuffer(),
          );
          if (!nodeBuffer) {
            throw new Error("Conversion exceeded timeout");
          }
          await writeQueue.add(() => writeFile(filePath, nodeBuffer));

          return { path: pathForBrowser, width };
        },
      );

      const sizes = await Promise.all(generationPromises);
      return { type: mimeType, sizes };
    };
  };
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
  id: string,
  url: string,
  widths: number[],
): Promise<ImageInfo> {
  // This function assumes that the app is running in a single-threaded
  // environment, which is at least true for local dev and static builds.

  const cached = getFromManifest(id);
  if (cached) {
    return cached;
  }

  // Download file
  if (NOISY_LOGS) {
    // eslint-disable-next-line no-console
    console.log(`[Images] Fetching ${id} from ${url}`);
  }
  const response = await fetch(url);
  const mimeType = response.headers.get("Content-Type");
  const buffer = await response.arrayBuffer();

  if (!mimeType) {
    throw new Error(`URL ${url} did not have a content type`);
  }

  const convertForType = getConvertFunctionFactory(id, buffer, widths);

  const outputs: ReturnType<ReturnType<typeof getConvertFunctionFactory>>[] =
    [];
  switch (mimeType) {
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
        convertForType("webp"),
        convertForType("avif"),
        convertForType("jpeg"),
      );
      break;
    default:
      throw new Error(`Unsupported MIME type ${mimeType}`);
  }

  const formats = await Promise.all(outputs.map(async (fn) => fn()));

  const info: ImageInfo = { id, formats };
  addToManifest(id, info);
  // // eslint-disable-next-line no-console
  // console.log(`Saved image ${id}`);

  return info;
}
