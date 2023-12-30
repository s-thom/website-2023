import { useMemo } from "react";
import { useStore } from "../../../store";
import { STICKER_TYPE_MAP } from "../../data";
import { RARITY_RANK, type StickerInfo } from "../../types";
import { Sticker } from "../Sticker/Sticker.tsx";
import { StickerFrame } from "../StickerFrame/index.tsx";

export function StickerBook() {
  const isStickersEnabled = useStore((store) => store.enabled.stickers);
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
      // Sort groups by rarity, then by name
      .sort((a, z) => {
        const rarityDifference =
          RARITY_RANK[STICKER_TYPE_MAP[a[0]].rarity] -
          RARITY_RANK[STICKER_TYPE_MAP[z[0]].rarity];
        if (rarityDifference !== 0) {
          return rarityDifference * -1;
        }
        // Compare name strings
        return a[0] < z[0] ? -1 : 1;
      })
      .map(([, group]) => {
        // Sort stickers by when they were unlocked, and return the first one
        group.sort((a, z) => a.unlockTime - z.unlockTime);
        return group[0];
      });

    return firstsOfGroups;
  }, [stickers]);

  if (!isStickersEnabled) {
    return null;
  }

  return firstStickersOfType.length === 0 ? (
    <div className="sticker-book-empty">No stickers unlocked yet...</div>
  ) : (
    <div className="sticker-book-grid">
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
