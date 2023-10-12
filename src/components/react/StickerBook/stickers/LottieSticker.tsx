import lottie, { type AnimationItem } from "lottie-web";
import { useEffect, useRef, useState } from "react";
import type { LottieStickerData, StickerInfo } from "../types";

export interface LottieStickerProps {
  sticker: StickerInfo;
  data: LottieStickerData;
}

export function LottieSticker({ data }: LottieStickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [, setAnimation] = useState<AnimationItem>();

  useEffect(() => {
    if (!ref.current) {
      return () => {};
    }

    const anim = lottie.loadAnimation({
      container: ref.current,
      path: data.url,
      loop: true,
      autoplay: true,
      name: data.name,
    });
    setAnimation(anim);

    return () => {
      anim.destroy();
    };
  }, []);

  return <div ref={ref} />;
}
