import parse from "fenceparser";
import type { BundledLanguage, SpecialLanguage } from "shiki";
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
  content: string,
  language?: string | null,
): CodeBlockContentInfo {
  if (language && content) {
    let rawLanguage = language.toLowerCase();
    let metaString = "";
    let code = content;
    // Try match language from first line of text
    // Match get a "comment", followed by the keyword "lang"
    const match = content.match(
      /^(?:[/#]+ *lang:? *([^\n\s]*)(?: *([^\r\n]*)))(?:\r?\n)?([\s\S]*)$/,
    );
    if (match) {
      [, rawLanguage, metaString, code] = match;
    }

    const finalisedLanguage =
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      languageMap[rawLanguage as keyof typeof languageMap] ??
      rawLanguage ??
      "tsx";
    const meta = metaString ? parse(metaString) : {};

    // Extra: marker for component override
    if (finalisedLanguage === "override") {
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
      language: finalisedLanguage as BundledLanguage | SpecialLanguage,
      meta: metaString || undefined,
    };
  }

  return { type: "none" };
}
