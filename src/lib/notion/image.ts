import { type ImageInfo } from "../../components/Images/constants";
import { getImageInfo } from "../../components/Images/image";
import { getSavedImage } from "../../integrations/notion-loader";

export async function getNotionImageInfo(
  id: string,
  widths: number[],
  densities: number[],
): Promise<ImageInfo | undefined> {
  const imageInfo = await getImageInfo(
    id,
    () => getSavedImage(id),
    widths,
    densities,
  );

  return imageInfo;
}
