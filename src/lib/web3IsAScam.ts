import { sendEvent } from "./analytics";

const MS_TO_DESTRUCTION = 5 * 60 * 1000;
const MAX_CHARS_TO_REMOVE_PER_ELEMENT = 3;

/**
 * Recursively remove elements if the parent chain is empty.
 * This just saves time by not having the script remove elements with little
 * effect on the page.
 *
 * This uses a do-while loop, as we always want the first iteration to happen.
 * This is because the element passed in may have children (e.g. if it is a `<svg>`
 * or `<picture>` element) or text (if removing characters would empty its text content),
 * but we want the child check for later.
 */
function removeRecursive(element: Element) {
  let currentElement = element;

  do {
    const parent = currentElement.parentElement;
    if (!parent || parent === element) {
      break;
    }

    parent.removeChild(currentElement);
    currentElement = parent;
  } while (
    // Continue loop while element has no text or children remaining
    !currentElement.textContent?.trim() &&
    currentElement.children.length === 0
  );
}

function getLeafElements() {
  return Array.from(
    document.querySelectorAll(
      "body :is(svg, picture, :not(:is(script, style, svg *, picture *)):not(:has(*))",
    ),
  );
}

function removeSomeCharacters(charsToRemove: number) {
  let removedChars = 0;
  while (removedChars < charsToRemove) {
    // This query may not be the cheapest in the world, but I also don't care.
    // After all, this is for a feature that is meant to be annoying users, so it fits.
    // For the most part, this query gets all elements that have no children.
    // There is a special case for SVG and picture elements, since I want to remove all
    // of them at once instead of each individual part at a time.
    const leafElements = getLeafElements();

    if (leafElements.length === 0) {
      return;
    }

    const toRemove = Math.min(
      charsToRemove - removedChars,
      MAX_CHARS_TO_REMOVE_PER_ELEMENT,
    );

    const node = leafElements[Math.floor(Math.random() * leafElements.length)];
    if (node.textContent) {
      const chars = node.textContent.split("");

      // If we would remove all the characters, remove the node instead.
      if (chars.length <= toRemove) {
        removeRecursive(node);
        removedChars += chars.length;
        continue;
      }

      for (let i = 0; i < toRemove; i++) {
        chars.splice(Math.floor(Math.random() * chars.length), 1);
        removedChars++;
      }

      const newContent = chars.join("");
      if (node.textContent.trim() === "") {
        removeRecursive(node);
        continue;
      }
      node.textContent = newContent;
    } else {
      removeRecursive(node);
      removedChars++;
    }
  }
}

function addBanner() {
  const element = document.createElement("div");
  element.innerHTML = `
  <h2>Cryptocurrency wallet detected</h2>
  <p>It looks like your browser currently has a cryptocurrency wallet attached to it.</p>
  <p>You'll start to notice something happening soon. This website will self-destruct by removing random characters from words on the page, eventually making the text unreadable. If you want to see the effect exaggerated, try the home page where there's less text to destroy.</p>
  <h3>What can you do about this</h3>
  <p>The obvious answer is to remove your wallet from your browser. In fact, I'd prefer if you got out of crypto altogether, but I'm going to be realistic and say that the gradual destruction of my own website probably isn't going to convince you.</p>
  <p>Another option is you stop reading this page and get on with your life.</p>
  <p>If your wallet gives you the option to not announce itself when requested, you could also do that.</p>
  <p>You could also block Javascript, but if you do please do it browser-wide so any crypto-related sites also stop working. If you could also campaign for a return to server-side applications instead of websites sending megabytes of Javascript to clients, I'd appreciate that too.</p>
  <p>The final option is to continue reading and just deal with the disruption. You might find some funny word combinations. You could also refresh the page every once in a while to get all the words back.</p>
  <h3>Why?</h3>
  <p>This could be a whole page in itself, and the more text I write here the less my website destroys itself, so I'm going to stop writing now.</p>
  `;

  element.classList.add("flow");
  element.style.top = "0";
  element.style.padding = "5vw";
  element.style.backgroundColor = "var(--color-background-error)";
  element.style.borderBlockEnd = "3px solid var(--color-text)";
  document.body.insertBefore(element, document.body.children[0]);
}

function getCharactersPerMs() {
  let count = 0;
  getLeafElements().forEach((element) => {
    if (element.textContent) {
      count += element.textContent.length;
    } else {
      count++;
    }
  });

  return count / MS_TO_DESTRUCTION;
}

export function web3IsAScam() {
  sendEvent("web3IsAScam", {});
  addBanner();
  const numToRemovePerMs = getCharactersPerMs();
  let lastTimestamp = performance.now();

  function cb() {
    const now = performance.now();
    const msElapsed = now - lastTimestamp;

    const toRemoveRaw = numToRemovePerMs * msElapsed;
    const int = Math.floor(toRemoveRaw);
    const toRemove = int + (Math.random() < toRemoveRaw - int ? 1 : 0);
    removeSomeCharacters(toRemove);

    lastTimestamp = now;
    requestAnimationFrame(cb);
  }
  cb();
}
