/**
 * Removes common markdown so letters read as plain professional text (no visible *, #, `).
 */
export function sanitizeLetterPlainText(input: string): string {
  let s = input.replace(/\r\n/g, "\n");

  // Fenced code blocks → inner text only
  s = s.replace(/```[\s\S]*?```/g, (block) =>
    block.replace(/^```\w*\n?/, "").replace(/\n?```$/, "")
  );

  s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
  s = s.replace(/__([^_]+)__/g, "$1");
  s = s.replace(/\*([^*\n]+)\*/g, "$1");
  s = s.replace(/_([^_\n]+)_/g, "$1");
  s = s.replace(/^#{1,6}\s+/gm, "");
  s = s.replace(/`([^`]+)`/g, "$1");
  s = s.replace(/\*\*/g, "");
  s = s.replace(/^\s*[-*+]\s+/gm, "• ");
  s = s.replace(/^\s*\d+\.\s+/gm, "");

  // Any remaining asterisks (e.g. broken markdown) — letters must not show *
  s = s.replace(/\*/g, "");

  return s
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}
