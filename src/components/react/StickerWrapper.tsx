import { useEffect, useRef } from "react";
import { type StickerTypes, createStickerElement } from '../../stickers/stickers';

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
