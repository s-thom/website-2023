import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";
import { InfoIcon, SmilePlusIcon, Trash2Icon, XIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { MovableStickerWrapper } from "../stickers/MovableStickerWrapper.tsx";
import type { StickerInfo } from "../types";
import styles from "./StickerPanel.module.css";

export interface StickerPanelProps {
  stickers: StickerInfo[];
}

export function StickerPanel({ stickers }: StickerPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { isOver, setNodeRef } = useDroppable({
    id: "panel",
  });

  let layout: ReactNode;
  if (isOpen) {
    layout = (
      <>
        <div className={styles.header}>
          <div>
            <p>Drag a sticker anywhere on the page to place it</p>
            <a className={styles.what} href="/website/sticker-book">
              <InfoIcon className={styles.infoIcon}>
                <title>Info</title>
              </InfoIcon>
              Wait, what is this?
            </a>
          </div>
          <button
            className={clsx(styles.iconButton, styles.close)}
            onClick={() => setIsOpen(false)}
          >
            <XIcon>
              <title>Close</title>
            </XIcon>
          </button>
        </div>
        <div className={styles.list}>
          {stickers.map((sticker) => (
            <MovableStickerWrapper key={sticker.id} sticker={sticker} />
          ))}
        </div>
      </>
    );
  } else {
    layout = (
      <button
        className={styles.iconButton}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOver ? (
          <Trash2Icon>
            <title>Remove from page</title>
          </Trash2Icon>
        ) : (
          <SmilePlusIcon>
            <title>Open sticker book</title>
          </SmilePlusIcon>
        )}
      </button>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        styles.zone,
        isOver && styles.zoneOver,
        !isOpen && styles.closed,
      )}
    >
      {layout}
    </div>
  );
}
