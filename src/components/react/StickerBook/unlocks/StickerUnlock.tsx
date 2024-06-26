import clsx from "clsx";
import { StrictMode, Suspense } from "react";
import { useStore } from "../../store/index";
import { Sticker } from "../components/Sticker/Sticker.tsx";
import { StickerFrame } from "../components/StickerFrame/index.tsx";
import type { StickerTypes } from "../types";
import "./StickerUnlock.css";
import { useAddUniqueSticker } from "./useAddUniqueSticker";

export interface StickerUnlockProps {
  type: StickerTypes;
  hideOnUnlock?: boolean;
}

export function StickerUnlock({ type, hideOnUnlock }: StickerUnlockProps) {
  const isStickersEnabled = useStore((store) => store.enabled.stickers);

  const { addSticker, isUnlocked } = useAddUniqueSticker({
    type,
  });

  if (!isStickersEnabled) {
    return null;
  }

  if (hideOnUnlock && isUnlocked) {
    return null;
  }

  return (
    <StrictMode>
      <Suspense>
        <div className="sticker-unlock-box">
          <div className="flow">
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
              <StickerFrame type={type}>
                <Sticker type={type} animated />
              </StickerFrame>
            </button>
          </div>
        </div>
      </Suspense>
    </StrictMode>
  );
}
