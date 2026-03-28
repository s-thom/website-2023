import { isFullPageOrDataSource } from "@notionhq/client";
import type {
  DataSourceObjectResponse,
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import {
  getPagePropertyByName,
  normalizeTitle,
  richTextToUnformattedString,
} from "./util";

export function getPageTitleComponents(
  page: DataSourceObjectResponse | PageObjectResponse,
): RichTextItemResponse[] {
  if (!isFullPageOrDataSource(page)) {
    throw new Error(
      `Must be a full page/database to get title (${
        (page as DataSourceObjectResponse).id
      })`,
    );
  }

  // If a title property is on the object, we can return early
  if (page.object === "data_source") {
    return page.title;
  }

  // Find the title property of the page
  const properties = Object.values(
    page.properties,
  ) as unknown as (typeof page.properties)[""][];
  const titleProperty = properties.find(
    (property) => property.type === "title",
  );
  if (!titleProperty) {
    throw new Error(`Page ${page.id} has no title`);
  }

  if (!Array.isArray(titleProperty.title)) {
    return [];
  }
  return titleProperty.title;
}

export function getUrlSlugForPage(
  page: DataSourceObjectResponse | PageObjectResponse,
) {
  if (
    page.object === "page" && // TODO: figure out what to do about database type pages
    (page.parent.type === "data_source_id" ||
      page.parent.type === "database_id")
  ) {
    const slugProperty =
      getPagePropertyByName(page, "Slug", "rich_text") ??
      getPagePropertyByName(page, "slug", "rich_text");
    if (slugProperty) {
      const slug = richTextToUnformattedString(slugProperty.rich_text);
      if (slug) {
        return slug;
      }
    }
  }

  const title = richTextToUnformattedString(getPageTitleComponents(page));
  const formattedTitle = normalizeTitle(title);
  return formattedTitle;
}
