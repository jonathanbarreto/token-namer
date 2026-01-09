import { VOCABULARY } from "./vocabulary.js";

const SEGMENT_RE = /^[a-z0-9-]+$/;
const SEGMENT_UPPER_RE = /^[A-Za-z0-9-]+$/;
const DIGITS_RE = /^\d+$/;
const NEG_DIGITS_RE = /^(neg-)?\d+$/;
const COLOR_ID_RE = /^(\d+)(-a(\d{1,3}))?$/;

const PROPERTIES = new Set((VOCABULARY.primitive.properties || []).map((v) => v.value));
const HUES = new Set((VOCABULARY.primitive.hues || []).map((v) => v.value));
const DIMENSION_TYPES = new Set((VOCABULARY.primitive.dimensionTypes || []).map((v) => v.value));
const SHADOW_ATTRIBUTES = new Set((VOCABULARY.primitive.shadowAttributes || []).map((v) => v.value));
const FONT_FAMILY_GROUPS = new Set((VOCABULARY.primitive.fontFamilyGroups || []).map((v) => v.value));
const FONT_FAMILY_NAMES = {
  system: new Set((VOCABULARY.primitive.fontFamilyNames?.system || []).map((v) => v.value)),
  brand: new Set((VOCABULARY.primitive.fontFamilyNames?.brand || []).map((v) => v.value)),
};
const EASING = new Set((VOCABULARY.primitive.easing || []).map((v) => v.value));
const TEXT_CASE = new Set((VOCABULARY.primitive.textCase || []).map((v) => v.value));
const TEXT_DECORATION = new Set((VOCABULARY.primitive.textDecoration || []).map((v) => v.value));

export function validateRequired(fields, requiredIds) {
  const errors = {};
  for (const id of requiredIds) {
    const v = String(fields[id] || "").trim();
    if (!v) errors[id] = "Required.";
  }
  return errors;
}

export function validateSegments(fields, fieldIds, options = {}) {
  const allowUppercaseFields = options.allowUppercaseFields || new Set();
  const errors = {};
  for (const id of fieldIds) {
    const v = String(fields[id] || "").trim();
    if (!v) continue;
    const re = allowUppercaseFields.has(id) ? SEGMENT_UPPER_RE : SEGMENT_RE;
    if (!re.test(v)) errors[id] = "Use only letters, numbers, and '-'.";
  }
  return errors;
}

export function validatePrimitive(fields) {
  const errors = {};
  const property = String(fields.property || "").trim();
  if (!property) return errors;

  if (PROPERTIES.size && !PROPERTIES.has(property)) {
    errors.property = "Use a supported property.";
  }

  const group = String(fields.group || "").trim();
  const identifier = String(fields.identifier || "").trim();
  const isGrouped = property === "color" || property === "dimension" || property === "shadow" || property === "fontFamily";

  if (isGrouped && !group) {
    errors.group = "Required for this property.";
  } else if (!isGrouped && group) {
    errors.group = "Group is not allowed for this property.";
  }

  if (group) {
    if (property === "color" && !HUES.has(group)) errors.group = "Use a supported hue.";
    if (property === "dimension" && !DIMENSION_TYPES.has(group)) errors.group = "Use a supported dimension type.";
    if (property === "shadow" && !SHADOW_ATTRIBUTES.has(group)) errors.group = "Use a supported shadow attribute.";
    if (property === "fontFamily" && !FONT_FAMILY_GROUPS.has(group)) errors.group = "Use a supported font family group.";
  }

  if (!identifier) return errors;

  if (property === "color") {
    const match = identifier.match(COLOR_ID_RE);
    if (!match) {
      errors.identifier = "Use digits with optional -aNN alpha (e.g., 500-a20).";
      return errors;
    }
    if (match[3]) {
      const alpha = Number(match[3]);
      if (alpha < 0 || alpha > 100) errors.identifier = "Alpha must be between 0 and 100.";
    }
    return errors;
  }

  if (property === "dimension") {
    if (group === "space") {
      if (!NEG_DIGITS_RE.test(identifier)) errors.identifier = "Use digits or neg-<abs> for space.";
      return errors;
    }
    if (!DIGITS_RE.test(identifier)) errors.identifier = "Use digits only for dimension identifiers.";
    return errors;
  }

  if (property === "shadow") {
    const allowNegative = group === "offset-x" || group === "offset-y" || group === "spread";
    if (allowNegative) {
      if (!NEG_DIGITS_RE.test(identifier)) errors.identifier = "Use digits or neg-<abs> for this shadow attribute.";
    } else if (!DIGITS_RE.test(identifier)) {
      errors.identifier = "Use digits only for this shadow attribute.";
    }
    return errors;
  }

  if (property === "fontFamily") {
    if (group && FONT_FAMILY_NAMES[group] && !FONT_FAMILY_NAMES[group].has(identifier)) {
      errors.identifier = "Use a supported font family name for this group.";
      return errors;
    }
    if (!group && (FONT_FAMILY_NAMES.system.has(identifier) || FONT_FAMILY_NAMES.brand.has(identifier))) {
      return errors;
    }
    if (group) return errors;
    if (!FONT_FAMILY_NAMES.system.size && !FONT_FAMILY_NAMES.brand.size) return errors;
    errors.identifier = "Use a supported font family name.";
    return errors;
  }

  if (property === "fontWeight") {
    if (!DIGITS_RE.test(identifier)) errors.identifier = "Use digits only for fontWeight.";
    return errors;
  }

  if (property === "textCase") {
    if (!TEXT_CASE.has(identifier)) errors.identifier = "Use a supported textCase value.";
    return errors;
  }

  if (property === "textDecoration") {
    if (!TEXT_DECORATION.has(identifier)) errors.identifier = "Use a supported textDecoration value.";
    return errors;
  }

  if (property === "fontSize" || property === "lineHeight" || property === "opacity" || property === "blur" || property === "duration" || property === "layer") {
    if (!DIGITS_RE.test(identifier)) errors.identifier = "Use digits only for this property.";
    return errors;
  }

  if (property === "letterSpacing") {
    if (!NEG_DIGITS_RE.test(identifier)) errors.identifier = "Use digits or neg-<abs> for letterSpacing.";
    return errors;
  }

  if (property === "easing") {
    if (!EASING.has(identifier)) errors.identifier = "Use a supported easing curve.";
    return errors;
  }

  return errors;
}

export function isValid(errors) {
  return !errors || Object.keys(errors).length === 0;
}
