import { useDraggable } from "@dnd-kit/core";
import clsx from "clsx";
import type { StickerInfo } from "../../types";
import styles from "./MovableStickerWrapper.module.css";
import { Sticker } from "./Sticker.tsx";

export interface MovableStickerWrapperProps {
  sticker: StickerInfo;
  className?: string;
}

export function MovableStickerWrapper({
  sticker,
  className,
}: MovableStickerWrapperProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: sticker.id,
    });

  return (
    <button
      className={clsx(styles.stickerMovableWrapper, className)}
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
          styles.stickerMovable,
          isDragging && styles.stickerDrag,
        )}
        type={sticker.type}
      />
    </button>
  );
}
