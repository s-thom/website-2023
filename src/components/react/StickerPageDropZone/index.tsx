import {
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/dist/cjs/entry-point/element/adapter";
import clsx from "clsx";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  pagePositionToType,
  placeOnPage,
  removeFromPage,
  toPagePosition,
  type CenterPosition,
  type StickerInfo,
} from "../../../stickers/stickers";
import { combine } from "../../../util";
import { useStickers, useStickersEnabled } from "../hooks/useStickers";
import { StickerWrapper } from "../StickerWrapper.tsx";
import "./index.css";

const useIdempotentLayoutEffect =
  "window" in globalThis ? useLayoutEffect : useEffect;

function getStickerPositionStyle(sticker: StickerInfo): CSSProperties {
  const position = toPagePosition(sticker.position);
  return {
    top: position.coordinates.y,
    left: position.coordinates.x,
  };
}

export interface StickerPageDropZoneProps {
  pageId: string;
}

export function StickerPageDropZone({ pageId }: StickerPageDropZoneProps) {
  const [isClient, setIsClient] = useState(false);
  useIdempotentLayoutEffect(() => {
    setIsClient(true);
  }, []);

  const pageDropZoneRef = useRef<HTMLDivElement>(null);
  const deleteZoneRef = useRef<HTMLDivElement>(null);

  const enabled = useStickersEnabled();
  const { stickers } = useStickers();

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
            const stickerSize = source.element.getBoundingClientRect();

            const pagePosition = toPagePosition({
              type: "screen",
              coordinates: {
                x: location.current.input.clientX - stickerSize.width / 2,
                y: location.current.input.clientY - stickerSize.height / 2,
              },
            });
            const centerPosition = pagePositionToType("center", pagePosition) as CenterPosition;
            placeOnPage(source.data.stickerId, pageId, centerPosition);
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
  }, [enabled, pageId, isClient]);

  if (!enabled || !isClient) {
    return null;
  }

  return (
    <>
      <div className="sticker-page-positioning">
        {pageStickers.map((sticker) => (
          <div
            key={sticker.id}
            className="sticker-positioning"
            style={getStickerPositionStyle(sticker)}
          >
            <StickerWrapper
              type={sticker.type}
              stickerId={sticker.id}
              draggable
            />
          </div>
        ))}
      </div>
      <div ref={pageDropZoneRef} className={clsx("sticker-page-drop-zone")} />
      <div ref={deleteZoneRef} className={clsx("sticker-delete-drop-zone")}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          <line x1="10" x2="10" y1="11" y2="17" />
          <line x1="14" x2="14" y1="11" y2="17" />
        </svg>
      </div>
    </>
  );
}
