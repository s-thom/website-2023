import type {
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

export function richTextToUnformattedString(
  components: RichTextItemResponse[],
): string {
  return components.map((component) => component.plain_text).join("");
}

export function normalizeTitle(title?: string | null): string {
  // https://github.com/NotionX/react-notion-x/blob/master/packages/notion-utils/src/normalize-title.ts
  return (title || "")
    .replace(/ /g, "-")
    .replace(
      /[^a-zA-Z0-9-\u4e00-\u9FFF\u3041-\u3096\u30A1-\u30FC\u3000-\u303F]/g,
      "",
    )
    .replace(/--/g, "-")
    .replace(/-$/, "")
    .replace(/^-/, "")
    .trim()
    .toLowerCase();
}

type DatabasePropertyConfigResponse = PageObjectResponse["properties"][""];

export function getPagePropertyByName(
  page: PageObjectResponse,
  name: string,
): DatabasePropertyConfigResponse | undefined {
  return page.properties[name] ?? undefined;
}
