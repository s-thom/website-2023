import fs from "node:fs";
import {
  DEV_IMAGE_DIR,
  IMAGE_MANIFEST_PATH,
  type ImageInfo,
} from "./constants";

type ImageMap = Record<string, ImageInfo>;

function createManifestDieSync() {
  try {
    fs.statSync(DEV_IMAGE_DIR);
  } catch (err) {
    fs.mkdirSync(DEV_IMAGE_DIR, { recursive: true });
  }
}

function getManifestSync(): ImageMap {
  createManifestDieSync();

  try {
    const content = fs.readFileSync(IMAGE_MANIFEST_PATH, { encoding: "utf-8" });
    const map = JSON.parse(content) as ImageMap;
    return map;
  } catch (err) {
    return {};
  }
}

export function getFromManifest(id: string): ImageInfo | undefined {
  createManifestDieSync();

  const manifest = getManifestSync();
  if (manifest[id]) {
    return manifest[id];
  }

  return undefined;
}

export function addToManifest(url: string, info: ImageInfo) {
  createManifestDieSync();

  const manifest = getManifestSync();
  manifest[url] = info;

  try {
    fs.statSync(DEV_IMAGE_DIR);
  } catch (err) {
    fs.mkdirSync(DEV_IMAGE_DIR, { recursive: true });
  }

  fs.writeFileSync(IMAGE_MANIFEST_PATH, JSON.stringify(manifest), {
    encoding: "utf-8",
  });
}
