// This file contains things specific to my website, so if you re-use it you'll need to change these
export const SPACE_ID = "e0a1d437-085c-4280-8d31-2918df11590b";
export const ROOT_PAGE_ID = "25c54908-c86d-426c-a1c7-af314e09d74b";
export const BLOG_COLLECTION_ID = "2f724a36-d61f-4f05-9a51-5d7f464baf01";

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
