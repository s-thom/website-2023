import { useEffect, useRef } from "react";
import { createStickerElement } from "../../stickers/elements/stickers";
import type { StickerTypes } from "../../stickers/types";

export interface StickerWrapperProps {
  type: StickerTypes;
  stickerId?: string;
  draggable?: boolean;
}

export function StickerWrapper({
  type,
  draggable,
  stickerId,
}: StickerWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) {
      return undefined;
    }

    const { element, destroy } = createStickerElement(type, {
      draggable,
      draggableData: { stickerId },
    });
    wrapper.appendChild(element);

    return () => {
      wrapper.removeChild(element);
      destroy();
    };
  }, [draggable, stickerId, type]);

  return <div ref={wrapperRef} />;
}
