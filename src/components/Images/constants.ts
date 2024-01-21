import { join } from "node:path";

export interface ImageSizeInfo {
  /** Path for browser to request image from */
  path: string;
  /** Path of the image file during the build */
  filePath: string;
  /** Intrinsic width of the image */
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
  /** Type of image format. Useful when the same MIME type is used for multiple purposes. */
  id: ImageTypeIdentifier;
  /** MIME type of image format */
  mimeType: string;
  /** List of sizes this image has been generated for */
  sizes: ImageSizeInfo[];
}

export interface ImageInfo {
  /** Unique ID of this image */
  id: string;
  /** Hash of the image contents */
  digest: string;
  /** List of formats, and their sizes, that have been generated for this image */
  formats: ImageFormatInfo[];
  /** Information about the original image */
  original: {
    /** MIME type of image */
    mimeType: string;
    /** Path for browser to request image from */
    path: string;
    /** Path of the image file during the build */
    filePath: string;
    /** Intrinsic width of the image */
    width: number;
  };
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
