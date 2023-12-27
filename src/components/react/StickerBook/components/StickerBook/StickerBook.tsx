import { useMemo } from "react";
import { useStore } from "../../../store";
import type { STICKER_TYPE_MAP } from "../../data";
import type { StickerInfo } from "../../types";
import { Sticker } from "../Sticker/Sticker.tsx";
import { StickerFrame } from "../StickerFrame/index.tsx";
import styles from "./StickerBook.module.css";

export function StickerBook() {
  const stickers = useStore((store) => store.stickers);

  const firstStickersOfType = useMemo(() => {
    const map = new Map<keyof typeof STICKER_TYPE_MAP, StickerInfo[]>();
    stickers.forEach((sticker) => {
      let arr = map.get(sticker.type);
      if (!arr) {
        arr = [];
        map.set(sticker.type, arr);
      }
      arr.push(sticker);
    });

    const firstsOfGroups = Array.from(map.entries())
      .sort((a, z) => (a[0] < z[0] ? -1 : 1))
      .map(([, group]) => {
        // Sort stickers by when they were unlocked, and return the first one
        group.sort((a, z) => a.unlockTime - z.unlockTime);
        return group[0];
      });

    return firstsOfGroups;
  }, [stickers]);

  return firstStickersOfType.length === 0 ? (
    <div className={styles.empty}>No stickers unlocked yet...</div>
  ) : (
    <div className={styles.grid}>
      {firstStickersOfType.map((sticker) => (
        <StickerFrame
          key={sticker.type}
          type={sticker.type}
          showRarityLabel
          showName
          showDescription
          showUnlockedBy
        >
          <Sticker type={sticker.type} animated />
        </StickerFrame>
      ))}
    </div>
  );
}
