import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";
import type { StickerInfo } from "../../../types";
import { MovableStickerWrapper } from "../../Sticker/MovableStickerWrapper.tsx";
import styles from "./PageZone.module.css";

export interface PageZoneProps {
  stickers: StickerInfo[];
}

export function PageZone({ stickers }: PageZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id: "page" });

  return (
    <>
      <div className={styles.pageFloatZone}>
        {stickers.map((sticker) => (
          <MovableStickerWrapper
            key={sticker.id}
            sticker={sticker}
            className={styles.pageStickerWrapper}
            animated
          />
        ))}
      </div>
      <div
        ref={setNodeRef}
        className={clsx(styles.pageDropZone, isOver && styles.pageDropZoneOver)}
      />
    </>
  );
}
