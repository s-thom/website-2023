import {
  DndContext,
  DragOverlay,
  type DragCancelEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { PageZone } from "./PageZone.tsx";
import styles from "./StickerBook.module.css";
import { StickerPanel } from "./StickerPanel.tsx";
import { STICKER_TYPE_MAP } from "./data";
import { MovableStickerWrapper } from "./stickers/MovableStickerWrapper.tsx";
import { Sticker } from "./stickers/Sticker.tsx";
import type { StickerInfo } from "./types";

export interface StickerContainerProps {
  id: string;
}

export function StickerContainer({ id }: StickerContainerProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  id;

  const [stickers, setStickers] = useState<StickerInfo[]>(() =>
    Object.keys(STICKER_TYPE_MAP).map((type, i) => ({
      id: i.toString(),
      coordinates: { x: 0, y: 0 },
      type: type as any,
      zone: "panel",
    })),
  );
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
      accessibility={{
        announcements: {
          onDragStart({ active }) {
            const activeSticker = stickers.find(
              (sticker) => sticker.id === active.id,
            );
            if (activeSticker) {
              const stickerData = STICKER_TYPE_MAP[activeSticker.type];
              return `Picked up ${stickerData.name} sticker`;
            }
            return undefined;
          },
          onDragOver({ active, over }) {
            const activeSticker = stickers.find(
              (sticker) => sticker.id === active.id,
            );
            if (activeSticker && over) {
              const stickerData = STICKER_TYPE_MAP[activeSticker.type];
              return `Sticker ${stickerData.name} is over ${over.id}`;
            }
            return undefined;
          },
          onDragEnd({ active, over }) {
            const activeSticker = stickers.find(
              (sticker) => sticker.id === active.id,
            );
            if (activeSticker && over) {
              const stickerData = STICKER_TYPE_MAP[activeSticker.type];
              return `Sticker ${stickerData.name} was placed on ${over.id}`;
            }
            return undefined;
          },
          onDragCancel() {
            return `Sticker placement cancelled`;
          },
        },
        screenReaderInstructions: {
          draggable: `To pick up a sticker, press space or enter. Use the arrow keys to move the sticker to any position on the page. Press space or enter again to place the sticker, or press escape to cancel`,
        },
      }}
    >
      <PageZone>
        {pageStickers.map((sticker) => (
          <MovableStickerWrapper
            key={sticker.id}
            sticker={sticker}
            className={styles.pageStickerWrapper}
          />
        ))}
      </PageZone>

      <DragOverlay>
        {draggingSticker ? (
          <Sticker sticker={draggingSticker} className={styles.stickerDrag} />
        ) : null}
      </DragOverlay>

      <StickerPanel>
        {panelStickers.map((sticker) => (
          <MovableStickerWrapper key={sticker.id} sticker={sticker} />
        ))}
      </StickerPanel>
    </DndContext>
  );
}
