import { useDraggable } from "@dnd-kit/core";
import clsx from "clsx";
import type { StickerInfo } from "../../types";
import { Sticker } from "./Sticker.tsx";
import "./index.css";

export interface MovableStickerWrapperProps {
  sticker: StickerInfo;
  animated?: boolean;
  className?: string;
}

export function MovableStickerWrapper({
  sticker,
  animated,
  className,
}: MovableStickerWrapperProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: sticker.id,
    });

  return (
    <button
      className={clsx("movable-sticker-wrapper", className)}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        translate: transform ? `${transform.x}px, ${transform.y}px` : undefined,
        top: sticker.coordinates.y,
        left: sticker.coordinates.x,
      }}
    >
      <Sticker
        className={clsx(
          "movable-sticker",
          isDragging && "movable-sticker-drag",
        )}
        type={sticker.type}
        animated={animated}
      />
    </button>
  );
}
