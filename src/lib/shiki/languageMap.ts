export const languageMap: Record<string, string> = {
  arduino: "c",
  basic: "",
  coffeescript: "coffee",
  "c++": "cpp",
  flow: "tsx",
  fortran: "",
  glsl: "shader",
  javascript: "jsx",
  json: "jsonc",
  livescript: "",
  markup: "",
  mermaid: "",
  "plain text": "",
  protobuf: "hcl",
  reason: "",
  typescript: "tsx",
  "vb.net": "vb",
  "visual basic": "vb",
  webassembly: "wasm",
  "java/c/c++/c#": "java",
};

const twoSlashLanguages = [
  "js",
  "javascript",
  "ts",
  "typescript",
  "tsx",
  "jsx",
  "json",
  "jsn",
];

export function doesLanguageSupportTwoSlash(language: string): boolean {
  return twoSlashLanguages.includes(language);
}
