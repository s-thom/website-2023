import { StrictMode, Suspense, lazy, useEffect, useState } from "react";

// This file serves a weird purpose: being a generic React root while also lazily
// loading everything that actually matters. This is almost certainly not a good
// pattern to use, but here I am writing this code.
// Some rules:
// 1. Do not directly import any code that doesn't need to be.
// 2. Apart from React, the only direct imports must be type only.
// 3. React component imports must be lazy.

const StickerBook = lazy(() =>
  import("./StickerBook/components/StickerBook/StickerBook.tsx").then(
    (module) => ({
      default: module.StickerBook,
    }),
  ),
);

interface ComponentPropsMap {
  "sticker-book": {};
}

type LazyLoaderProps = {
  [K in keyof ComponentPropsMap]: {
    type: K;
    props: ComponentPropsMap[K];
  };
};

function LazyLoaderSwitch({
  type,
  props,
}: LazyLoaderProps[keyof ComponentPropsMap]) {
  switch (type) {
    case "sticker-book":
      return <StickerBook {...props} />;
    default:
      // eslint-disable-next-line no-console
      console.error(`Unknown component type ${type}`);
      return null;
  }
}

export function LazyLoader<T extends keyof ComponentPropsMap>(
  props: LazyLoaderProps[T],
) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <StrictMode>
      <Suspense>{isMounted && <LazyLoaderSwitch {...props} />}</Suspense>
    </StrictMode>
  );
}
