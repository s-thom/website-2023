import type { LinkInfo } from "./LinkInfo";
import type { PageMetaType } from "./PageMeta";

export interface PageLayoutProps {
  id: string;
  meta: PageMetaType;
  breadcrumbs?: LinkInfo[];
}
