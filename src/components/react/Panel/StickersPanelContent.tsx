import {
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/dist/cjs/entry-point/element/adapter";
import { useEffect, useMemo, useRef } from "react";
import {
  type StickerInfo,
  STICKER_TYPE_MAP,
  removeFromPage,
  sortStickerTypes,
} from "../../../stickers/stickers";
import { combine } from "../../../util";
import { useStickers, useStickersEnabled } from "../hooks/useStickers";
import { StickerWrapper } from "../StickerWrapper.tsx";

interface StickerListProps {
  stickers: StickerInfo[];
}

function StickerList({ stickers }: StickerListProps) {
  const groupedStickers = useMemo(() => {
    const map = new Map<keyof typeof STICKER_TYPE_MAP, StickerInfo[]>();
    stickers.forEach((sticker) => {
      if (sticker.zone) {
        return;
      }

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
      {groupedStickers.length > 0 ? (
        groupedStickers.map((group) => (
          <li key={group[0].type} className="sticker-list-sticker-item">
            <StickerWrapper
              type={group[0].type}
              draggable
              stickerId={group[0].id}
            />
            {group.length > 1 && (
              <span className="sticker-list-count">{group.length}</span>
            )}
          </li>
        ))
      ) : (
        <div className="sticker-list-empty">
          No stickers unlocked yet. Continue reading to get more.
        </div>
      )}
    </ul>
  );
}

export function StickersPanelContent() {
  const containerRef = useRef<HTMLDivElement>(null);

  const enabled = useStickersEnabled();
  const { stickers } = useStickers();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const cleanup = combine(
      dropTargetForElements({
        element: container,
        onDragEnter: () => {
          container.classList.add("over");
        },
        onDragLeave: () => {
          container.classList.remove("over");
        },
        onDrop: ({ source }) => {
          if (typeof source.data.stickerId === "string") {
            removeFromPage(source.data.stickerId);
          }
        },
      }),
      monitorForElements({
        onDragStart: () => {
          container.classList.add("active");
        },
        onDrop: () => {
          container.classList.remove("active");
          container.classList.remove("over");
        },
      }),
    );

    return () => {
      cleanup();
    };
  }, []);

  return (
    <div className="stickers-content flow" ref={containerRef}>
      <h2>Place an emoji</h2>
      {enabled ? (
        <>
          <p>
            Get new emoji while reading, then place them anywhere on any page.{" "}
            <a href="/sticker-book">Read more</a>.
          </p>
          <StickerList stickers={stickers} />
        </>
      ) : (
        <div className="sticker-list-empty">
          Emoji stickers are currently turned off. Use the settings panel to
          turn them back on, or read more on the{" "}
          <a href="/sticker-book">sticker book</a> page.
        </div>
      )}
    </div>
  );
}
