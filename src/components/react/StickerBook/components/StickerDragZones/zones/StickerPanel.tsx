import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";
import { InfoIcon, XIcon } from "lucide-react";
import { useMemo } from "react";
import { useStore } from "../../../../store/index";
import { STICKER_TYPE_MAP } from "../../../data";
import type { StickerInfo } from "../../../types";
import { MovableStickerWrapper } from "../../Sticker/MovableStickerWrapper.tsx";
import styles from "./StickerPanel.module.css";
import zoneStyles from "./zones.module.css";

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
        zoneStyles.zone,
        zoneStyles.floatingZone,
        isOver && zoneStyles.zoneOver,
      )}
    >
      <div className={styles.header}>
        <div className={styles.headerTitle}>
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
          className={clsx(styles.iconButton, styles.close)}
          onClick={() => onCloseClick?.()}
        >
          <XIcon>
            <title>Close</title>
          </XIcon>
        </button>
      </div>
      <p className={styles.whatLine}>
        <a className={styles.what} href="/sticker-book">
          <InfoIcon className={styles.infoIcon}>
            <title>Info</title>
          </InfoIcon>
          Wait, what is this?
        </a>
      </p>
      <div className={styles.list}>
        {stickersByType.map((stickerGroup) => (
          <div className={styles.stickerWrapper} key={stickerGroup[0].id}>
            <MovableStickerWrapper sticker={stickerGroup[0]} animated />
            {stickerGroup.length > 1 && (
              <span className={styles.count}>{stickerGroup.length}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
