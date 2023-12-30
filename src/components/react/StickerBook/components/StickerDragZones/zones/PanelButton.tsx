import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";
import { SmilePlusIcon, Trash2Icon } from "lucide-react";
import { PanelButtonPreview } from "./PanelButtonPreview.tsx";

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
        "sticker-panel-button",
        "sticker-drag-zone",
        "sticker-drag-zone-floating",
        isOver && "sticker-drag-zone-over",
      )}
    >
      <button className="sticker-panel-icon-button" onClick={() => onClick?.()}>
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
