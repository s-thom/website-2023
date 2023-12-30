import clsx from "clsx";
import { StrictMode, Suspense } from "react";
import { useStore } from "../../store";
import { Sticker } from "../components/Sticker/Sticker.tsx";
import { StickerFrame } from "../components/StickerFrame/index.tsx";
import type { StickerTypes } from "../types";
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

  if (isUnlocked && !isRecentlyUnlocked) {
    return null;
  }

  return (
    <StrictMode>
      <Suspense>
        <div className="sticker-unlock-box">
          <div className="flow">
            <p>
              {isUnlocked
                ? "You can add stickers to any page on this site, not just this one."
                : "You've reached the end of this blog! While you wait for me to write more words, have a sticker for your collection."}
            </p>
            <button
              className={clsx(
                "sticker-unlock-button",
                isUnlocked && "sticker-unlock-claimed",
              )}
              type="button"
              onClick={!isUnlocked ? addSticker : undefined}
              disabled={isUnlocked}
            >
              <StickerFrame type={stickerType}>
                <Sticker type={stickerType} animated={!isUnlocked} />
              </StickerFrame>
            </button>
          </div>
        </div>
      </Suspense>
    </StrictMode>
  );
}
