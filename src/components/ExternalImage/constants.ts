import { join } from "node:path";

export interface ImageVariant {
  path: string;
  type: string;
  width: number;
}

export interface ImageInfo {
  id: string;
  variants: ImageVariant[];
}

export const IMAGE_MANIFEST_FILENAME = "images.json";
export const IMAGE_DIR = "static/images/external";
export const DEV_IMAGE_DIR = join(process.cwd(), "public", IMAGE_DIR);
export const DIST_IMAGE_DIR = join(process.cwd(), "dist", IMAGE_DIR);

export const IMAGE_MANIFEST_PATH = join(DEV_IMAGE_DIR, IMAGE_MANIFEST_FILENAME);
