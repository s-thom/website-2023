import type { CodeBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import parse from "fenceparser";
import type { BundledLanguage, SpecialLanguage } from "shiki";
import { richTextToUnformattedString } from "../notion/util";
import { languageMap } from "./languageMap";

type CodeBlockContentInfo =
  | {
      type: "code";
      code: string;
      language: BundledLanguage | SpecialLanguage;
      meta?: string;
    }
  | {
      type: "override";
      component: string;
      props?: object;
      content?: string;
    }
  | {
      type: "none";
    };

export function getCodeBlockContentInfo(
  block: CodeBlockObjectResponse,
): CodeBlockContentInfo {
  const blockLanguage = block.code.language;
  const blockContent = richTextToUnformattedString(block.code.rich_text);

  if (blockLanguage && blockContent) {
    let notionLanguage = blockLanguage.toLowerCase();
    let metaString = "";
    let code = blockContent;
    // Try match language from first line of text
    // Match get a "comment", followed by the keyword "lang"
    const match = blockContent.match(
      /^(?:[/#]+ *lang:? *([^\n\s]*)(?: *([^\r\n]*)))(?:\r?\n)?([\s\S]*)$/,
    );
    if (match) {
      [, notionLanguage, metaString, code] = match;
    }

    const language =
      languageMap[notionLanguage as keyof typeof languageMap] ??
      notionLanguage ??
      "tsx";
    const meta = metaString ? parse(metaString) : {};

    // Extra: marker for component override
    if (language === "override") {
      return {
        type: "override",
        component: meta.component as string,
        props: meta.props as object | undefined,
        content: code,
      };
    }

    return {
      type: "code",
      code,
      language: language as BundledLanguage | SpecialLanguage,
      meta: metaString || undefined,
    };
  }

  // eslint-disable-next-line no-console
  console.warn(
    `Unable to determine language and/or content of code block ${block.id}`,
  );
  return { type: "none" };
}
