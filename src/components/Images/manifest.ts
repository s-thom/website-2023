import { mkdir, readFile, writeFile } from "node:fs/promises";
import { NOISY_LOGS } from "../../lib/constants";
import {
  CACHE_IMAGE_DIR,
  DEV_IMAGE_DIR,
  IMAGE_MANIFEST_PATH,
  type ImageInfo,
} from "./constants";

const MANIFEST_VERSION = 5;

interface ManifestType {
  version: number;
  images: Record<string, ImageInfo>;
}

async function createManifestDir() {
  await mkdir(CACHE_IMAGE_DIR, { recursive: true });
  await mkdir(DEV_IMAGE_DIR, { recursive: true });
}

async function readManifestFile(): Promise<ManifestType> {
  await createManifestDir();

  try {
    const content = await readFile(IMAGE_MANIFEST_PATH, { encoding: "utf-8" });
    const manifest = JSON.parse(content) as ManifestType;

    if (manifest.version !== MANIFEST_VERSION) {
      throw new Error(
        `Unknown manifest version ${manifest.version}. Expected ${MANIFEST_VERSION}`,
      );
    }

    return manifest;
  } catch (err) {
    if (NOISY_LOGS) {
      // eslint-disable-next-line no-console
      console.warn(err);
    }
    return { version: MANIFEST_VERSION, images: {} };
  }
}

let shouldWriteManifest = false;
async function writeManifestFile(manifest: ManifestType) {
  if (shouldWriteManifest) {
    return;
  }
  shouldWriteManifest = true;

  await createManifestDir();

  while (shouldWriteManifest) {
    shouldWriteManifest = false;

    // eslint-disable-next-line no-await-in-loop
    await writeFile(IMAGE_MANIFEST_PATH, JSON.stringify(manifest), {
      encoding: "utf-8",
    });
  }
}

let loadedManifest: ManifestType = undefined as any;
const loadedManifestPromise = readManifestFile().then((manifest) => {
  loadedManifest = manifest;
});

export async function getManifest(): Promise<ManifestType> {
  await loadedManifestPromise;
  return loadedManifest;
}

export async function addToManifest(id: string, info: ImageInfo) {
  await loadedManifestPromise;

  const existingImageInfo = loadedManifest.images[id];
  if (!existingImageInfo) {
    loadedManifest.images[id] = info;
    return;
  }

  if (existingImageInfo.digest !== info.digest) {
    throw new Error(`Entry for ID ${id} did not match digest`);
  }

  for (const format of info.formats) {
    const existingFormat = existingImageInfo.formats.find(
      (f) => f.id === format.id,
    );
    if (!existingFormat) {
      existingImageInfo.formats.push(format);
      continue;
    }

    for (const size of format.sizes) {
      const existingSize = existingFormat.sizes.find(
        (s) => s.width === size.width,
      );
      if (!existingSize) {
        existingFormat.sizes.push(size);
        continue;
      }

      if (size.path === existingSize.path) {
        continue;
      }

      throw new Error(
        `ID ${id} format ${format.id} already has a size ${size.width} in the manifest with a different path`,
      );
    }
  }

  writeManifestFile(loadedManifest);
}

export function removeFromManifest(id: string) {
  if (loadedManifest.images[id]) {
    delete loadedManifest.images[id];
  }

  writeManifestFile(loadedManifest);
}
