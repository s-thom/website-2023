import clsx from "clsx";
import { STICKER_TYPE_MAP } from "../../data";
import type { StickerTypes } from "../../types";
import styles from "./StickerFrame.module.css";

export interface StickerFrameProps extends React.PropsWithChildren {
  type: StickerTypes;
  showRarityLabel?: boolean;
  showName?: boolean;
  showDescription?: boolean;
  showUnlockedBy?: boolean;
}

export function StickerFrame({
  type,
  showRarityLabel,
  showName,
  showDescription,
  showUnlockedBy,
  children,
}: StickerFrameProps) {
  const data = STICKER_TYPE_MAP[type];

  const hasInfo = showName || showDescription || showUnlockedBy;

  return (
    <div className={clsx(styles.frame, styles[`frame-${data.rarity}`])}>
      {showRarityLabel && <span className={styles.rarity}>{data.rarity}</span>}
      {children}
      {hasInfo && (
        <div className={styles.info}>
          {showName && <span className={styles.name}>{data.name}</span>}
          {showDescription && data.description && (
            <span className={styles.description}>{data.description}</span>
          )}
          {showUnlockedBy && data.unlockedBy && (
            <span className={styles.unlockedBy}>
              Unlocked by:{" "}
              <span className={styles.unlockedByText}>{data.unlockedBy}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
