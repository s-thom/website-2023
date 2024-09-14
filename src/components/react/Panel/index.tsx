import clsx from "clsx";
import { BookHeartIcon, Settings2Icon } from "lucide-react";
import {
  lazy,
  startTransition,
  Suspense,
  useLayoutEffect,
  useState,
} from "react";
import { LoadingPanelContent } from "./LoadingPanelContent.tsx";
import "./panel.css";

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

type PanelTypes = "settings" | "stickers";

export function Panel() {
  const [isClient, setIsClient] = useState(false);
  useLayoutEffect(() => {
    setIsClient(true);
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<PanelTypes>("settings");
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
        <Settings2Icon />
      </button>
      <button
        type="button"
        className={clsx("side-panel-handle")}
        aria-label="Toggle stickers"
        style={{ "--handle-index": 1 } as any}
        onClick={() => togglePanel("stickers")}
      >
        <BookHeartIcon />
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
