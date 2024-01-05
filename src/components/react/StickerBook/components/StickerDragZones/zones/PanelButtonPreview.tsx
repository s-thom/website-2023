import { useCallback, useEffect, useState } from "react";
import { useStore } from "../../../../store/index";
import { canAddSticker } from "../../../../store/reducers/stickers";
import type { AddStickerEvent, StickerTypes } from "../../../types";
import { Sticker, loadSticker } from "../../Sticker/Sticker.tsx";

// This is actually larger than the real animation time, but it provides a
// larger gap between animations
const ANIMATION_DURATION_MS = 3000;

export function PanelButtonPreview() {
  // This file turned out to have some complexities. I did manage to anticipate
  // them so I knew what I needed to write, but that doesn't prevent there from
  // being a lot of code that's pretty tightly linked with itself.

  const stickers = useStore((store) => store.stickers);

  // Types that are still having their data loaded
  const [pendingPromises, setPendingPromises] = useState<
    Promise<StickerTypes>[]
  >([]);
  // Types that have been loaded, but there's already an animation happening
  // and we don't want to interrupt it.
  const [readyTypes, setReadyTypes] = useState<StickerTypes[]>([]);
  // Types that are currently being animated
  const [displayingTypes, setDisplayingTypes] = useState<StickerTypes[]>([]);

  const enqueueSticker = useCallback((type: StickerTypes) => {
    const promise = loadSticker(type).then(() => type);
    setPendingPromises((curr) => [...curr, promise]);
  }, []);

  // Load sticker data in batches
  useEffect(() => {
    if (pendingPromises.length === 0) {
      return undefined;
    }

    let isCurrent = true;

    Promise.all(pendingPromises).then((types) => {
      // Prevent updates if the pending promises has changed
      if (!isCurrent) {
        return;
      }

      // Add all loaded types in a batch
      setReadyTypes((curr) => [...curr, ...types]);
      setPendingPromises([]);
    });

    return () => {
      isCurrent = false;
    };
  }, [pendingPromises]);

  // Display batches once previous animation has completed
  useEffect(() => {
    if (displayingTypes.length === 0 && readyTypes.length !== 0) {
      setDisplayingTypes(readyTypes);
      setReadyTypes([]);
    }
  }, [displayingTypes.length, readyTypes]);

  // Add stickers when sticker is added
  useEffect(() => {
    function onAddStickerEvent(event: InstanceType<typeof AddStickerEvent>) {
      if (
        canAddSticker(stickers, {
          id: "fake",
          type: event.detail.type,
          unlockPageId: undefined,
          unlockTime: Date.now(),
          zone: undefined,
          position: { type: "none" },
        })
      ) {
        enqueueSticker(event.detail.type);
      }
    }

    window.addEventListener("addsticker", onAddStickerEvent);

    return () => {
      window.removeEventListener("addsticker", onAddStickerEvent);
    };
  }, [enqueueSticker, stickers]);

  // Clear stickers after animation time has elapsed
  useEffect(() => {
    if (displayingTypes.length === 0) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setDisplayingTypes([]);
    }, ANIMATION_DURATION_MS);

    return () => {
      clearTimeout(timeout);
    };
  }, [displayingTypes.length]);

  if (displayingTypes.length === 0) {
    return null;
  }

  return (
    <div className="panel-button-preview">
      {displayingTypes.map((type, i) => (
        <div
          key={i}
          className="panel-button-preview-positioning"
          style={
            {
              "--index": i,
              "--count": displayingTypes.length,
            } as React.CSSProperties
          }
        >
          <div className="panel-button-preview-frame">
            <Sticker type={type} />
          </div>
        </div>
      ))}
    </div>
  );
}
