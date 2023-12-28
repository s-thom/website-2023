import { Suspense } from "react";
import { useStore } from "../../../store";
import styles from "./FeatureToggle.module.css";

export function FeatureToggle() {
  const isStickersEnabled = useStore((store) => store.enabled.stickers);
  const toggleFeature = useStore((store) => store.toggleFeature);

  return (
    <Suspense>
      <noscript>
        <p className={styles.noscript}>
          You have Javascript disabled, which means this button won't work. It
          also means the stickers won't work, so I guess there's no problem
          here?
        </p>
      </noscript>
      <div>
        <button
          type="button"
          onClick={() => toggleFeature("stickers")}
          suppressHydrationWarning
          className={styles.button}
        >
          {isStickersEnabled ? "Disable stickers" : "Enable stickers"}
        </button>
      </div>
    </Suspense>
  );
}
