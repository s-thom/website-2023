import type {
  DatabaseObjectResponse,
  PageObjectResponse,
  PropertyItemObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

export function richTextToUnformattedString(
  components: RichTextItemResponse | RichTextItemResponse[],
): string {
  return [components]
    .flatMap((component) => component)
    .map((component) => component.plain_text)
    .join("");
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

export function getPagePropertyByName<
  T extends PropertyItemObjectResponse["type"],
>(
  page: PageObjectResponse | DatabaseObjectResponse,
  name: string,
  type: T,
): Extract<PropertyItemObjectResponse, { type: T }> | undefined {
  const property =
    (page?.properties?.[name] as PropertyItemObjectResponse | undefined) ??
    undefined;

  if (property?.type === type) {
    return property as Extract<PropertyItemObjectResponse, { type: T }>;
  }
  return undefined;
}

export function isPagePublished(
  page: PageObjectResponse | DatabaseObjectResponse,
) {
  const tagsProperty = getPagePropertyByName(page, "Tags", "multi_select");
  if (tagsProperty) {
    if (
      tagsProperty.multi_select.find((option) => option.name === "unlisted")
    ) {
      return false;
    }
  }

  const publishedProperty = getPagePropertyByName(page, "Published", "date");
  if (!(publishedProperty && publishedProperty.date)) {
    return true;
  }

  const date = new Date(publishedProperty.date.start);
  return date.getDate() <= Date.now();
}

export function isPageListed(
  page: PageObjectResponse | DatabaseObjectResponse,
) {
  const property = getPagePropertyByName(page, "Tags", "multi_select");
  if (!property) {
    return true;
  }

  return !property.multi_select.find((option) => option.name === "unlisted");
}
