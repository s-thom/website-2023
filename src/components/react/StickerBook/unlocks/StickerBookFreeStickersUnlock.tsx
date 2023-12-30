import { Suspense } from "react";
import { arrayRandom, range } from "../../../../util";
import { useStore } from "../../store";
import { STICKER_TYPES_BY_RARITY } from "../data";
import "./StickerBookFreeStickersUnlock.css";
import { addSticker } from "./util";

const COMMONS_TO_ADD = 5;
const UNCOMMONS_TO_ADD = 2;
const RARES_TO_ADD = 1;

export function StickerBookFreeStickersUnlock() {
  const isStickersEnabled = useStore((store) => store.enabled.stickers);

  function addMoreStickers() {
    range(COMMONS_TO_ADD).forEach(() =>
      addSticker(arrayRandom(STICKER_TYPES_BY_RARITY.common)),
    );
    range(UNCOMMONS_TO_ADD).forEach(() =>
      addSticker(arrayRandom(STICKER_TYPES_BY_RARITY.uncommon)),
    );
    range(RARES_TO_ADD).forEach(() =>
      addSticker(arrayRandom(STICKER_TYPES_BY_RARITY.rare)),
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
        >
          Give me more stickers
        </button>
      </div>
    </Suspense>
  );
}
