import { Suspense } from "react";
import { STICKER_TYPES_BY_RARITY } from "../../../../stickers/data";
import { sendAddStickerEvent } from "../../../../stickers/events";
import { arrayRandom, range } from "../../../../util";
import { useStickers } from "../../hooks/useStickers";
import "./StickerBookFreeStickersUnlock.css";

const COMMONS_TO_ADD = 5;
const UNCOMMONS_TO_ADD = 2;
const RARES_TO_ADD = 0;

export function StickerBookFreeStickersUnlock() {
  const { enabled: isStickersEnabled } = useStickers();

  function addMoreStickers() {
    range(COMMONS_TO_ADD).forEach(() =>
      sendAddStickerEvent(arrayRandom(STICKER_TYPES_BY_RARITY.common)),
    );
    range(UNCOMMONS_TO_ADD).forEach(() =>
      sendAddStickerEvent(arrayRandom(STICKER_TYPES_BY_RARITY.uncommon)),
    );
    range(RARES_TO_ADD).forEach(() =>
      sendAddStickerEvent(arrayRandom(STICKER_TYPES_BY_RARITY.rare)),
    );
  }

  if (!isStickersEnabled) {
    return null;
  }

  return (
    <Suspense>
      <div>
        <button
          type="button"
          onClick={() => addMoreStickers()}
          className="sticker-book-free-stickers-button"
          data-hello-world="Hello world!"
          data-umami-event="stickers-free-stickers"
        >
          Give me more stickers
        </button>
      </div>
    </Suspense>
  );
}
