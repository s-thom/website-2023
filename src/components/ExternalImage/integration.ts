import type { AstroIntegration } from "astro";
import { cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import {
  DEV_IMAGE_DIR,
  DIST_IMAGE_DIR,
  IMAGE_MANIFEST_FILENAME,
} from "./constants";

export default function sthomExternalImages(): AstroIntegration {
  return {
    name: "sthom-external-images",
    hooks: {
      "astro:build:done": async () => {
        await Promise.all([
          mkdir(DEV_IMAGE_DIR, { recursive: true }),
          mkdir(DIST_IMAGE_DIR, { recursive: true }),
        ]);

        await cp(DEV_IMAGE_DIR, DIST_IMAGE_DIR, { recursive: true });
        await rm(join(DIST_IMAGE_DIR, IMAGE_MANIFEST_FILENAME), {
          force: true,
        });
      },
    },
  };
}
