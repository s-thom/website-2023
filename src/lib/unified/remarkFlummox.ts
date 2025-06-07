import { objects } from "friendly-words";
import type { Root } from "mdast";
import seedrandom, { type PRNG } from "seedrandom";
import type { Transformer } from "unified";
import { visit } from "unist-util-visit";
import { arrayRandom } from "../../util";

const MIN_WORD_LENGTH = 4;
const RANDOM_CHANCE = 0.2;

function randomWord(random: PRNG): string {
  return arrayRandom(objects, random);
}

function randomLink(random: PRNG): string {
  return `https://en.wikipedia.org/wiki/${randomWord(random)}`;
}

export interface RemarkFlummoxOptions {
  seed: string;
}

export function remarkFlummox({
  seed,
}: RemarkFlummoxOptions): Transformer<Root> {
  const random = seedrandom(seed);

  // eslint-disable-next-line @typescript-eslint/no-shadow
  return function remarkFlummox(tree) {
    visit(tree, (node) => {
      if (node.type === "text") {
        const words = node.value.split(/\b/);
        const flummoxedWords = words.map((word) =>
          word.length >= MIN_WORD_LENGTH && random() < RANDOM_CHANCE
            ? randomWord(random)
            : word,
        );

        // eslint-disable-next-line no-param-reassign
        node.value = flummoxedWords.join("");
      }

      if (node.type === "link" && node.url.startsWith("/")) {
        // eslint-disable-next-line no-param-reassign
        node.url = randomLink(random);
      }
    });
  };
}
