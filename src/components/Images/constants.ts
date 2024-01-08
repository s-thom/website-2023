import { join } from "node:path";

export interface ImageSizeInfo {
  path: string;
  width: number;
}

export type ImageTypeIdentifier =
  | "png"
  | "jpeg"
  | "webp"
  | "avif"
  | "jxl"
  | "webp-lossless";

export const IMAGE_FORMAT_PRIORITIES: Record<ImageTypeIdentifier, number> = {
  jpeg: 0,
  png: 1,
  "webp-lossless": 2,
  jxl: 3,
  webp: 4,
  avif: 5,
};

export interface ImageFormatInfo {
  id: ImageTypeIdentifier;
  mimeType: string;
  sizes: ImageSizeInfo[];
}

export interface ImageInfo {
  id: string;
  formats: ImageFormatInfo[];
}

export const IMAGE_MANIFEST_FILENAME = "images.json";
export const IMAGE_DIR = "static/images/build";

export const CACHE_IMAGE_DIR = join(
  process.cwd(),
  "node_modules/.astro/sthom/images",
);
export const DEV_IMAGE_DIR = join(process.cwd(), "public", IMAGE_DIR);
export const DIST_IMAGE_DIR = join(process.cwd(), "dist", IMAGE_DIR);

export const IMAGE_MANIFEST_PATH = join(
  CACHE_IMAGE_DIR,
  IMAGE_MANIFEST_FILENAME,
);
