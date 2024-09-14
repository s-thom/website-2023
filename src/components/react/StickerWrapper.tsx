import { useEffect, useRef } from "react";
import { createStickerElement } from "../../stickers/elements/stickers";
import type { StickerTypes } from "../../stickers/types";

export interface StickerWrapperProps {
  type: StickerTypes;
}

export function StickerWrapper({ type }: StickerWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) {
      return undefined;
    }

    const { element, destroy } = createStickerElement(type);
    wrapper.appendChild(element);

    return () => {
      wrapper.removeChild(element);
      destroy();
    };
  }, [type]);

  return <div ref={wrapperRef} />;
}
