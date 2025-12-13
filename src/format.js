function joinSegments(segments, delimiter) {
  return segments.filter(Boolean).join(delimiter);
}

function sortedUnique(values) {
  return [...new Set(values)].sort();
}

export function buildModifierSegment(modifiers) {
  const normalized = sortedUnique(modifiers).filter(Boolean);
  if (normalized.length === 0) return "";
  return normalized.join("-");
}

export function getDelimiters(format) {
  switch (format) {
    case "dot":
      return { join: ".", previewSep: "." };
    case "underscore":
      return { join: "_", previewSep: "_" };
    case "slash":
    default:
      return { join: "/", previewSep: " / " };
  }
}

export function formatTokenName({ namespace, object, base, modifiers }, format) {
  const modifierSegment = buildModifierSegment(modifiers);
  const segments = [namespace, object, base, modifierSegment].filter(Boolean);
  return joinSegments(segments, getDelimiters(format).join);
}

export function formatTokenPreviewSegments({ namespace, object, base, modifiers }) {
  const modifierSegment = buildModifierSegment(modifiers);
  return {
    namespace: namespace || "_",
    object: object || "_",
    base: base || "_",
    modifier: modifierSegment || "_",
    hasNamespace: Boolean(namespace),
    hasObject: Boolean(object),
    hasBase: Boolean(base),
    hasModifier: Boolean(modifierSegment),
  };
}

