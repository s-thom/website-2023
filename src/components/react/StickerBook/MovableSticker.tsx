import { useDraggable } from "@dnd-kit/core";
import { Sticker } from "./Sticker.tsx";
import type { StickerInfo } from "./types";

export interface MovableStickerProps {
  sticker: StickerInfo;
}

export function MovableSticker({ sticker }: MovableStickerProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: sticker.id,
  });

  return (
    <Sticker
      sticker={sticker}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        translate: transform ? `${transform.x}px, ${transform.y}px` : undefined,
        top: sticker.coordinates.y,
        left: sticker.coordinates.x,
      }}
    />
  );
}
