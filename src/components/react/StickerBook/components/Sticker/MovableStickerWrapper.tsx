import { useDraggable } from "@dnd-kit/core";
import clsx from "clsx";
import { useCallback, useEffect, useRef } from "react";
import { positionToPageCoords } from "../../../../../stickers/coordinates";
import type { StickerInfo } from "../../../../../stickers/types";
import { Sticker } from "./Sticker.tsx";

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

  const ref = useRef<HTMLButtonElement | null>(null);
  const setRef = useCallback(
    (button: HTMLButtonElement | null) => {
      ref.current = button;
      setNodeRef(button);
    },
    [setNodeRef],
  );

  // Coordinates should always be 0 in the sticker panel
  const coordinates =
    sticker.zone !== undefined
      ? positionToPageCoords(sticker.position)
      : { x: 0, y: 0 };
  // Update position on resize as well
  useEffect(() => {
    if (!sticker.zone) {
      return undefined;
    }

    function onResize() {
      if (!ref.current) {
        return;
      }

      const newCoordinates = positionToPageCoords(sticker.position);
      ref.current.style.left = `${newCoordinates.x}px`;
      ref.current.style.top = `${newCoordinates.y}px`;
    }

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [sticker.position, sticker.zone]);

  return (
    <button
      className={clsx("movable-sticker-wrapper", className)}
      ref={setRef}
      {...listeners}
      {...attributes}
      style={{
        translate: transform ? `${transform.x}px, ${transform.y}px` : undefined,
        top: coordinates.y,
        left: coordinates.x,
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
