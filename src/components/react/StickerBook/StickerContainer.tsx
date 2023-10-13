import {
  DndContext,
  DragOverlay,
  type DragCancelEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { useStore } from "../store";
import styles from "./StickerBook.module.css";
import { STICKER_TYPE_MAP } from "./data";
import { Sticker } from "./stickers/Sticker.tsx";
import type { StickerInfo } from "./types";
import { PageZone } from "./zones/PageZone.tsx";
import { StickerPanel } from "./zones/StickerPanel.tsx";

export interface StickerContainerProps {
  id: string;
}

export function StickerContainer({ id }: StickerContainerProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  id;

  const stickers = useStore((state) => state.stickers);
  const placeOnPage = useStore((state) => state.placeOnPage);
  const removeFromPage = useStore((state) => state.removeFromPage);

  const [dragId, setDragId] = useState<string>();

  const draggingSticker =
    dragId !== undefined && stickers.find((sticker) => sticker.id === dragId);
  const panelStickers = stickers.filter(
    (sticker) => sticker.pageId === undefined,
  );
  const pageStickers = stickers.filter((sticker) => sticker.pageId === id);

  function handleDragStart(event: DragEndEvent) {
    setDragId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setDragId(undefined);

    if (draggingSticker && event.over) {
      if (event.over.id === "panel") {
        removeFromPage(draggingSticker.id);
        return;
      }

      const coordinates: StickerInfo["coordinates"] = {
        x: (event.active.rect.current.translated?.left ?? 0) + window.scrollX,
        y: (event.active.rect.current.translated?.top ?? 0) + window.scrollY,
      };

      placeOnPage(draggingSticker.id, id, coordinates);
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
      <PageZone stickers={pageStickers} />
      <StickerPanel stickers={panelStickers} />

      <DragOverlay>
        {draggingSticker ? (
          <Sticker sticker={draggingSticker} className={styles.stickerDrag} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
