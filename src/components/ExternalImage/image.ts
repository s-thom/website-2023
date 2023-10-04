import { extension } from "mime-types";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp, { type Sharp } from "sharp";
import {
  DEV_IMAGE_DIR,
  IMAGE_DIR,
  type ImageInfo,
  type ImageVariant,
} from "./constants";
import { addToManifest, getFromManifest } from "./manifest";

type BF = () => Promise<ImageVariant>;

function getConvertFunctionFactory(id: string, buffer: ArrayBuffer) {
  let rootSharp: Sharp;

  return (mimeType: string, width: number): (() => Promise<ImageVariant>) => {
    const ext = extension(mimeType);

    const filename = `${id}_${width}.${ext}`;
    const path = join(IMAGE_DIR, filename);
    const filePath = join(DEV_IMAGE_DIR, filename);

    return async (): Promise<ImageVariant> => {
      if (!rootSharp) {
        rootSharp = sharp(buffer);
      }

      let clone = rootSharp.clone();

      clone = clone.resize({ width });

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

      const nodeBuffer = await clone.toBuffer();
      await writeFile(filePath, nodeBuffer);

      return { path, type: mimeType, width };
    };
  };
}

export async function getImageInfo(
  id: string,
  url: string,
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

  const factory = getConvertFunctionFactory(id, buffer);

  const outputs: BF[] = [];
  switch (mimeType) {
    case "image/png":
      outputs.push(factory("image/png", 900));
      break;
    case "image/jpeg":
    case "image/avif":
    case "image/webp":
      outputs.push(
        factory("image/webp", 900),
        factory("image/avif", 900),
        factory("image/jpeg", 900),
      );
      break;
    default:
      throw new Error(`Unsupported MIME type ${mimeType}`);
  }

  const variants = await Promise.all(outputs.map(async (fn) => fn()));

  const info: ImageInfo = { id, variants };
  addToManifest(id, info);
  // // eslint-disable-next-line no-console
  // console.log(`Saved image ${id}`);

  return info;
}
