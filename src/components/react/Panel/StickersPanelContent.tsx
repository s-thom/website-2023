import { useMemo } from "react";
import {
  sortStickerTypes,
  type STICKER_TYPE_MAP,
} from "../../../stickers/data";
import type { StickerInfo } from "../../../stickers/types";
import { useStickers } from "../hooks/useStickers";
import { StickerWrapper } from "../StickerWrapper.tsx";

interface StickerListProps {
  stickers: StickerInfo[];
}

function StickerList({ stickers }: StickerListProps) {
  const groupedStickers = useMemo(() => {
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
      .sort((a, z) => sortStickerTypes(a[0], z[0]))
      .map(([, group]) => group);
    return groups;
  }, [stickers]);

  return (
    <ul className="sticker-list">
      {groupedStickers.map((group) => (
        <li key={group[0].type} className="sticker-list-sticker-item">
          <StickerWrapper type={group[0].type} />
          {group.length > 1 && (
            <span className="sticker-list-count">{group.length}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export function StickersPanelContent() {
  const { enabled, stickers } = useStickers();

  return (
    <div className="stickers-content">
      <h2>
        <a href="/sticker-book">Stickers</a>
      </h2>
      <p>
        Get stickers while on this site and place them anywhere on any page.
      </p>
      {enabled ? (
        <StickerList stickers={stickers} />
      ) : (
        <div>Stickers are currently disabled</div>
      )}
    </div>
  );
}
