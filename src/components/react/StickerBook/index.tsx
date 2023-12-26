import { StrictMode, Suspense, lazy } from "react";

const StickerApp = lazy(() =>
  import("./StickerApp.tsx").then((module) => ({
    default: module.StickerApp,
  })),
);

export interface StickerBookProps {
  pageId: string;
}

export function StickerBook({ pageId }: StickerBookProps) {
  return (
    <StrictMode>
      <Suspense>
        <StickerApp pageId={pageId} />
      </Suspense>
    </StrictMode>
  );
}
