import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import clsx from "clsx";
import { useEffect, useMemo, useRef } from "react";
import {
  pageCoordsToPosition,
  screenCoordsToPageCoords,
} from "../../../stickers/coordinates";
import { placeOnPage } from "../../../stickers/functions";
import { useStickers } from "../hooks/useStickers";
import { StickerWrapper } from "../StickerWrapper.tsx";
import "./index.css";

export interface StickerPageDropZoneProps {
  pageId: string;
}

export function StickerPageDropZone({ pageId }: StickerPageDropZoneProps) {
  const pageDropZoneRef = useRef<HTMLDivElement>(null);
  const deleteZoneRef = useRef<HTMLDivElement>(null);
  const { enabled, stickers } = useStickers();

  const pageStickers = useMemo(
    () => stickers.filter((sticker) => sticker.zone === pageId),
    [pageId, stickers],
  );

  useEffect(() => {
    const pageDropZone = pageDropZoneRef.current;
    const deleteZone = deleteZoneRef.current;

    if (!enabled || !pageDropZone || !deleteZone) {
      return undefined;
    }

    const cleanup = combine(
      dropTargetForElements({
        element: pageDropZone,
        onDrop: ({ source, location }) => {
          if (typeof source.data.stickerId === "string") {
            const unTransformedPosition = {
              x: location.current.input.clientX,
              y: location.current.input.clientY,
            };
            const position = pageCoordsToPosition(
              screenCoordsToPageCoords(unTransformedPosition),
            );
            placeOnPage(source.data.stickerId, pageId, position);
          }
        },
      }),
      dropTargetForElements({ element: deleteZone }),
    );

    return () => cleanup();
  }, [enabled, pageId]);

  if (!enabled) {
    return null;
  }

  return (
    <>
      <div className="sticker-page-positioning">
        {pageStickers.map((sticker) => (
          <StickerWrapper
            key={sticker.id}
            type={sticker.type}
            stickerId={sticker.id}
            draggable
          />
        ))}
      </div>
      <div ref={pageDropZoneRef} className={clsx("sticker-page-drop-zone")} />
      <div ref={deleteZoneRef} className={clsx("sticker-delete-drop-zone")} />
    </>
  );
}
