export function separatorForFormat(format) {
  if (format === "dot") return ".";
  if (format === "underscore") return "_";
  return "/";
}

export function formatTokenName(segments, format) {
  const sep = separatorForFormat(format);
  const safe = (segments || []).filter((s) => s && String(s).trim().length > 0);
  return safe.join(sep);
}

