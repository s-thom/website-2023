import type {
  DatabaseObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { getBlockChildren } from "./caches";

// An estimate
const WORDS_PER_MINUTE = 250;

export async function estimateReadingTime(
  page: PageObjectResponse | DatabaseObjectResponse,
): Promise<{ words: number; minutes: number }> {
  const children = await getBlockChildren(page.id);
  const richTextSegments = children.flatMap((child) => {
    switch (child.type) {
      case "paragraph":
        return child.paragraph.rich_text;
        break;
      case "heading_1":
        return child.heading_1.rich_text;
        break;
      case "heading_2":
        return child.heading_2.rich_text;
        break;
      case "heading_3":
        return child.heading_3.rich_text;
        break;
      case "bulleted_list_item":
        return child.bulleted_list_item.rich_text;
        break;
      case "numbered_list_item":
        return child.numbered_list_item.rich_text;
        break;
      case "quote":
        return child.quote.rich_text;
        break;
      case "to_do":
        return child.to_do.rich_text;
        break;
      case "toggle":
        return child.toggle.rich_text;
        break;
      case "callout":
        return child.callout.rich_text;
        break;
      default:
        return [];
    }
  });

  const fullString = richTextSegments
    .map((component) => component.plain_text)
    .join(" ");
  const words = fullString.split(/\W+/);
  const rawMinutes = words.length / WORDS_PER_MINUTE;

  return {
    words: words.length,
    minutes: Math.ceil(rawMinutes),
  };
}
