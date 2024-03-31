import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";
import { BookHeartIcon, Trash2Icon } from "lucide-react";
import { useStore } from "../../../../store";
import { PanelButtonPreview } from "./PanelButtonPreview.tsx";

export interface PanelButtonProps {
  onClick?: () => void;
}

export function PanelButton({ onClick }: PanelButtonProps) {
  const stickers = useStore((store) => store.stickers);
  const { isOver, setNodeRef } = useDroppable({
    id: "panel",
  });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "small-box",
        "sticker-panel-button",
        "sticker-drag-zone",
        "sticker-drag-zone-floating",
        isOver && "sticker-drag-zone-over",
        stickers.length > 0 && "sticker-panel-button-has-stickers",
      )}
    >
      <button
        className="sticker-panel-icon-button"
        data-umami-event="stickers-open-panel"
        onClick={() => onClick?.()}
      >
        {isOver ? (
          <Trash2Icon>
            <title>Remove from page</title>
          </Trash2Icon>
        ) : (
          <BookHeartIcon>
            <title>Open sticker book</title>
          </BookHeartIcon>
        )}
      </button>
      <PanelButtonPreview />
    </div>
  );
}
