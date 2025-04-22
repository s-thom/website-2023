import type { AstroIntegrationLogger } from "astro";
import { extension } from "mime-types";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "path";

const CACHE_DIR = join(
  process.cwd(),
  ".astro/sthom/notion-loader/images",
);
const CACHE_MANIFEST_FILE = join(CACHE_DIR, "manifest.json");

const MANIFEST_VERSION = 1;
interface ManifestImageData {
  key: string;
  url: string;
  path: string;
  mimeType: string;
}
interface ManifestType {
  version: number;
  images: Record<string, ManifestImageData>;
}

export interface ImageData {
  id: string;
  buffer: ArrayBuffer;
  mimeType: string;
}

async function makeCacheDir() {
  await mkdir(CACHE_DIR, { recursive: true });
}

let shouldWriteManifest = false;
async function writeManifestFile(manifest: ManifestType) {
  if (shouldWriteManifest) {
    return;
  }
  shouldWriteManifest = true;

  await makeCacheDir();

  while (shouldWriteManifest) {
    shouldWriteManifest = false;

    // eslint-disable-next-line no-await-in-loop
    await writeFile(CACHE_MANIFEST_FILE, JSON.stringify(manifest), {
      encoding: "utf-8",
    });
  }
}

async function readManifestFile(): Promise<ManifestType> {
  await makeCacheDir();

  try {
    const content = await readFile(CACHE_MANIFEST_FILE, { encoding: "utf-8" });
    const manifest = JSON.parse(content) as ManifestType;

    if (manifest.version !== MANIFEST_VERSION) {
      throw new Error(
        `Unknown manifest version ${manifest.version}. Expected ${MANIFEST_VERSION}`,
      );
    }

    return manifest;
  } catch (err) {
    return { version: MANIFEST_VERSION, images: {} };
  }
}

let loadedManifestPromise: Promise<ManifestType>;

async function getManifest() {
  if (!loadedManifestPromise) {
    loadedManifestPromise = readManifestFile();
  }

  return loadedManifestPromise;
}

async function addToManifest(id: string, data: ManifestImageData) {
  const manifest = await getManifest();

  manifest.images[id] = data;

  writeManifestFile(manifest);
}

interface SaveImageOptions {
  id: string;
  url: string;
  /** Invalidation key. Most likely a "last modified" value */
  key: string;
  logger?: AstroIntegrationLogger;
}

/**
 * @param id Unique ID of the image
 * @param url URL of the image
 * @param key Invalidation key. Most likely a "last modified" value
 */
export async function saveImage({
  id,
  url,
  key,
  logger,
}: SaveImageOptions): Promise<void> {
  // Check if exists and matches
  const manifest = await getManifest();
  const existingEntry = manifest.images[id];
  if (existingEntry && existingEntry.key === key) {
    logger?.info(`Image ${id} already up to date, skipping`);
    return;
  }

  // Download
  logger?.info(`Fetching image ${id}`);
  const response = await fetch(url);
  let mimeType = response.headers.get("Content-Type");
  if (!mimeType) {
    throw new Error(`Image source ${url} did not have a Content-Type header`);
  }

  // Normalise JPEG mime type to the correct one.
  if (mimeType === "image/jpg") {
    mimeType = "image/jpeg";
  }

  const buffer = await response.arrayBuffer();

  // Write file
  const path = `${id}.${extension(mimeType)}`;
  await writeFile(join(CACHE_DIR, path), new Uint8Array(buffer));

  addToManifest(id, { key, url, path, mimeType });
}

export async function getSavedImage(id: string): Promise<ImageData> {
  const manifest = await getManifest();

  const entry = manifest.images[id];
  if (!entry) {
    throw new Error(`Unsaved image ID ${id}`);
  }

  const filePath = join(CACHE_DIR, entry.path);
  const buffer = await readFile(filePath);

  return { id, buffer: buffer.buffer as ArrayBuffer, mimeType: entry.mimeType };
}
