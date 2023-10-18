import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";
import { InfoIcon, SmilePlusIcon, Trash2Icon, XIcon } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { v4 as uuid } from "uuid";
import { useStore } from "../../store";
import { STICKER_TYPE_MAP } from "../data";
import { MovableStickerWrapper } from "../stickers/MovableStickerWrapper.tsx";
import type { StickerInfo } from "../types";
import styles from "./StickerPanel.module.css";

function DevButton() {
  const addSticker = useStore((state) => state.addSticker);

  if (!import.meta.env.DEV) {
    return null;
  }

  function newStickers() {
    const types = Object.keys(
      STICKER_TYPE_MAP,
    ) as unknown as (keyof typeof STICKER_TYPE_MAP)[];
    for (let i = 0; i < 3; i++) {
      const type = types[Math.floor(Math.random() * types.length)];

      addSticker({
        id: uuid(),
        type,
        pageId: undefined,
        coordinates: { x: 0, y: 0 },
      });
    }
  }

  return <button onClick={newStickers}>🆕</button>;
}

export interface StickerPanelProps {
  stickers: StickerInfo[];
}

export function StickerPanel({ stickers }: StickerPanelProps) {
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

  const [isOpen, setIsOpen] = useState(false);

  const { isOver, setNodeRef } = useDroppable({
    id: "panel",
  });

  let layout: ReactNode;
  if (isOpen) {
    layout = (
      <>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <p>Drag a sticker anywhere on the page to place it</p>
          </div>
          <DevButton />
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
            className={clsx(styles.iconButton, styles.close)}
            onClick={() => setIsOpen(false)}
          >
            <XIcon>
              <title>Close</title>
            </XIcon>
          </button>
        </div>
        <p className={styles.whatLine}>
          <a className={styles.what} href="/website/sticker-book">
            <InfoIcon className={styles.infoIcon}>
              <title>Info</title>
            </InfoIcon>
            Wait, what is this?
          </a>
        </p>
        <div className={styles.list}>
          {stickersByType.map((stickerGroup) => (
            <div className={styles.stickerWrapper} key={stickerGroup[0].id}>
              <MovableStickerWrapper sticker={stickerGroup[0]} />
              {stickerGroup.length > 1 && (
                <span className={styles.count}>{stickerGroup.length}</span>
              )}
            </div>
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
