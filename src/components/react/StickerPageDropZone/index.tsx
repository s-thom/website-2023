import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import clsx from "clsx";
import { Trash2Icon } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import {
  pageCoordsToPosition,
  screenCoordsToPageCoords,
} from "../../../stickers/coordinates";
import { placeOnPage, removeFromPage } from "../../../stickers/functions";
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
        onDragEnter: () => {
          pageDropZone.classList.add("over");
        },
        onDragLeave: () => {
          pageDropZone.classList.remove("over");
        },
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
      dropTargetForElements({
        element: deleteZone,
        onDragEnter: () => {
          deleteZone.classList.add("over");
        },
        onDragLeave: () => {
          deleteZone.classList.remove("over");
        },
        onDrop: ({ source }) => {
          if (typeof source.data.stickerId === "string") {
            removeFromPage(source.data.stickerId);
          }
        },
      }),
      monitorForElements({
        onDragStart: () => {
          pageDropZone.classList.add("active");
          deleteZone.classList.add("active");
        },
        onDrop: () => {
          pageDropZone.classList.remove("active");
          pageDropZone.classList.remove("over");
          deleteZone.classList.remove("active");
          deleteZone.classList.remove("over");
        },
      }),
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
      <div ref={deleteZoneRef} className={clsx("sticker-delete-drop-zone")}>
        <Trash2Icon />
      </div>
    </>
  );
}
