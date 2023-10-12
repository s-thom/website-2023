import lottie, { type AnimationItem } from "lottie-web";
import { useEffect, useRef, useState } from "react";
import type { LottieStickerData, StickerInfo } from "../types";

async function requestLottieFile(url: string) {
  const response = await fetch(url);
  const json = await response.json();
  return json;
}

const LOTTIE_PROMISE_CACHE: { [key: string]: any } = {};

async function getLottieData(url: string) {
  if (!LOTTIE_PROMISE_CACHE[url]) {
    LOTTIE_PROMISE_CACHE[url] = requestLottieFile(url);
  }

  return LOTTIE_PROMISE_CACHE[url]!;
}

export interface LottieStickerProps {
  sticker: StickerInfo;
  data: LottieStickerData;
}

export function LottieSticker({ data }: LottieStickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [, setAnimation] = useState<AnimationItem>();

  useEffect(() => {
    let anim: AnimationItem | undefined;
    let didCleanup = false;

    async function go() {
      if (!ref.current) {
        return;
      }

      const animationData = await getLottieData(data.url);
      // This is a guard against strict mode's double effect behaviour
      if (didCleanup) {
        return;
      }

      anim = lottie.loadAnimation({
        container: ref.current,
        animationData,
        loop: true,
        autoplay: true,
        name: data.name,
      });
      setAnimation(anim);
    }

    go();

    return () => {
      didCleanup = true;
      if (anim) {
        anim.destroy();
      }
    };
  }, []);

  return <div ref={ref} />;
}
