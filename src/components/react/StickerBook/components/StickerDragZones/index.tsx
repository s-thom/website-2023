import { StrictMode, Suspense, lazy } from "react";

const StickerApp = lazy(() =>
  import("./StickerApp.tsx").then((module) => ({
    default: module.StickerApp,
  })),
);

export interface StickerDragZonesProps {
  pageId: string;
}

export function StickerDragZones({ pageId }: StickerDragZonesProps) {
  return (
    <StrictMode>
      <Suspense>
        <StickerApp pageId={pageId} />
      </Suspense>
    </StrictMode>
  );
}
