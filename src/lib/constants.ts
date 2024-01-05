// This file contains things specific to my website, so if you re-use it you'll need to change these
export const SPACE_ID = "e0a1d437-085c-4280-8d31-2918df11590b";
export const ROOT_PAGE_ID = "25c54908-c86d-426c-a1c7-af314e09d74b";
export const BLOG_COLLECTION_ID = "2592db33-2b6e-47e0-925f-5eb313c7520e";
export const PAGES_COLLECTION_ID = "4e043a71-8fe5-48a1-b460-ed69366d567d";
export const ACTIVE_PROJECTS_COLLECTION_ID =
  "d04e2d18-e9d5-4bd9-b398-a0edbe844ee5";

// TODO: not have to use this
export const BLOG_PAGE_ID = "13389202-34aa-41c3-8bdd-dcda10f24840";

export const PAGE_PATH_PREFIX_OVERRIDES: Record<string, string> = {
  [BLOG_PAGE_ID]: "/blog",
  [ROOT_PAGE_ID]: "/",
  "f745c582-4881-4b70-badf-70b005f1bd72": "/projects", // TODO: Remove after deleting old version of site
};

export const PAGE_PATH_PREFIX_INVERSE_OVERRIDES = Object.fromEntries(
  Object.entries(PAGE_PATH_PREFIX_OVERRIDES).map(([k, v]) => [v, k]),
);

export const NOISY_LOGS = import.meta.env.NOISY_LOGS === "true";

/**
 * Pages/databases to ignore when listing all pages.
 * Adding items to this array will mean that they, and any children (*)
 * won't be able to be used as pages, as their slugs won't get generated.
 *
 * (*) Pages that are referred to by other pages that aren't ignored will still
 * be included.
 */
export const IGNORE_FROM_ALL = [
  "7737a4e6-0ff5-4170-b95a-6100471d0c0f",
  "10b11d8d-a09e-4707-ab22-bb6d768cb3fa",
];

export const IMAGE_OPTIMISATION_ALLOWED_DOMAINS = [
  "prod-files-secure.s3.us-west-2.amazonaws.com",
];
