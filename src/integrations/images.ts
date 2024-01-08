import type { AstroIntegration } from "astro";
import { cp, mkdir } from "node:fs/promises";
import { DEV_IMAGE_DIR, DIST_IMAGE_DIR } from "../components/Images/constants";

export default function sthomImages(): AstroIntegration {
  return {
    name: "sthom-images",
    hooks: {
      "astro:build:done": async () => {
        await Promise.all([
          mkdir(DEV_IMAGE_DIR, { recursive: true }),
          mkdir(DIST_IMAGE_DIR, { recursive: true }),
        ]);

        await cp(DEV_IMAGE_DIR, DIST_IMAGE_DIR, { recursive: true });
      },
    },
  };
}
