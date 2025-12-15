function joinSegments(segments, delimiter) {
  return segments.filter(Boolean).join(delimiter);
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

export function formatTokenName(
  {
    prefixSystem,
    prefixTheme,
    prefixDomain,
    namespace,
    baseCategory,
    baseConcept,
    baseProperty,
    objectGroup,
    objectComponent,
    objectElement,
    modifiers,
    framework,
  },
  format,
) {
  const segments = [];
  if (prefixSystem) segments.push(prefixSystem);
  if (prefixTheme) segments.push(prefixTheme);
  if (prefixDomain) segments.push(prefixDomain);
  if (namespace) segments.push(namespace);

  if (framework === "primitive" || framework === "semantic") {
    if (baseCategory) segments.push(baseCategory);
    if (baseConcept) segments.push(baseConcept);
    if (baseProperty) segments.push(baseProperty);
  } else if (framework === "component") {
    if (objectGroup) segments.push(objectGroup);
    if (objectComponent) segments.push(objectComponent);
    if (objectElement) segments.push(objectElement);
  }

  const suffix = Array.isArray(modifiers) ? modifiers.filter(Boolean) : [];
  segments.push(...suffix);

  return joinSegments(segments, getDelimiters(format).join);
}

