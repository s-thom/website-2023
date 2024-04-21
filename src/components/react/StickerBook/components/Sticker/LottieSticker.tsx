import clsx from "clsx";
import lottie, {
  type AnimationItem,
} from "lottie-web/build/player/lottie_light";
import { MoreHorizontalIcon } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { isBrowser } from "../../../../../util";
import { useStore } from "../../../store";
import { STICKER_TYPE_MAP } from "../../data";
import type { StickerTypes } from "../../types";

const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect;

async function requestLottieFile(url: string) {
  const response = await fetch(url);
  const json = await response.json();
  return json;
}

const LOTTIE_PROMISE_CACHE: { [key: string]: Promise<any> } = {};
// For the most part you want to use the Promise cache but in special
// circumstances it's nice to get the actual value, even if it's a bit
// unsafe to do so. Hopefully the word "sneaky" in the name gives a
// clue that this really shouldn't be used.
const LOTTIE_SNEAKY_CACHE: { [key: string]: any } = {};

export function getLottieData(type: StickerTypes) {
  const data = STICKER_TYPE_MAP[type];

  if (!LOTTIE_PROMISE_CACHE[type]) {
    LOTTIE_PROMISE_CACHE[type] = requestLottieFile(data.url).then((json) => {
      LOTTIE_SNEAKY_CACHE[type] = json;
      return json;
    });
  }

  return LOTTIE_PROMISE_CACHE[type]!;
}

export interface LottieStickerProps {
  type: StickerTypes;
  animated?: boolean;
}

export function LottieSticker({ type, animated }: LottieStickerProps) {
  const data = STICKER_TYPE_MAP[type];

  const ref = useRef<HTMLDivElement>(null);
  const [animation, setAnimation] = useState<AnimationItem>();
  const [isHovering, setIsHovering] = useState<boolean>(false);

  const animationFrequency = useStore((state) => state.animationFrequency);

  const play = useCallback(() => {
    if (animated && animation) {
      animation.play();
    }
  }, [animated, animation]);

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

  useIsomorphicLayoutEffect(() => {
    let anim: AnimationItem | undefined;
    let didCleanup = false;

    async function go() {
      if (!ref.current) {
        return;
      }

      const animationData =
        LOTTIE_SNEAKY_CACHE[type] ?? (await getLottieData(type));
      // This is a guard against strict mode's double effect behaviour
      if (didCleanup) {
        return;
      }

      anim = lottie.loadAnimation({
        container: ref.current!,
        animationData,
        loop: true,
        autoplay: false,
        name: data.name,
        rendererSettings: { className: "lottie-animation" },
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
  }, [data, type]);

  useEffect(() => {
    if (!animation) {
      return;
    }
    if (!animated) {
      stop();
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
    animated,
    animation,
    animationFrequency,
    data.initialFrame,
    isHovering,
    play,
    stop,
  ]);

  return (
    <>
      <div
        className={clsx("lottie-sticker", !animation && "fully-hidden")}
        ref={ref}
        onPointerOver={onHover}
        onPointerLeave={onUnhover}
      />
      {!animation && (
        <div className="lottie-sticker lottie-fallback">
          <MoreHorizontalIcon
            className="lottie-fallback-dots"
            width={48}
            height={48}
          />
        </div>
      )}
    </>
  );
}
