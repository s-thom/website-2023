import lottie, { type AnimationItem } from "lottie-web";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { useStore } from "../../../store";
import type { LottieStickerData } from "../../types";
import styles from "./LottieSticker.module.css";

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
  data: LottieStickerData;
}

export function LottieSticker({ data }: LottieStickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [animation, setAnimation] = useState<AnimationItem>();
  const [isHovering, setIsHovering] = useState<boolean>(false);

  const animationFrequency = useStore((state) => state.animationFrequency);

  const play = useCallback(() => {
    if (animation) {
      animation.play();
    }
  }, [animation]);

  const stop = useCallback(() => {
    if (animation) {
      animation.goToAndStop(data.initialFrame, true);
      // A quick state reset, in case anything goes wrong
      setIsHovering(false);
    }
  }, [animation, data.initialFrame]);

  function onHover(e: PointerEvent<HTMLElement>) {
    if (!animation) {
      return;
    }
    if (e.currentTarget === ref.current) {
      setIsHovering(true);
    }
  }

  function onUnhover(e: PointerEvent<HTMLElement>) {
    if (e.currentTarget === ref.current) {
      setIsHovering(false);
    }
  }

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
        autoplay: false,
        name: data.name,
        rendererSettings: { className: styles.animation },
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
  }, [data]);

  useEffect(() => {
    if (!animation) {
      return;
    }
    if (animationFrequency === "never") {
      stop();
      return;
    }
    if (animationFrequency === "always") {
      play();
      return;
    }
    if (animationFrequency === "hover") {
      if (isHovering) {
        play();
      } else {
        stop();
      }
      // eslint-disable-next-line no-useless-return
      return;
    }

    // TODO: Add a "sometimes" which plays randomly
  }, [
    animation,
    animationFrequency,
    data.initialFrame,
    isHovering,
    play,
    stop,
  ]);

  return <div ref={ref} onPointerOver={onHover} onPointerLeave={onUnhover} />;
}
