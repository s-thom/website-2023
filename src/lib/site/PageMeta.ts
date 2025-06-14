export interface PageMetaType {
  title: string;
  description?: string;
  url: string;
  images?: {
    url: string;
    mimeType: string;
    width: number;
    height: number;
  }[];
  rssUrl?: string;
  publishedDate?: string;
  modifiedDate?: string;
  authors?: {
    firstName: string;
    lastName?: string;
    url?: string;
  }[];
  article?: {
    type: "article" | "blog";
    tags?: string[];
  };
  noCrawl?: boolean;
}
