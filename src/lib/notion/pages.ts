import type {
  DataSourceObjectResponse,
  PageObjectResponse,
} from "@notionhq/client";
import { converter } from "culori";
import seedrandom from "seedrandom";
import { getPagePropertyByName, richTextToUnformattedString } from "./util";

export function getPageColorInfo(
  page: DataSourceObjectResponse | PageObjectResponse,
): { angle: number; overrideColor?: string } {
  const random = seedrandom(page.id);
  let angle = Math.round(random() * 360);

  const themeColorProperty = getPagePropertyByName(
    page,
    "Theme Color",
    "rich_text",
  );

  let overrideColor: string | undefined;
  if (themeColorProperty) {
    const plain = richTextToUnformattedString(themeColorProperty.rich_text);
    const hexMatch = plain.match(/^(#[0-9a-fA-F]{6})$/);
    if (hexMatch) {
      const oklch = converter("oklch")(hexMatch[1]);
      angle = oklch?.h ?? 0;
      overrideColor = hexMatch[1];
    }
  }

  return { angle, overrideColor };
}
