import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";
import { InfoIcon, XIcon } from "lucide-react";
import type { PropsWithChildren } from "react";
import styles from "./StickerPanel.module.css";

export interface StickerPanelProps extends PropsWithChildren {}

// eslint-disable-next-line no-empty-pattern
export function StickerPanel({ children }: StickerPanelProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: "panel",
  });

  return (
    <div
      ref={setNodeRef}
      className={clsx(styles.zone, isOver && styles.zoneOver)}
    >
      <div className={styles.header}>
        <div>
          <p>Drag a sticker anywhere on the page</p>
          <a href="/website/sticker-book">
            <InfoIcon>
              <title>Info</title>
            </InfoIcon>{" "}
            Wait, what is this?
          </a>
        </div>
        <button className={styles.close}>
          <XIcon>
            <title>Close</title>
          </XIcon>
        </button>
      </div>
      <div className={styles.list}>{children}</div>
    </div>
  );
}
