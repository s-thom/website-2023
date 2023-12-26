import { DndContext, DragOverlay } from "@dnd-kit/core";
import { useState } from "react";
import { Sticker } from "../Sticker/Sticker.tsx";
import styles from "./StickerBook.module.css";
import { useDragState } from "./useDragState.tsx";
import { useStickerEventListeners } from "./useStickerEventListeners";
import { PageZone } from "./zones/PageZone.tsx";
import { PanelButton } from "./zones/PanelButton.tsx";
import { StickerPanel } from "./zones/StickerPanel.tsx";

export interface StickerAppProps {
  pageId: string;
}

export function StickerApp({ pageId }: StickerAppProps) {
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
          <Sticker type={draggingSticker.type} className={styles.stickerDrag} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
