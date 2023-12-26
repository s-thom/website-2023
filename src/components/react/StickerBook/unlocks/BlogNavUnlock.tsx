import clsx from "clsx";
import { StrictMode, Suspense } from "react";
import { useStore } from "../../store";
import { Sticker } from "../components/Sticker/Sticker.tsx";
import type { StickerTypes } from "../types";
import styles from "./BlogNavUnlock.module.css";
import { useAddUniqueSticker } from "./useAddUniqueSticker";

export interface BlogNavUnlockProps {
  stickerType: StickerTypes;
}

export function BlogNavUnlock({ stickerType }: BlogNavUnlockProps) {
  const isStickersEnabled = useStore((store) => store.enabled.stickers);

  const { addSticker, isUnlocked, isRecentlyUnlocked } = useAddUniqueSticker({
    type: stickerType,
  });

  if (!isStickersEnabled) {
    return null;
  }

  return (
    <StrictMode>
      <Suspense>
        <div className={styles.box}>
          {isUnlocked ? (
            <div className="flow">
              <p>
                {isRecentlyUnlocked
                  ? "You can add stickers to any page on this site, not just this one."
                  : "You've already claimed this sticker. There are more hidden around the site!"}
              </p>
              <button
                className={clsx(styles.button, styles.claimed)}
                type="button"
                disabled
              >
                <Sticker type={stickerType} />
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
                onClick={addSticker}
              >
                <Sticker type={stickerType} />
              </button>
            </div>
          )}
        </div>
      </Suspense>
    </StrictMode>
  );
}
