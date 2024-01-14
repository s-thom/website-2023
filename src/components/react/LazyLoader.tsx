import { StrictMode, Suspense, lazy, useEffect, useState } from "react";
import type { StickerAppProps } from "./StickerBook/components/StickerDragZones/StickerApp.tsx";
import type { BlogNavUnlockProps } from "./StickerBook/unlocks/BlogNavUnlock.tsx";
import type { PageViewUnlockProps } from "./StickerBook/unlocks/PageViewUnlock.tsx";

// This file serves a weird purpose: being a generic React root while also lazily
// loading everything that actually matters. This is almost certainly not a good
// pattern to use, but here I am writing this code.
// Some rules:
// 1. Do not directly import any code that doesn't need to be.
// 2. Apart from React, the only direct imports must be type only.
// 3. React component imports must be lazy.

const BlogNavUnlock = lazy(() =>
  import("./StickerBook/unlocks/BlogNavUnlock.tsx").then((module) => ({
    default: module.BlogNavUnlock,
  })),
);
const FeatureToggle = lazy(() =>
  import("./StickerBook/components/FeatureToggle/index.tsx").then((module) => ({
    default: module.FeatureToggle,
  })),
);
const PageViewUnlock = lazy(() =>
  import("./StickerBook/unlocks/PageViewUnlock.tsx").then((module) => ({
    default: module.PageViewUnlock,
  })),
);
const StickerApp = lazy(() =>
  import("./StickerBook/components/StickerDragZones/StickerApp.tsx").then(
    (module) => ({
      default: module.StickerApp,
    }),
  ),
);
const StickerBook = lazy(() =>
  import("./StickerBook/components/StickerBook/StickerBook.tsx").then(
    (module) => ({
      default: module.StickerBook,
    }),
  ),
);
const StickerBookFreeStickersUnlock = lazy(() =>
  import("./StickerBook/unlocks/StickerBookFreeStickersUnlock.tsx").then(
    (module) => ({
      default: module.StickerBookFreeStickersUnlock,
    }),
  ),
);
const StickerBookUniqueUnlock = lazy(() =>
  import("./StickerBook/unlocks/StickerBookUniqueUnlock.tsx").then(
    (module) => ({
      default: module.StickerBookUniqueUnlock,
    }),
  ),
);

interface ComponentPropsMap {
  "sticker-blog-nav-unlock": BlogNavUnlockProps;
  "sticker-page-view-unlock": PageViewUnlockProps;
  "sticker-book": {};
  "sticker-book-free-unlock": {};
  "sticker-book-unique-unlock": {};
  "sticker-feature-toggle": object;
  "sticker-app": StickerAppProps;
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
    case "sticker-app":
      return <StickerApp {...props} />;
    case "sticker-blog-nav-unlock":
      return <BlogNavUnlock {...props} />;
    case "sticker-book":
      return <StickerBook {...props} />;
    case "sticker-book-free-unlock":
      return <StickerBookFreeStickersUnlock {...props} />;
    case "sticker-book-unique-unlock":
      return <StickerBookUniqueUnlock {...props} />;
    case "sticker-feature-toggle":
      return <FeatureToggle {...props} />;
    case "sticker-page-view-unlock":
      return <PageViewUnlock {...props} />;
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
