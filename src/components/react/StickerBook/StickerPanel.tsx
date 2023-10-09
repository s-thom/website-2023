import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";
import type { PropsWithChildren } from "react";
import styles from "./StickerBook.module.css";

export interface StickerPanelProps extends PropsWithChildren {}

// eslint-disable-next-line no-empty-pattern
export function StickerPanel({ children }: StickerPanelProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: "panel",
  });

  return (
    <div
      ref={setNodeRef}
      className={clsx(styles.panelZone, isOver && styles.panelZoneOver)}
    >
      {children}
    </div>
  );
}
