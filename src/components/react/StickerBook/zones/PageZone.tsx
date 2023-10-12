import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";
import type { PropsWithChildren } from "react";
import styles from "./PageZone.module.css";

export interface PageZoneProps extends PropsWithChildren {}

export function PageZone({ children }: PageZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id: "page" });

  return (
    <>
      <div className={styles.pageFloatZone}>{children}</div>
      <div
        ref={setNodeRef}
        className={clsx(styles.pageDropZone, isOver && styles.pageDropZoneOver)}
      />
    </>
  );
}
