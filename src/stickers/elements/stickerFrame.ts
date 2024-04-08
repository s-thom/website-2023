import type { StickerRarity } from "../types";
import "./stickerFrame.css";

export interface StickerFrameProps {
  rarity: StickerRarity;
  showRarityLabel?: boolean;
  name?: string;
  description?: string;
  unlockedBy?: string;
  hideFrameOnCommon?: boolean;
  className?: string;
}

export function createStickerFrame(
  child: HTMLElement,
  options: StickerFrameProps,
): HTMLDivElement {
  const {
    rarity,
    showRarityLabel,
    description,
    name,
    unlockedBy,
    hideFrameOnCommon,
    className,
  } = options;

  const shouldHaveBorder = hideFrameOnCommon ? rarity !== "common" : true;

  const container = document.createElement("div");
  container.classList.add("sticker-frame");
  if (className) {
    container.classList.add(...className.split(/\s+/g));
  }
  if (shouldHaveBorder) {
    container.classList.add(`sticker-frame-${rarity}`);
  }

  if (showRarityLabel) {
    const label = document.createElement("span");
    label.classList.add("sticker-frame-rarity");
    label.textContent = rarity;

    container.appendChild(label);
  }

  container.appendChild(child);

  if (name || description || unlockedBy) {
    const infoBox = document.createElement("div");
    infoBox.classList.add("sticker-frame-info", "flow");

    if (name) {
      const nameEl = document.createElement("span");
      nameEl.classList.add("sticker-frame-name");
      nameEl.textContent = name;
      infoBox.appendChild(nameEl);
    }

    if (description) {
      const descriptionEl = document.createElement("span");
      descriptionEl.classList.add("sticker-frame-description");
      descriptionEl.textContent = description;
      infoBox.appendChild(descriptionEl);
    }

    if (unlockedBy) {
      const unlockedByEl = document.createElement("span");
      unlockedByEl.classList.add("sticker-frame-unlockedBy");
      unlockedByEl.appendChild(document.createTextNode("Unlocked by: "));

      const unlockedByText = document.createElement("span");
      unlockedByText.classList.add("sticker-frame-description");
      unlockedByText.textContent = unlockedBy;
      unlockedByEl.appendChild(unlockedByText);

      infoBox.appendChild(unlockedByEl);
    }

    container.appendChild(infoBox);
  }

  return container;
}
