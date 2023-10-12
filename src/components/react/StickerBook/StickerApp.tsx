import { StrictMode, Suspense, lazy } from "react";

const StickerContainer = lazy(() =>
  import("./StickerContainer.tsx").then((module) => ({
    default: module.StickerContainer,
  })),
);

export interface StickerAppProps {
  id: string;
}

export function StickerApp({ id }: StickerAppProps) {
  return (
    <StrictMode>
      <Suspense>
        <StickerContainer id={id} />
      </Suspense>
    </StrictMode>
  );
}
