import clsx from "clsx";
import { STICKER_TYPE_MAP } from "../../data";
import type { StickerTypes } from "../../types";
import "./index.css";

export interface StickerFrameProps extends React.PropsWithChildren {
  type: StickerTypes;
  showRarityLabel?: boolean;
  showName?: boolean;
  showDescription?: boolean;
  showUnlockedBy?: boolean;
  hideFrameOnCommon?: boolean;
  className?: string;
}

export function StickerFrame({
  type,
  showRarityLabel,
  showName,
  showDescription,
  showUnlockedBy,
  hideFrameOnCommon,
  className,
  children,
}: StickerFrameProps) {
  const data = STICKER_TYPE_MAP[type];

  const hasInfo = showName || showDescription || showUnlockedBy;

  const shouldHaveBorder = hideFrameOnCommon ? data.rarity !== "common" : true;

  return (
    <div
      className={clsx(
        className,
        "sticker-frame",
        shouldHaveBorder && `sticker-frame-${data.rarity}`,
      )}
    >
      {showRarityLabel && (
        <span className="sticker-frame-rarity">{data.rarity}</span>
      )}
      {children}
      {hasInfo && (
        <div className={clsx("sticker-frame-info", "flow")}>
          {showName && <span className="sticker-frame-name">{data.name}</span>}
          {showDescription && data.description && (
            <span className="sticker-frame-description">
              {data.description}
            </span>
          )}
          {showUnlockedBy && data.unlockedBy && (
            <span className="sticker-frame-unlockedBy">
              Unlocked by:{" "}
              <span className="sticker-frame-unlockedByText">
                {data.unlockedBy}
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
