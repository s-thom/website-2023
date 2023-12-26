import type { DndContext, DragCancelEvent, DragEndEvent } from "@dnd-kit/core";
import { useCallback, useMemo, useState } from "react";
import { useStore } from "../../../store";
import { STICKER_TYPE_MAP } from "../../data";
import type { StickerInfo } from "../../types";

export function useDragState(pageId: string) {
  const stickers = useStore((state) => state.stickers);
  const placeOnPage = useStore((state) => state.placeOnPage);
  const removeFromPage = useStore((state) => state.removeFromPage);

  const [dragId, setDragId] = useState<string>();

  const draggingSticker =
    dragId !== undefined && stickers.find((sticker) => sticker.id === dragId);
  const panelStickers = stickers.filter(
    (sticker) => sticker.zone === undefined,
  );
  const currentPageStickers = stickers.filter(
    (sticker) => sticker.zone === pageId,
  );

  const handleDragStart = useCallback((event: DragEndEvent) => {
    setDragId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
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

        placeOnPage(draggingSticker.id, pageId, coordinates);
      }
    },
    [draggingSticker, pageId, placeOnPage, removeFromPage],
  );

  const handleDragCancel = useCallback(
    (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      event: DragCancelEvent,
    ) => {
      setDragId(undefined);
    },
    [],
  );

  const accessibility = useMemo<
    React.ComponentProps<typeof DndContext>["accessibility"]
  >(
    () => ({
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
    }),
    [stickers],
  );

  return {
    draggingSticker,
    currentPageStickers,
    panelStickers,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    accessibility,
  };
}
