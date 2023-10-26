import type { NotionOverrideableProps } from "../../components/notion/blocks/types";

export function getComponentOverrides(
  id: string,
): NotionOverrideableProps["overrides"] {
  switch (id) {
    default:
      return {};
  }
}
