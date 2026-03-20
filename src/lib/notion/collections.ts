import { getCollection, type CollectionEntry } from "astro:content";
import { createComparator } from "../../integrations/notion-loader/sort";

const PAGES_COMPARATOR = createComparator([
  { property: "Status", direction: "descending" },
  { property: "Published", direction: "descending" },
  { property: "Last edited time", direction: "descending" },
  { property: "Created", direction: "descending" },
  { timestamp: "created_time", direction: "descending" },
]);

const PROJECTS_COMPARATOR = createComparator([
  { property: "Status", direction: "ascending" },
  { property: "Sorting", direction: "descending" },
  { timestamp: "created_time", direction: "descending" },
]);

export async function getPagesCollection(
  filter?: (entry: CollectionEntry<"pages">) => unknown,
) {
  const pages = await getCollection("pages", filter);

  return pages.sort(PAGES_COMPARATOR);
}

export async function getProjectsCollection(
  filter?: (entry: CollectionEntry<"projects">) => unknown,
) {
  const projects = await getCollection("projects", filter);

  return projects.sort(PROJECTS_COMPARATOR);
}
