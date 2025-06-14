import type { StickerTypes } from "../../stickers/stickers";
import type { LinkInfo } from "./LinkInfo";
import type { PageMetaType } from "./PageMeta";

export interface PageLayoutProps {
  id: string;
  meta: PageMetaType;
  breadcrumbs?: LinkInfo[];
  stickers: {
    enabled: boolean;
    unlockOnScroll?: boolean;
    special?: StickerTypes;
  };
}
