import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { GenerateOgImageOptions } from ".";
import { fetchImage } from "../../components/Images/fetchImage";
import { getImageInfo } from "../../components/Images/image";
import { getPageTitleComponents } from "../notion/titles";
import { richTextToUnformattedString } from "../notion/util";

async function getCoverImageFilePath(
  page: PageObjectResponse,
): Promise<GenerateOgImageOptions["backgroundImage"]> {
  if (!page.cover) {
    return undefined;
  }

  let url: string;
  switch (page.cover.type) {
    case "external":
      url = page.cover.external.url;
      break;
    case "file":
      url = page.cover.file.url;
      break;
    default:
      return undefined;
  }

  const imageInfo = await getImageInfo(
    `${page.id}-cover`,
    () => fetchImage(url),
    [],
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
