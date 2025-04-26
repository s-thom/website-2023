import clsx from "clsx";
import {
  lazy,
  startTransition,
  Suspense,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { LoadingPanelContent } from "./LoadingPanelContent.tsx";
import "./panel.css";

const useIdempotentLayoutEffect =
  "window" in globalThis ? useLayoutEffect : useEffect;

const SettingsPanelContent = lazy(() =>
  import("./SettingsPanelContent.tsx").then((module) => ({
    default: module.SettingsPanelContent,
  })),
);
const StickersPanelContent = lazy(() =>
  import("./StickersPanelContent.tsx").then((module) => ({
    default: module.StickersPanelContent,
  })),
);

type PanelTypes = "settings" | "stickers" | "none";

export function Panel() {
  const [isClient, setIsClient] = useState(false);
  useIdempotentLayoutEffect(() => {
    setIsClient(true);
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<PanelTypes>("none");
  const [hasLoaded, setHasLoaded] = useState<
    Partial<Record<PanelTypes, boolean>>
  >({});

  const togglePanel = (type: PanelTypes) => {
    if (isOpen && type === selectedPanel) {
      setIsOpen(false);
    } else {
      setIsOpen(true);

      if (hasLoaded[type]) {
        startTransition(() => {
          setSelectedPanel(type);
        });
      } else {
        setSelectedPanel(type);
        setHasLoaded((prev) => ({ ...prev, [type]: true }));
      }
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className={clsx("side-panel", isOpen && "open")}>
      <button
        type="button"
        className={clsx("side-panel-handle")}
        aria-label="Toggle preferences"
        style={{ "--handle-index": 0 } as any}
        onClick={() => togglePanel("settings")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 7h-9" />
          <path d="M14 17H5" />
          <circle cx="17" cy="17" r="3" />
          <circle cx="7" cy="7" r="3" />
        </svg>
      </button>
      <button
        type="button"
        className={clsx("side-panel-handle")}
        aria-label="Toggle stickers"
        style={{ "--handle-index": 1 } as any}
        onClick={() => togglePanel("stickers")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 8.2A2.22 2.22 0 0 0 13.8 6c-.8 0-1.4.3-1.8.9-.4-.6-1-.9-1.8-.9A2.22 2.22 0 0 0 8 8.2c0 .6.3 1.2.7 1.6A226.652 226.652 0 0 0 12 13a404 404 0 0 0 3.3-3.1 2.413 2.413 0 0 0 .7-1.7" />
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
        </svg>
      </button>
      <div className={clsx("side-panel-content")}>
        <Suspense fallback={<LoadingPanelContent />}>
          {selectedPanel === "settings" && <SettingsPanelContent />}
          {selectedPanel === "stickers" && <StickersPanelContent />}
        </Suspense>
      </div>
    </div>
  );
}
