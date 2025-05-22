import type {
  DatabaseObjectResponse,
  PageObjectResponse,
  PropertyItemObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { join } from "node:path/posix";
import type { PageInfo } from "../../integrations/notion-loader/api";

export function richTextToUnformattedString(
  components: RichTextItemResponse | RichTextItemResponse[],
): string {
  return [components]
    .flatMap((component) => component)
    .map((component) => component.plain_text)
    .join("");
}

export function richTextToMarkdownString(
  components: RichTextItemResponse | RichTextItemResponse[],
): string {
  return [components]
    .flatMap((component) => component)
    .map((component) => {
      let decoration = "";

      if (component.annotations.bold) {
        decoration += "**";
      }
      if (component.annotations.italic) {
        decoration += "_";
      }
      if (component.annotations.strikethrough) {
        decoration += "~~";
      }
      if (component.annotations.code) {
        decoration += "`";
      }

      let prefix = "";
      let suffix = "";
      if (component.type === "text" && component.text.link) {
        const link = component.text.link.url;
        prefix += `[`;
        suffix += `](${link})`;
      }

      return `${decoration}${prefix}${component.plain_text}${suffix}${decoration}`;
    })
    .join("");
}

export function toProperUuid(str: string): string {
  const lower = str.toLowerCase();
  if (
    lower.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    )
  ) {
    return lower;
  }

  const segmentsMatch = lower.match(
    /^([0-9a-f]{8})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{12})$/,
  );
  if (!segmentsMatch) {
    throw new Error(`${str} is not like a UUID`);
  }

  return `${segmentsMatch[1]}-${segmentsMatch[2]}-${segmentsMatch[3]}-${segmentsMatch[4]}-${segmentsMatch[5]}`;
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

export function getPageFullPathFromInfo(
  page: PageInfo<{ Type: { name: string } | null }>,
): string {
  // TODO: Figure out how to not have blog slugs relative to blog path.
  // This will involve figuring out which layout to use in the catch all path,
  // and specifying all blog paths manually since they'll no longer be purely generated
  // otherwise we'd lose the blog path segment.
  if (page.properties.Type?.name === "blog") {
    return join("/", page.slug);
  }

  return join("/", page.slug);
}
