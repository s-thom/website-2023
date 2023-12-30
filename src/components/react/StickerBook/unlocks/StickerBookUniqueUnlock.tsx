import clsx from "clsx";
import { StrictMode, Suspense } from "react";
import { useStore } from "../../store/index";
import { Sticker } from "../components/Sticker/Sticker.tsx";
import { StickerFrame } from "../components/StickerFrame/index.tsx";
import type { StickerTypes } from "../types";
import "./index.css";
import { useAddUniqueSticker } from "./useAddUniqueSticker";

const STICKER_TYPE: StickerTypes = "fire-heart";

export function StickerBookUniqueUnlock() {
  const isStickersEnabled = useStore((store) => store.enabled.stickers);

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
        <div className="sticker-unlock-box">
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
            >
              <StickerFrame type={STICKER_TYPE}>
                <Sticker type={STICKER_TYPE} animated />
              </StickerFrame>
            </button>
          </div>
        </div>
      </Suspense>
    </StrictMode>
  );
}
