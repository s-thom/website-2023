import { useCallback, useEffect, useRef } from "react";
import { h } from "../../../lib/h";
import {
  addAnimationListener,
  createStickerElement,
  type StickerAddAnimation,
} from "../../../stickers/stickers";
import "./index.css";

function withCooldown(ms: number): (fn: () => void) => void {
  const queue: (() => void)[] = [];
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  function dequeue() {
    const latest = queue.shift();
    if (latest) {
      latest();
      timeoutHandle = setTimeout(dequeue, ms);
    } else {
      timeoutHandle = undefined;
    }
  }

  return (fn: () => void) => {
    queue.push(fn);
    if (queue.length === 1 && timeoutHandle === undefined) {
      dequeue();
    }
  };
}

const addCooldown = withCooldown(100);

export interface StickerAnimatorProps {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function StickerAnimator(_: StickerAnimatorProps) {
  const screenRef = useRef<HTMLDivElement>(null);

  const addAddAnimation = useCallback((animation: StickerAddAnimation) => {
    addCooldown(() => {
      if (screenRef.current) {
        const parent = screenRef.current;
        const { element: sticker, destroy } = createStickerElement(
          animation.sticker,
        );
        const translateElement = h(
          "div",
          {
            className: "sticker-anim-add-translate",
          },
          [sticker],
        );
        const rotateElement = h(
          "div",
          {
            className: "sticker-anim-add-rotate",
            style: {
              "--sticker-anim-rotate": `${Math.random() * 40 - 20}deg`,
            },
          },
          [translateElement],
        );

        parent.appendChild(rotateElement);
        rotateElement.addEventListener("animationend", () => {
          destroy();
          parent.removeChild(rotateElement);
          animation.callback?.();
        });
      }
    });
  }, []);

  useEffect(() => {
    const cleanup = addAnimationListener((animation) => {
      if (animation.type === "add") {
        addAddAnimation(animation);
      }
    });

    return cleanup;
  }, [addAddAnimation]);

  return <div className="sticker-anim-screen-positioning" ref={screenRef} />;
}
