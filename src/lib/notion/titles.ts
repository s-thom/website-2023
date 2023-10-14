import { isFullPageOrDatabase } from "@notionhq/client";
import type {
  DatabaseObjectResponse,
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { normalizeTitle, richTextToUnformattedString } from "./util";

export function getPageTitleComponents(
  page: DatabaseObjectResponse | PageObjectResponse,
): RichTextItemResponse[] {
  if (!isFullPageOrDatabase(page)) {
    throw new Error(
      `Must be a full page/database to get title (${
        (page as DatabaseObjectResponse).id
      })`,
    );
  }

  // If a title property is on the object, we can return early
  if (page.object === "database" && page.title) {
    return page.title;
  }

  // Find the title property of the page
  const properties = Object.values(
    page.properties,
  ) as unknown as (typeof page.properties)[""][];
  const titleProperty = properties.find(
    (property) => property.type === "title",
  );
  if (!titleProperty || titleProperty.type !== "title") {
    throw new Error(`Page ${page.id} has no title`);
  }

  if (!Array.isArray(titleProperty.title)) {
    return [];
  }
  return titleProperty.title;
}

export function getUrlSlugForPage(
  page: DatabaseObjectResponse | PageObjectResponse,
) {
  const title = richTextToUnformattedString(getPageTitleComponents(page));
  const formattedTitle = normalizeTitle(title);

  if (import.meta.env.DEV) {
    return `${formattedTitle}-${page.id.replace("-", "")}`;
  }

  return formattedTitle;
}
