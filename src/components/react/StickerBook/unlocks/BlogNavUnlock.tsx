import clsx from "clsx";
import { StrictMode, Suspense, useMemo, useState } from "react";
import { useStore } from "../../store";
import { Sticker } from "../stickers/Sticker.tsx";
import type { StickerTypes } from "../types";
import styles from "./BlogNavUnlock.module.css";

export interface BlogNavUnlockProps {
  stickerType: StickerTypes;
}

export function BlogNavUnlock({ stickerType }: BlogNavUnlockProps) {
  const isStickersEnabled = useStore((store) => store.enabled.stickers);

  const stickers = useStore((store) => store.stickers);
  const hasAlreadyUnlocked = useMemo(
    () => !!stickers.find((sticker) => sticker.type === stickerType),
    [stickers, stickerType],
  );
  const [didUnlockThisLoad, setDidUnlockThisLoad] = useState(false);

  function unlockSticker() {
    const event = new CustomEvent("addsticker", {
      detail: { type: stickerType },
    });
    window.dispatchEvent(event);
    setDidUnlockThisLoad(true);
  }

  if (!isStickersEnabled) {
    return null;
  }

  return (
    <StrictMode>
      <Suspense>
        <div className={styles.box}>
          {hasAlreadyUnlocked ? (
            <div className="flow">
              <p>
                {didUnlockThisLoad
                  ? "You can add stickers to any page on this site, not just this one."
                  : "You've already claimed this sticker. There are more hidden around the site!"}
              </p>
              <button
                className={clsx(styles.button, styles.claimed)}
                type="button"
                disabled
              >
                <Sticker
                  sticker={{
                    id: "fake",
                    pageId: undefined,
                    coordinates: { x: 0, y: 0 },
                    type: stickerType,
                  }}
                />
              </button>
            </div>
          ) : (
            <div className="flow">
              <p>
                You&apos;ve reached the end of this blog! While you wait for me
                to write more words, have a sticker for your collection.
              </p>
              <button
                className={clsx(styles.button)}
                type="button"
                onClick={() => unlockSticker()}
              >
                <Sticker
                  sticker={{
                    id: "fake",
                    pageId: undefined,
                    coordinates: { x: 0, y: 0 },
                    type: stickerType,
                  }}
                />
              </button>
            </div>
          )}
        </div>
      </Suspense>
    </StrictMode>
  );
}
