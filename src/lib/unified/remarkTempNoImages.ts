import type { Root } from "mdast";
import type { Transformer } from "unified";
import { visit } from "unist-util-visit";

export function remarkTempNoImages(): Transformer<Root> {
  return function remarkTempNoImages(tree) {
    visit(tree, (node) => {
      if (node.type === "image") {
        node.url = "/fake-url";
      }
    });
  };
}
