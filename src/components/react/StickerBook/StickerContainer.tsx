import {
  DndContext,
  DragOverlay,
  type DragCancelEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { MovableSticker } from "./MovableSticker.tsx";
import { PageZone } from "./PageZone.tsx";
import { Sticker } from "./Sticker.tsx";
import styles from "./StickerBook.module.css";
import { StickerPanel } from "./StickerPanel.tsx";
import type { StickerInfo } from "./types";

export interface StickerAppProps {
  id: string;
}

export function StickerContainer({ id }: StickerContainerProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  id;

  const [stickers, setStickers] = useState<StickerInfo[]>([
    {
      id: "1",
      zone: "panel",
      type: "rebeccapurple",
      coordinates: { x: 0, y: 0 },
    },
    {
      id: "2",
      zone: "panel",
      type: "rebeccapurple",
      coordinates: { x: 0, y: 0 },
    },
    {
      id: "3",
      zone: "panel",
      type: "rebeccapurple",
      coordinates: { x: 0, y: 0 },
    },
  ]);
  const [dragId, setDragId] = useState<string>();

  const draggingSticker =
    dragId !== undefined && stickers.find((sticker) => sticker.id === dragId);
  const panelStickers = stickers.filter((sticker) => sticker.zone === "panel");
  const pageStickers = stickers.filter((sticker) => sticker.zone === "page");

  function handleDragStart(event: DragEndEvent) {
    setDragId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setDragId(undefined);

    if (draggingSticker && event.over) {
      const coordinates: StickerInfo["coordinates"] =
        event.over.id === "page"
          ? {
              x:
                (event.active.rect.current.translated?.left ?? 0) +
                window.scrollX,
              y:
                (event.active.rect.current.translated?.top ?? 0) +
                window.scrollY,
            }
          : { x: 0, y: 0 };

      const sticker: StickerInfo = {
        ...draggingSticker,
        zone: event.over.id as string,
        coordinates,
      };

      const oldIndex = stickers.indexOf(draggingSticker);
      const newStickers = [...stickers];
      newStickers.splice(oldIndex, 1, sticker);

      setStickers(newStickers);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleDragCancel(event: DragCancelEvent) {
    setDragId(undefined);
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <PageZone>
        {pageStickers.map((sticker) => (
          <MovableSticker key={sticker.id} sticker={sticker} />
        ))}
      </PageZone>

      <DragOverlay>
        {draggingSticker ? (
          <Sticker sticker={draggingSticker} className={styles.stickerDrag} />
        ) : null}
      </DragOverlay>

      <StickerPanel>
        {panelStickers.map((sticker) => (
          <MovableSticker key={sticker.id} sticker={sticker} />
        ))}
      </StickerPanel>
    </DndContext>
  );
}
