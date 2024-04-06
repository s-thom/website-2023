import type { CenterPosition, StickerPosition, Vec2 } from "./types";

// This file exists to translate between different coordinate systems that are present in the stickers code.
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
