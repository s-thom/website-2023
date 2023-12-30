import type { NotionOverrideableProps } from "../../components/notion/blocks/types";
import BlogCollection from "../../components/notion/overrides/blog/BlogCollection.astro";
import ProjectsCollection from "../../components/notion/overrides/projects/ProjectsCollection.astro";

export async function getComponentOverrides(
  id: string,
): Promise<NotionOverrideableProps["overrides"]> {
  switch (id) {
    case "f745c582-4881-4b70-badf-70b005f1bd72":
      return {
        child_database: ProjectsCollection,
      };
    case "b749d283-ebbd-4b6f-92d4-13301479c2da": // Both blog pages end up matching here
    case "13389202-34aa-41c3-8bdd-dcda10f24840":
      return {
        child_database: BlogCollection,
      };
    default:
      return {};
  }
}
