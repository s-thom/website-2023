import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";
import { InfoIcon, XIcon } from "lucide-react";
import { useMemo } from "react";
import { useStore } from "../../../../store/index";
import { STICKER_TYPE_MAP } from "../../../data";
import type { StickerInfo } from "../../../types";
import { MovableStickerWrapper } from "../../Sticker/MovableStickerWrapper.tsx";

export interface StickerPanelProps {
  stickers: StickerInfo[];
  onCloseClick?: () => void;
}

export function StickerPanel({ stickers, onCloseClick }: StickerPanelProps) {
  const animationFrequency = useStore((state) => state.animationFrequency);
  const setAnimationFrequency = useStore(
    (state) => state.setAnimationFrequency,
  );

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
      .sort((a, z) => (a[0] < z[0] ? -1 : 1))
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
        "sticker-drag-zone",
        "sticker-drag-zone-floating",
        isOver && "sticker-drag-zone-over",
      )}
    >
      <div className="sticker-panel-header">
        <div className="sticker-panel-title">
          <p>Drag a sticker anywhere on the page to place it</p>
        </div>
        <label htmlFor="panel-anim-freq">
          Animate:{" "}
          <select
            id="panel-anim-freq"
            value={animationFrequency}
            onChange={(event) =>
              setAnimationFrequency(event.target.value as any)
            }
          >
            <option value="always">Always</option>
            <option value="hover">On hover</option>
            <option value="never">Never</option>
          </select>
        </label>

        <button
          className={clsx("sticker-panel-icon-button", "sticker-panel-close")}
          onClick={() => onCloseClick?.()}
        >
          <XIcon>
            <title>Close</title>
          </XIcon>
        </button>
      </div>
      <p className="sticker-panel-what">
        <a href="/sticker-book">
          <InfoIcon className="sticker-panel-info-icon">
            <title>Info</title>
          </InfoIcon>
          Wait, what is this?
        </a>
      </p>
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
