import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";
import type { StickerInfo } from "../../../types";
import { MovableStickerWrapper } from "../../Sticker/MovableStickerWrapper.tsx";

export interface PageZoneProps {
  stickers: StickerInfo[];
}

export function PageZone({ stickers }: PageZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id: "page" });

  return (
    <>
      <div className="sticker-page-positioning">
        {stickers.map((sticker) => (
          <MovableStickerWrapper
            key={sticker.id}
            sticker={sticker}
            className="sticker-page-sticker"
            animated
          />
        ))}
      </div>
      <div
        ref={setNodeRef}
        className={clsx(
          "sticker-page-zone",
          isOver && "sticker-page-zone-over",
        )}
      />
    </>
  );
}
