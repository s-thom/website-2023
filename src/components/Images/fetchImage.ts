import { lookup } from "mime-types";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NOISY_LOGS } from "../../lib/constants";

export interface ImageInfo {
  buffer: ArrayBuffer;
  mimeType: string;
}

const IMAGE_REQUEST_CACHE = new Map<string, Promise<ImageInfo>>();

export function fetchImage(src: string): Promise<ImageInfo> {
  if (!IMAGE_REQUEST_CACHE.has(src)) {
    if (NOISY_LOGS) {
      // eslint-disable-next-line no-console
      console.log(`[Images] Fetching from ${src}`);
    }

    const promise = fetch(src).then(
      async (response) => {
        let mimeType = response.headers.get("Content-Type");
        if (!mimeType) {
          throw new Error(`Image source ${src} did not have a content type`);
        }

        // Normalise JPEG mime type to the correct one.
        if (mimeType === "image/jpg") {
          mimeType = "image/jpeg";
        }

        const buffer = await response.arrayBuffer();
        return {
          buffer,
          mimeType,
        };
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.error(`Error while fetching image at ${src}`);
        throw err;
      },
    );
    IMAGE_REQUEST_CACHE.set(src, promise);
  }

  return IMAGE_REQUEST_CACHE.get(src)!;
}

export const RESOURCES_DIR = join(process.cwd(), "src/resources");

export function readImage(name: string): Promise<ImageInfo> {
  if (!IMAGE_REQUEST_CACHE.has(name)) {
    if (NOISY_LOGS) {
      // eslint-disable-next-line no-console
      console.log(`[Images] Reading from ${name}`);
    }

    const mimeType = lookup(name);
    if (!mimeType) {
      throw new Error(`Unknown MIME type for file ${name}`);
    }

    const promise = readFile(join(RESOURCES_DIR, name)).then((buffer) => ({
      buffer,
      mimeType,
    }));
    IMAGE_REQUEST_CACHE.set(name, promise);
  }

  return IMAGE_REQUEST_CACHE.get(name)!;
}
