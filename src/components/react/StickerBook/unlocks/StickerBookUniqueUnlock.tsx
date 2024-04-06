import clsx from "clsx";
import { StrictMode, Suspense } from "react";
import { useStickers } from "../../hooks/useStickers";
import { Sticker } from "../components/Sticker/Sticker.tsx";
import { StickerFrame } from "../components/StickerFrame/index.tsx";
import type { StickerTypes } from "../../../../stickers/types";
import "./StickerUnlock.css";
import { useAddUniqueSticker } from "./useAddUniqueSticker";

const STICKER_TYPE: StickerTypes = "fire-heart";

export function StickerBookUniqueUnlock() {
  const { enabled: isStickersEnabled } = useStickers();

  const { addSticker, isUnlocked } = useAddUniqueSticker({
    type: STICKER_TYPE,
  });

  if (!isStickersEnabled) {
    return null;
  }

  if (isUnlocked) {
    return null;
  }

  return (
    <StrictMode>
      <Suspense>
        <div className="small-box sticker-unlock-box">
          <div className="flow">
            <p>
              Since you've made it this far, have a bonus sticker on the house.
            </p>
            <button
              className={clsx(
                "sticker-unlock-button",
                isUnlocked && "sticker-unlock-claimed",
              )}
              type="button"
              onClick={!isUnlocked ? addSticker : undefined}
              disabled={isUnlocked}
              data-umami-event="sickers-sticker-book-unlock"
            >
              <StickerFrame type={STICKER_TYPE}>
                <Sticker type={STICKER_TYPE} animated={!isUnlocked} />
              </StickerFrame>
            </button>
          </div>
        </div>
      </Suspense>
    </StrictMode>
  );
}
