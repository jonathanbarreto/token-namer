export function normalizeSegment(input, options = {}) {
  const raw = String(input ?? "");
  const trimmed = raw.trim();
  const next = options.preserveCase ? trimmed : trimmed.toLowerCase();
  return next
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}
