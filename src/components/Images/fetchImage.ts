import { NOISY_LOGS } from "../../lib/constants";

export interface ImageInfo {
  buffer: ArrayBuffer;
  mimeType: string;
}

const IMAGE_REQUEST_CACHE: Record<string, Promise<ImageInfo>> = {};

export function fetchImage(src: string): Promise<ImageInfo> {
  if (!IMAGE_REQUEST_CACHE[src]) {
    if (NOISY_LOGS) {
      // eslint-disable-next-line no-console
      console.log(`[Images] Fetching from ${src}`);
    }

    IMAGE_REQUEST_CACHE[src] = fetch(src).then(async (response) => {
      const mimeType = response.headers.get("Content-Type");
      if (!mimeType) {
        throw new Error(`Image source ${src} did not have a content type`);
      }
      const buffer = await response.arrayBuffer();
      return {
        buffer,
        mimeType,
      };
    });
  }

  return IMAGE_REQUEST_CACHE[src];
}
