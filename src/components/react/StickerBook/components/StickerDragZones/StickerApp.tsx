import { DndContext, DragOverlay } from "@dnd-kit/core";
import { useState } from "react";
import { useStore } from "../../../store";
import { Sticker } from "../Sticker/Sticker.tsx";
import { useDragState } from "./useDragState.tsx";
import { useStickerEventListeners } from "./useStickerEventListeners";
import { PageZone } from "./zones/PageZone.tsx";
import { PanelButton } from "./zones/PanelButton.tsx";
import { StickerPanel } from "./zones/StickerPanel.tsx";

export interface StickerAppProps {
  pageId: string;
}

export function StickerApp({ pageId }: StickerAppProps) {
  const isStickersEnabled = useStore((store) => store.enabled.stickers);

  const {
    draggingSticker,
    currentPageStickers,
    panelStickers,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    accessibility,
  } = useDragState(pageId);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  useStickerEventListeners();

  if (!isStickersEnabled) {
    return null;
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
      accessibility={accessibility}
    >
      <PageZone stickers={currentPageStickers} />
      {isPanelOpen ? (
        <StickerPanel
          stickers={panelStickers}
          onCloseClick={() => setIsPanelOpen(false)}
        />
      ) : (
        <PanelButton onClick={() => setIsPanelOpen(true)} />
      )}

      <DragOverlay>
        {draggingSticker ? (
          <Sticker
            type={draggingSticker.type}
            className="movable-sticker-drag"
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
