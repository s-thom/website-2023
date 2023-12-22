/**
 * Trims whitespace from the front of each line
 */
export function trim(
  strings: TemplateStringsArray,
  ...interpolations: unknown[]
) {
  // Combine args and split by line
  const fullString = strings
    .map((str, i) => `${str}${interpolations[i] ?? ""}`)
    .join("");
  const lines = fullString.split(/\r?\n/);
  // Sneaky removal of first line if it's empty
  if (lines[0] === "") {
    lines.splice(0, 1);
  }
  if (lines.length === 0) {
    return "";
  }
  if (lines[lines.length - 1].match(/^\s+$/)) {
    lines.splice(-1, 1);
  }
  if (lines.length === 0) {
    return "";
  }

  // Figure out how many characters to remove from the start
  const lengthToTrim = lines.reduce(
    (n, line) => Math.min(line.match(/^\s*/)![0].length, n),
    Infinity,
  );
  const trimRegex = new RegExp(`^.{${lengthToTrim}}`);

  // Trim it all
  const trimmed = lines.map((line) => line.replace(trimRegex, ""));
  return trimmed.join("\n");
}
