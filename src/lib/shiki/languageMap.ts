import type { CodeBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { BundledLanguage, SpecialLanguage } from "shiki";

export const languageMap: Partial<
  Record<
    CodeBlockObjectResponse["code"]["language"],
    BundledLanguage | SpecialLanguage
  >
> = {
  arduino: "c",
  basic: "text",
  coffeescript: "coffee",
  "c++": "cpp",
  flow: "tsx",
  fortran: "text",
  glsl: "shader",
  javascript: "jsx",
  json: "jsonc",
  livescript: "text",
  markup: "text",
  mermaid: "text",
  "plain text": "text",
  protobuf: "hcl",
  reason: "text",
  typescript: "tsx",
  "vb.net": "vb",
  "visual basic": "vb",
  webassembly: "wasm",
  "java/c/c++/c#": "java",
};
