import type { AstroIntegration } from "astro";
import { cp, mkdir } from "node:fs/promises";
import { join } from "node:path";
import PQueue from "p-queue";
import sharp, { type Sharp } from "sharp";

const convertQueue = new PQueue({ concurrency: 3, throwOnTimeout: true });

interface IconSpec {
  name: string;
  size: number;
  mask?: string;
}

const MASK_SIZE = 512;

const ICONS_TO_GENERATE: IconSpec[] = [
  { name: "icon-96x96.png", size: 96, mask: "circle" },
  { name: "icon-144x144.png", size: 144, mask: "circle" },
  { name: "icon-192x192.png", size: 192, mask: "circle" },
  { name: "icon-256x256.png", size: 256, mask: "circle" },
  { name: "icon-512x512.png", size: 512, mask: "circle" },
  { name: "icon-512x512-maskable.png", size: 512 },
  { name: "apple-icon-144x144.png", size: 144, mask: "ios" },
  { name: "apple-icon-180x180.png", size: 180, mask: "ios" },
  { name: "apple-icon-192x192.png", size: 192, mask: "ios" },
  { name: "apple-icon-512x512.png", size: 512, mask: "ios" },
  { name: "favicon-16x16.png", size: 16, mask: "circle" },
  { name: "favicon-64x64.png", size: 64, mask: "circle" },
  { name: "favicon-96x96.png", size: 96, mask: "circle" },
  { name: "favicon-128x128.png", size: 128, mask: "circle" },
];

const circleMaskSvg = `
<svg height="${MASK_SIZE}" width="${MASK_SIZE}">
  <circle
    cx="${MASK_SIZE / 2}"
    cy="${MASK_SIZE / 2}"
    r="${MASK_SIZE / 2}"
    fill-opacity="1"
  />
</svg>
`;
const circleMaskBuffer = await sharp(Buffer.from(circleMaskSvg), {
  density: 1,
})
  .resize(MASK_SIZE)
  .png();

const iosMaskSvg = `
<svg height="${MASK_SIZE}" width="${MASK_SIZE}">
  <rect width="${MASK_SIZE}" height="${MASK_SIZE}" rx="120" />
</svg>
`;
const iosMaskBuffer = await sharp(Buffer.from(iosMaskSvg), {
  density: 1,
})
  .resize(MASK_SIZE)
  .png();

const masks = {
  circle: circleMaskBuffer,
  ios: iosMaskBuffer,
};

export const ICON_DIR = "static/icons";
export const DEV_ICON_DIR = join(process.cwd(), "public", ICON_DIR);
export const DIST_ICON_DIR = join(process.cwd(), "dist", ICON_DIR);
export const DEV_FAVICON_FILE = join(process.cwd(), "public", "favicon.ico");
export const DIST_FAVICON_FILE = join(process.cwd(), "dist", "favicon.ico");

async function generateIcon(sharpInstance: Sharp, spec: IconSpec) {
  let clone = sharpInstance.clone();

  const mask = spec.mask && (masks as any)[spec.mask];
  if (mask) {
    clone = clone.composite([
      {
        input: await mask.clone().resize(spec.size, spec.size).toBuffer(),
        blend: "dest-in",
      },
    ]);
  }
  clone = clone.resize(spec.size, spec.size);

  clone.toFile(join(DEV_ICON_DIR, spec.name));
}

async function generateAllIcons(src: string) {
  await Promise.all([
    mkdir(DEV_ICON_DIR, { recursive: true }),
    mkdir(DIST_ICON_DIR, { recursive: true }),
  ]);

  const sharpInstance = sharp(src).resize(MASK_SIZE);

  await convertQueue.addAll(
    ICONS_TO_GENERATE.map((spec) => () => generateIcon(sharpInstance, spec)),
  );

  // TODO: Generate favicon. Sharp doesn't support the format, so this is still
  // a manual process.
}

async function copyFilesToDist() {
  await Promise.all([
    mkdir(DEV_ICON_DIR, { recursive: true }),
    mkdir(DIST_ICON_DIR, { recursive: true }),
  ]);

  await cp(DEV_ICON_DIR, DIST_ICON_DIR, { recursive: true });
  await cp(DEV_FAVICON_FILE, DIST_FAVICON_FILE);
}

export interface SthomFaviconOptions {
  src: string;
}

export default function sthomFavicon({
  src,
}: SthomFaviconOptions): AstroIntegration {
  return {
    name: "sthom-favicon",
    hooks: {
      "astro:server:start": async ({ logger }) => {
        logger.info("Generating icons");
        await generateAllIcons(src);
        logger.info("Done");
      },
      "astro:build:done": async ({ logger }) => {
        logger.info("Generating icons");
        await generateAllIcons(src);
        logger.info("Copying icons");
        await copyFilesToDist();
        logger.info("Done");
      },
    },
  };
}
