import type { Root } from "mdast";
import type { Transformer } from "unified";
import { visit } from "unist-util-visit";

export function remarkTempNoImages(): Transformer<Root> {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  return function remarkTempNoImages(tree) {
    visit(tree, (node) => {
      if (node.type === "image") {
        // eslint-disable-next-line no-param-reassign
        node.url = "/fake-url";
      }
    });
  };
}
