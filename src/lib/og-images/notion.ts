import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { GenerateOgImageOptions } from ".";
import { getImageInfo } from "../../components/Images/image";
import { getSavedImage } from "../../integrations/notion-loader";
import { getPageTitleComponents } from "../notion/titles";
import { richTextToUnformattedString } from "../notion/util";

async function getCoverImageFilePath(
  page: PageObjectResponse,
): Promise<GenerateOgImageOptions["backgroundImage"]> {
  if (!page.cover) {
    return undefined;
  }

  const imageInfo = await getImageInfo(
    `${page.id}_cover`,
    () => getSavedImage(`${page.id}_cover`),
    [],
    [1],
  );
  return {
    filePath: imageInfo.original.filePath,
    mimeType: imageInfo.original.mimeType,
  };
}

export async function getOgImageOptionsForNotionPage(
  page: PageObjectResponse,
): Promise<GenerateOgImageOptions> {
  const titleComponents = getPageTitleComponents(page);
  const pageTitle = richTextToUnformattedString(titleComponents);

  const backgroundImage = await getCoverImageFilePath(page);

  return {
    id: `${page.id}_og`,
    layout: "page", // TODO: Figure out how to determine page type
    title: pageTitle,
    backgroundImage,
  };
}
