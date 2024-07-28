import type { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { type ImageInfo } from "../../components/Images/constants";
import { fetchImage } from "../../components/Images/fetchImage";
import { getImageInfo } from "../../components/Images/image";

export async function getNotionImageInfo(
  id: string,
  image: NonNullable<DatabaseObjectResponse["cover"]>,
  widths: number[],
  densities: number[],
): Promise<ImageInfo | undefined> {
  let url: string | undefined;
  switch (image.type) {
    case "external":
      url = image.external.url;
      break;
    case "file":
      url = image.file.url;
      break;
    default:
      url = undefined;
  }

  if (url === undefined) {
    return undefined;
  }

  const imageInfo = await getImageInfo(
    id,
    () => fetchImage(url),
    widths,
    densities,
  );

  return imageInfo;
}
