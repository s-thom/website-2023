import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";
import { InfoIcon, XIcon } from "lucide-react";
import { useMemo } from "react";
import { STICKER_TYPE_MAP, sortStickerTypes } from "../../../data";
import type { StickerInfo } from "../../../types";
import { MovableStickerWrapper } from "../../Sticker/MovableStickerWrapper.tsx";

export interface StickerPanelProps {
  stickers: StickerInfo[];
  onCloseClick?: () => void;
}

export function StickerPanel({ stickers, onCloseClick }: StickerPanelProps) {
  const stickersByType = useMemo(() => {
    const map = new Map<keyof typeof STICKER_TYPE_MAP, StickerInfo[]>();
    stickers.forEach((sticker) => {
      let arr = map.get(sticker.type);
      if (!arr) {
        arr = [];
        map.set(sticker.type, arr);
      }
      arr.push(sticker);
    });

    const groups = Array.from(map.entries())
      .sort((a, z) => sortStickerTypes(a[0], z[0]))
      .map(([, group]) => group);
    return groups;
  }, [stickers]);

  const { isOver, setNodeRef } = useDroppable({
    id: "panel",
  });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "sticker-panel",
        "sticker-drag-zone",
        "sticker-drag-zone-floating",
        isOver && "sticker-drag-zone-over",
      )}
    >
      <div className="sticker-panel-header">
        <h2 className="sticker-panel-title">
          <a href="/sticker-book">
            Sticker book
            <InfoIcon className="sticker-panel-info-icon">
              <title>Info</title>
            </InfoIcon>
          </a>
        </h2>

        <button
          className={clsx("sticker-panel-icon-button", "sticker-panel-close")}
          onClick={() => onCloseClick?.()}
          data-umami-event="stickers-close-panel"
        >
          <XIcon>
            <title>Close</title>
          </XIcon>
        </button>
      </div>
      <p>Drag a sticker anywhere on the page to place it</p>

      <div className="sticker-panel-list">
        {stickersByType.map((stickerGroup) => (
          <div className="sticker-panel-list-sticker" key={stickerGroup[0].id}>
            <MovableStickerWrapper sticker={stickerGroup[0]} animated />
            {stickerGroup.length > 1 && (
              <span className="sticker-panel-list-count">
                {stickerGroup.length}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
