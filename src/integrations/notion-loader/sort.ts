import type {
  PageObjectResponse,
  QueryDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints";
import type { infer as zInfer } from "astro/zod";
import type { CollectionEntry, CollectionKey } from "astro:content";
import { richTextToUnformattedString } from "../../lib/notion/util";
import type { propertySchemas } from "./schema";

type Comparator<T> = (a: T, b: T) => number;

function reverse<T>(comparator: Comparator<T>): Comparator<T> {
  return (a, b) => comparator(b, a);
}

function booleanComparator<C extends CollectionKey>(
  test: (value: CollectionEntry<C>) => boolean,
): Comparator<CollectionEntry<C>> {
  return (a: CollectionEntry<C>, b: CollectionEntry<C>) => {
    const aTest = test(a);
    const bTest = test(b);
    if (aTest && !bTest) {
      return -1;
    }
    if (!aTest && bTest) {
      return 1;
    }
    return 0;
  };
}

function numberComparator<C extends CollectionKey>(
  getter: (value: CollectionEntry<C>) => number,
): Comparator<CollectionEntry<C>> {
  return (a: CollectionEntry<C>, b: CollectionEntry<C>) => {
    const aValue = getter(a);
    const bValue = getter(b);
    return aValue - bValue;
  };
}

function stringComparator<C extends CollectionKey>(
  getter: (value: CollectionEntry<C>) => string,
): Comparator<CollectionEntry<C>> {
  return (a: CollectionEntry<C>, b: CollectionEntry<C>) => {
    const aString = getter(a);
    const bString = getter(b);
    return aString.localeCompare(bString);
  };
}

function dateStringComparator<C extends CollectionKey>(
  getter: (value: CollectionEntry<C>) => string,
): Comparator<CollectionEntry<C>> {
  return (a: CollectionEntry<C>, b: CollectionEntry<C>) => {
    const aDate = new Date(getter(a));
    const bDate = new Date(getter(b));
    return aDate.getTime() - bDate.getTime();
  };
}

type PropertyMap = {
  [k in keyof typeof propertySchemas]: zInfer<
    ReturnType<(typeof propertySchemas)[k]>
  >;
};

function entryPropertyComparator<C extends CollectionKey>(
  propertyName: string,
): Comparator<CollectionEntry<C>> {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  function getProperty<K extends keyof PropertyMap>(
    entry: CollectionEntry<C>,
  ): PropertyMap[K] {
    const properties = entry.data.properties;
    const property: PropertyMap[keyof PropertyMap] =
      properties[propertyName as never];

    return property;
  }

  function getComparator(
    propertyInfo: PageObjectResponse["properties"][string],
  ): Comparator<CollectionEntry<C>> {
    switch (propertyInfo.type) {
      case "number":
        return numberComparator<C>(
          (entry) => getProperty<typeof propertyInfo.type>(entry) ?? 0,
        );
      case "date":
        return dateStringComparator<C>(
          (entry) => getProperty<typeof propertyInfo.type>(entry)?.start ?? "",
        );
      case "title":
        return stringComparator<C>((entry) =>
          richTextToUnformattedString(
            getProperty<typeof propertyInfo.type>(entry),
          ),
        );
      case "email":
        return stringComparator<C>(
          (entry) => getProperty<typeof propertyInfo.type>(entry) ?? "",
        );
      case "url":
        return stringComparator<C>(
          (entry) => getProperty<typeof propertyInfo.type>(entry) ?? "",
        );
      case "select":
        return stringComparator<C>(
          (entry) => getProperty<typeof propertyInfo.type>(entry)?.name ?? "",
        );
      case "multi_select":
        return stringComparator<C>((entry) =>
          getProperty<typeof propertyInfo.type>(entry)
            .map((i) => i.name)
            .join(","),
        );
      case "status":
        return stringComparator<C>(
          (entry) => getProperty<typeof propertyInfo.type>(entry)?.name ?? "",
        );
      case "phone_number":
        return stringComparator<C>(
          (entry) => getProperty<typeof propertyInfo.type>(entry) ?? "",
        );
      case "checkbox":
        return booleanComparator<C>((entry) =>
          getProperty<typeof propertyInfo.type>(entry),
        );
      case "files":
        break;
      case "created_by":
        break;
      case "created_time":
        return dateStringComparator((entry) => entry.data.page.created_time);
      case "last_edited_by":
        break;
      case "last_edited_time":
        return dateStringComparator(
          (entry) => entry.data.page.last_edited_time,
        );
      case "formula":
        break;
      case "button":
        break;
      case "unique_id":
        return stringComparator<C>((entry) => {
          const data = getProperty<typeof propertyInfo.type>(entry);
          return `${data.prefix ?? ""}-${data.number ?? 0}`;
        });
      case "verification":
        break;
      case "rich_text":
        return stringComparator<C>((entry) =>
          richTextToUnformattedString(
            getProperty<typeof propertyInfo.type>(entry),
          ),
        );
      case "people":
        break;
      case "relation":
        break;
      case "rollup":
        break;
      default:
    }

    return () => 0;
  }

  return (a: CollectionEntry<C>, b: CollectionEntry<C>) => {
    const comparator = getComparator(a.data.page.properties[propertyName]);
    return comparator(a, b);
  };
}

function entryTimestampCompare<C extends CollectionKey>(
  timestamp: "created_time" | "last_edited_time",
): Comparator<CollectionEntry<C>> {
  return dateStringComparator((entry) => entry.data.page[timestamp]);
}

function combineComparators<T>(comparators: Comparator<T>[]): Comparator<T> {
  return (a: T, b: T) => {
    for (const comparator of comparators) {
      const result = comparator(a, b);
      if (result !== 0) {
        return result;
      }
    }

    return 0;
  };
}

export function createComparator<C extends CollectionKey>(
  sorts: NonNullable<QueryDatabaseParameters["sorts"]>,
): Comparator<CollectionEntry<C>> {
  const comparators = sorts.map<Comparator<CollectionEntry<C>>>((sort) => {
    const baseComparator =
      "property" in sort
        ? entryPropertyComparator(sort.property)
        : entryTimestampCompare(sort.timestamp);

    return sort.direction === "ascending"
      ? baseComparator
      : reverse(baseComparator);
  });
  return combineComparators(comparators);
}
