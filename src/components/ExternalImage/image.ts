import { extension } from "mime-types";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import pMemo from "p-memoize";
import PQueue from "p-queue";
import sharp, { type Sharp } from "sharp";
import {
  DEV_IMAGE_DIR,
  IMAGE_DIR,
  type ImageInfo,
  type ImageVariant,
} from "./constants";
import { addToManifest, getFromManifest } from "./manifest";

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

  return (mimeType: string): (() => Promise<ImageVariant[]>) => {
    const ext = extension(mimeType);

    return async (): Promise<ImageVariant[]> => {
      if (!rootSharp) {
        rootSharp = sharp(buffer);
      }

      const intrinsicWidth = await getIntrinsicWidth();
      const widthsToGenerate = widths
        .filter((width) => width < intrinsicWidth)
        .sort();
      widthsToGenerate.unshift(intrinsicWidth);

      let clone = rootSharp.clone();

      switch (mimeType) {
        case "image/png":
          clone = clone.png();
          break;
        case "image/jpeg":
          clone = clone.jpeg();
          break;
        case "image/webp":
          clone = clone.webp();
          break;
        case "image/avif":
          clone = clone.avif();
          break;
        default:
          throw new Error(`Unable to convert to MIME type ${mimeType}`);
      }

      const generationPromises = widthsToGenerate.map(
        async (width): Promise<ImageVariant> => {
          const widthClone = clone.clone().resize({ width });

          const filename = `${id}_${width}.${ext}`;
          const path = join(IMAGE_DIR, filename);
          const filePath = join(DEV_IMAGE_DIR, filename);

          const nodeBuffer = await convertQueue.add(() =>
            widthClone.toBuffer(),
          );
          if (!nodeBuffer) {
            throw new Error("Conversion exceeded timeout");
          }
          await writeQueue.add(() => writeFile(filePath, nodeBuffer));

          return { path, type: mimeType, width };
        },
      );

      const variants = await Promise.all(generationPromises);
      return variants;
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
      outputs.push(convertForType("image/png"));
      break;
    case "image/jpeg":
    case "image/avif":
    case "image/webp":
      outputs.push(
        convertForType("image/webp"),
        convertForType("image/avif"),
        convertForType("image/jpeg"),
      );
      break;
    default:
      throw new Error(`Unsupported MIME type ${mimeType}`);
  }

  const variantsForFormats = await Promise.all(outputs.map(async (fn) => fn()));
  const variants = variantsForFormats.flat();

  const info: ImageInfo = { id, variants };
  addToManifest(id, info);
  // // eslint-disable-next-line no-console
  // console.log(`Saved image ${id}`);

  return info;
}
