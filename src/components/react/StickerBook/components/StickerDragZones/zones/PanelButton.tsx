import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";
import { SmilePlusIcon, Trash2Icon } from "lucide-react";
import styles from "./PanelButton.module.css";
import { PanelButtonPreview } from "./PanelButtonPreview.tsx";
import zoneStyles from "./zones.module.css";

export interface PanelButtonProps {
  onClick?: () => void;
}

export function PanelButton({ onClick }: PanelButtonProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: "panel",
  });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        styles.panelButton,
        zoneStyles.zone,
        zoneStyles.floatingZone,
        isOver && zoneStyles.zoneOver,
      )}
    >
      <button className={styles.iconButton} onClick={() => onClick?.()}>
        {isOver ? (
          <Trash2Icon>
            <title>Remove from page</title>
          </Trash2Icon>
        ) : (
          <SmilePlusIcon>
            <title>Open sticker book</title>
          </SmilePlusIcon>
        )}
      </button>
      <PanelButtonPreview />
    </div>
  );
}
