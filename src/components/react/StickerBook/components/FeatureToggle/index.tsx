import { Suspense } from "react";
import { toggleStickersEnabled } from "../../../../../stickers/store";
import { useStickers } from "../../../hooks/useStickers";
import "./FeatureToggle.css";

export function FeatureToggle() {
  const { enabled } = useStickers();

  return (
    <Suspense>
      <noscript>
        <p className="stickers-toggle-noscript">
          You have Javascript disabled, which means this button won't work. It
          also means the stickers won't work, so I guess there's no problem
          here?
        </p>
      </noscript>
      <div>
        <button
          type="button"
          onClick={() => toggleStickersEnabled(!enabled)}
          suppressHydrationWarning
          className="stickers-toggle-button"
          data-umami-event={`stickers-toggle-${
            enabled ? "disabled" : "enabled"
          }`}
        >
          {enabled ? "Disable stickers" : "Enable stickers"}
        </button>
      </div>
    </Suspense>
  );
}
