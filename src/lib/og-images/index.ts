import { renderAsync } from "@resvg/resvg-js";
import { readFile, writeFile } from "node:fs/promises";
import { join, posix, sep } from "node:path";
import pMemoize from "p-memoize";
import PQueue from "p-queue";
import satori from "satori";
import { DEV_IMAGE_DIR, IMAGE_DIR } from "../../components/Images/constants";
import { buildOgImageJsx } from "./components.tsx";
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from "./constants";

const getRobotoBuffer = pMemoize(() =>
  readFile(
    join(
      process.cwd(),
      "node_modules/@fontsource/roboto/files/roboto-latin-400-normal.woff",
    ),
  ),
);

const writeQueue = new PQueue({ concurrency: 3, throwOnTimeout: true });

export interface GenerateOgImageOptions {
  id: string;
  layout: "site" | "page" | "blog";
  title: string;
  backgroundImage?: { filePath: string; mimeType: string };
}

export interface GenerateOgImageResults {
  /** Path for browser to request image from */
  path: string;
  /** Path of the image file during the build */
  filePath: string;
  width: number;
  height: number;
  mimeType: string;
}

export async function generateOgImage(
  options: GenerateOgImageOptions,
): Promise<GenerateOgImageResults> {
  const { id } = options;

  const roboto = await getRobotoBuffer();

  const svg = await satori(await buildOgImageJsx(options), {
    fonts: [
      {
        name: "Roboto",
        data: roboto,
        weight: 400,
        style: "normal",
      },
    ],
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
  });

  const png = await renderAsync(svg, {
    background: "rgba(255, 255, 255, 1)",
    font: {
      // Satori renders text as SVG paths, so no fonts are necessary when rendering the PNG
      loadSystemFonts: false,
    },
    imageRendering: 0,
    dpi: 192,
  });
  const buffer = png.asPng();

  const filename = `${id}.png`;
  const filePath = join(DEV_IMAGE_DIR, filename);
  const path = join(IMAGE_DIR, filename);
  const pathForBrowser = `/${path.split(sep).join(posix.sep)}`;

  await writeQueue.add(async () => {
    await writeFile(filePath, buffer);
  });

  return {
    path: pathForBrowser,
    filePath,
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    mimeType: "image/png",
  };
}
