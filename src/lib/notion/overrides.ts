import type { NotionOverrideableProps } from "../../components/notion/blocks/types";
import ProjectsCollection from "../../components/notion/overrides/projects/ProjectsCollection.astro";

export async function getComponentOverrides(
  id: string,
): Promise<NotionOverrideableProps["overrides"]> {
  switch (id) {
    case "f745c582-4881-4b70-badf-70b005f1bd72":
      return {
        child_database: ProjectsCollection,
      };
    default:
      return {};
  }
}
