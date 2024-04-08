import { v4 as uuid } from "uuid";
import { arrayRandom, range } from "../util";
import { pageCoordsToPosition } from "./coordinates";
import { STICKER_TYPES_BY_RARITY, STICKER_TYPE_MAP } from "./data";
import { addSticker } from "./functions";
import { addStickerStoreListener, getStickerStore } from "./store";
import type { AddStickerEventData, StickerTypes } from "./types";

const MIN_STICKER_UNLOCKS_ON_PAGE = 1;
const MAX_STICKER_UNLOCKS_ON_PAGE = 5;

interface ScrollThresholdData {
  progress: number;
  shouldGiveCommon: boolean;
  shouldGiveUncommon: boolean;
}

export class ScrollUnlockHandler {
  private readonly pageId: string;

  private readonly special: StickerTypes | undefined;

  private readonly unlockOnScroll: boolean;

  private thresholds: ScrollThresholdData[] = [];

  private highestScrollProgress = 0;

  constructor(
    pageId: string,
    unlockOnScroll: boolean,
    special: StickerTypes | undefined,
  ) {
    this.pageId = pageId;
    this.special = special;
    this.unlockOnScroll = unlockOnScroll;
  }

  private giveSticker(type: StickerTypes, pageId?: string) {
    const newSticker = {
      id: uuid(),
      type,
      unlockTime: Date.now(),
      unlockPageId: pageId ?? this.pageId,
      zone: undefined,
      position: pageCoordsToPosition({ x: 0, y: 0 }),
    };

    addSticker(newSticker);
  }

  private onScroll() {
    const { stickers: currentStickers } = getStickerStore();

    if (this.special !== undefined) {
      if (!currentStickers.find((sticker) => sticker.type === this.special)) {
        // Must have scrolled some amount.
        // This does lead to an edge case where a large enough viewport means that nothing is given. but that's fine.
        // This system isn't exactly fair, but it also doesn't matter at all.
        if (document.documentElement.scrollTop > 0) {
          this.giveSticker(this.special);
        }
      }
    }

    const viewportHeight = window.innerHeight;
    // The amount that can be scrolled
    const pageHeight = document.documentElement.scrollHeight - viewportHeight;

    const progress = document.documentElement.scrollTop / pageHeight;
    if (progress <= this.highestScrollProgress) {
      // Regular stickers for this level have already been given out, so we can stop here.
      return;
    }

    const matchedThresholds = this.thresholds.filter(
      (threshold) =>
        threshold.progress > this.highestScrollProgress &&
        threshold.progress < progress,
    );

    if (matchedThresholds.length > 0) {
      matchedThresholds.forEach((threshold) => {
        if (threshold.shouldGiveCommon) {
          this.giveSticker(arrayRandom(STICKER_TYPES_BY_RARITY.common));
        }
        if (threshold.shouldGiveUncommon) {
          this.giveSticker(arrayRandom(STICKER_TYPES_BY_RARITY.uncommon));
        }
      });
    }

    this.highestScrollProgress = progress;
  }

  private onResize() {
    // Calculate thresholds for which stickers should be given out
    const viewportHeight = window.innerHeight;
    // The amount that can be scrolled
    const pageHeight = document.documentElement.scrollHeight - viewportHeight;

    // If there's not much to scroll, only give one sticker for the page
    const numViewports = pageHeight / viewportHeight;
    const numStickersToGive = Math.max(
      Math.min(Math.ceil(numViewports), MAX_STICKER_UNLOCKS_ON_PAGE),
      MIN_STICKER_UNLOCKS_ON_PAGE,
    );
    const allThresholds = range(numStickersToGive).map<ScrollThresholdData>(
      (i) => ({
        progress: (i + 1) / (numStickersToGive + 1),
        shouldGiveCommon: true,
        shouldGiveUncommon: false,
      }),
    );

    const { stickers: currentStickers } = getStickerStore();
    if (
      !currentStickers.find(
        (sticker) =>
          sticker.unlockPageId === this.pageId &&
          STICKER_TYPE_MAP[sticker.type].rarity === "uncommon",
      )
    ) {
      const unmetThresholds = allThresholds.filter(
        (threshold) => threshold.progress > this.highestScrollProgress,
      );
      if (unmetThresholds.length === 0) {
        // eslint-disable-next-line no-console
        console.log(
          "All thresholds have been met, but uncommon sticker has not been given. Giving now",
        );
        this.giveSticker(arrayRandom(STICKER_TYPES_BY_RARITY.uncommon));
      } else {
        arrayRandom(unmetThresholds).shouldGiveUncommon = true;
      }
    }

    this.thresholds = allThresholds;

    // Trigger onScroll just in case any stickers need to be given out based on the resize.
    this.onScroll();
  }

  private onAddStickerEvent(event: CustomEvent<AddStickerEventData>) {
    this.giveSticker(event.detail.type, event.detail.pageId);
  }

  start() {
    const onResize = this.onResize.bind(this);
    const onScroll = this.onScroll.bind(this);
    const onAddStickerEvent = this.onAddStickerEvent.bind(this);

    const subscribe = () => {
      if (this.unlockOnScroll) {
        window.addEventListener("resize", onResize);
        window.addEventListener("scrollend", onScroll);
      }
      window.addEventListener("addsticker", onAddStickerEvent);

      onResize();
    };

    const unsubscribe = () => {
      if (this.unlockOnScroll) {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("scrollend", onScroll);
      }
      window.removeEventListener("addsticker", onAddStickerEvent);
    };

    addStickerStoreListener<boolean>(
      (enabled) => {
        if (enabled) {
          subscribe();
        } else {
          unsubscribe();
        }
      },
      (value) => value.enabled,
    );
  }
}
