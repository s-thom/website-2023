import clsx from "clsx";
import { BookHeartIcon, Settings2Icon } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { SettingsPanelContent } from "./SettingsPanelContent.tsx";
import "./panel.css";

const StickersPanelContent = lazy(() =>
  import("./StickersPanelContent.tsx").then((module) => ({
    default: module.StickersPanelContent,
  })),
);

type PanelTypes = "settings" | "stickers";

export function Panel() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<PanelTypes>("settings");

  const togglePanel = (type: PanelTypes) => {
    if (isOpen && type === selectedPanel) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
      setSelectedPanel(type);
    }
  };

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
        <Suspense>
          {selectedPanel === "settings" && <SettingsPanelContent />}
          {selectedPanel === "stickers" && <StickersPanelContent />}
        </Suspense>
      </div>
    </div>
  );
}
