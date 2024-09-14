import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { STICKER_TYPE_MAP } from "../../../stickers/data";
import { createStickerFrame } from "../../../stickers/elements/stickerFrame";
import { createStickerElement } from "../../../stickers/elements/stickers";
import {
  RARITY_RANK,
  type StickerInfo,
  type StickerTypes,
} from "../../../stickers/types";
import { useStickers } from "../hooks/useStickers";
import "./StickerBook.css";

export interface FramedStickerProps {
  type: StickerTypes;
}

export function FramedSticker({ type }: FramedStickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const data = STICKER_TYPE_MAP[type];

    const { element: sticker, destroy } = createStickerElement(type);
    const frame = createStickerFrame(sticker, {
      rarity: data.rarity,
      description: data.description,
      name: data.name,
      showRarityLabel: true,
      unlockedBy: data.unlockedBy,
    });

    container.appendChild(frame);

    return () => {
      container.removeChild(frame);
      destroy();
    };
  }, [type]);

  return <div ref={containerRef} />;
}

export function StickerBook() {
  const [isClient, setIsClient] = useState(false);
  useLayoutEffect(() => {
    setIsClient(true);
  }, []);
  const { enabled: isStickersEnabled, stickers } = useStickers();

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

  if (!isStickersEnabled || !isClient) {
    return null;
  }

  return firstStickersOfType.length === 0 ? (
    <div className="sticker-book-empty">No stickers unlocked yet...</div>
  ) : (
    <div>
      <h2>Your Collection</h2>
      <div className="sticker-book-grid">
        {firstStickersOfType.map((sticker) => (
          <FramedSticker key={sticker.type} type={sticker.type} />
        ))}
      </div>
    </div>
  );
}
