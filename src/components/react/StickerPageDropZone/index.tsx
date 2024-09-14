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
  placeOnPage,
  removeFromPage,
  type CenterPosition,
  type StickerInfo,
  type StickerPosition,
  type Vec2,
} from "../../../stickers/stickers";
import { combine } from "../../../util";
import { useStickers } from "../hooks/useStickers";
import { StickerWrapper } from "../StickerWrapper.tsx";
import "./index.css";

const useIdempotentLayoutEffect =
  "window" in globalThis ? useLayoutEffect : useEffect;

// These functions exist to translate between different coordinate systems that are present in the stickers code.
// Outside of the stickers themselves, there's two important systems that come in to play due to scrolling:
// * Screen: The x/y coordinates on the user's screen. The drag/drop uses these coordinates.
// * Page:   The x/y coordinates on the page (may be larger than the physical screen). Invariant of scrolling.
// Stickers themselves also use different coordinate systems:
// * none:   Always x=0,y=0. Used in the panel where position isn't important
// * center: The x coordinate is relative to the midpoint of the screen.
//           Helps keep stickers around when resizing the window.

const EDGE_PADDING = 4;

// TODO: Brand these types? It would prevent accidental usage in the wrong place

export function screenCoordsToPageCoords(screen: Vec2): Vec2 {
  return {
    x: screen.x + window.scrollX,
    y: screen.y + window.scrollY,
  };
}

export function pageCoordsToPosition(page: Vec2): StickerPosition {
  const midpoint = document.documentElement.scrollWidth / 2;

  return {
    type: "center",
    coordinates: {
      x: page.x - midpoint,
      y: page.y,
    },
  };
}

function centerPositionToPageCoords(position: CenterPosition): Vec2 {
  const midpoint = document.documentElement.scrollWidth / 2;
  const translatedX = position.coordinates.x + midpoint;

  // TODO: figure out how to get the current width of a sticker.
  // getComputedStyle() doesn't work, as it returns the pre-`calc`ed value.
  const stickerWidth = 64;

  const clampedX = Math.max(
    Math.min(
      translatedX,
      document.documentElement.scrollWidth - stickerWidth - EDGE_PADDING,
    ),
    EDGE_PADDING,
  );

  return {
    x: clampedX,
    y: position.coordinates.y,
  };
}

function nonePositionToPageCoords(): Vec2 {
  return {
    x: 0,
    y: 0,
  };
}

export function positionToPageCoords(position: StickerPosition): Vec2 {
  switch (position.type) {
    case "none":
      return nonePositionToPageCoords();
    case "center":
      return centerPositionToPageCoords(position);
    default:
      // eslint-disable-next-line no-console
      console.warn(`Unknown position type ${(position as any).type}`);
      return { x: 0, y: 0 };
  }
}

function getStickerPositionStyle(sticker: StickerInfo): CSSProperties {
  const coords = positionToPageCoords(sticker.position);
  return {
    top: coords.y,
    left: coords.x,
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
            const stickerSize = source.element.getBoundingClientRect();
            const unTransformedPosition = {
              x: location.current.input.clientX - stickerSize.width / 2,
              y: location.current.input.clientY - stickerSize.height / 2,
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
