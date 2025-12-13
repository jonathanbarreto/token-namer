import {
  isAllowedBase,
  isAllowedModifier,
  isAllowedNamespace,
  isAllowedObject,
} from "./data.js";

const INVALID_CHARS = /[^a-z0-9-]/;

function hasInvalidChars(value) {
  if (!value) return false;
  return INVALID_CHARS.test(value);
}

export function validateState(state) {
  /** @type {{ field: string, message: string }[]} */
  const errors = [];
  /** @type {{ field: string, message: string }[]} */
  const warnings = [];

  const { namespace, object, base, modifiers } = state;

  if (!namespace) errors.push({ field: "namespace", message: "This field is required." });
  if (namespace && !isAllowedNamespace(namespace)) {
    errors.push({ field: "namespace", message: "Invalid namespace selection." });
  }
  if (hasInvalidChars(namespace)) errors.push({ field: "namespace", message: "Invalid characters." });

  if (!object) errors.push({ field: "object", message: "This field is required." });
  if (namespace && object && !isAllowedObject(namespace, object)) {
    errors.push({ field: "object", message: "Object must match the selected namespace." });
  }
  if (hasInvalidChars(object)) errors.push({ field: "object", message: "Invalid characters." });

  if (!base) errors.push({ field: "base", message: "This field is required." });
  if (namespace && base && !isAllowedBase(namespace, object, base)) {
    errors.push({ field: "base", message: "Base must match the selected namespace." });
  }
  if (hasInvalidChars(base)) errors.push({ field: "base", message: "Invalid characters." });

  const normalizedModifiers = Array.isArray(modifiers) ? modifiers.filter(Boolean) : [];
  for (const mod of normalizedModifiers) {
    if (!isAllowedModifier(mod)) errors.push({ field: "modifier", message: `Modifier "${mod}" is not allowed.` });
    if (hasInvalidChars(mod)) errors.push({ field: "modifier", message: "Invalid characters in modifier." });
  }

  const hasSubtle = normalizedModifiers.includes("subtle");
  const hasStrong = normalizedModifiers.includes("strong");
  if (hasSubtle && hasStrong) {
    errors.push({ field: "modifier", message: 'Modifiers "subtle" and "strong" are mutually exclusive.' });
  }

  const hasDisabled = normalizedModifiers.includes("disabled");
  const hasHover = normalizedModifiers.includes("hover");
  const hasActive = normalizedModifiers.includes("active");
  const hasFocus = normalizedModifiers.includes("focus");
  if (hasDisabled && (hasHover || hasActive || hasFocus)) {
    warnings.push({ field: "modifier", message: "This combination is uncommon (state + disabled)." });
  }

  const hasOrderingIssue =
    (!namespace && (object || base || normalizedModifiers.length > 0)) ||
    (!object && (base || normalizedModifiers.length > 0)) ||
    (!base && normalizedModifiers.length > 0);
  if (hasOrderingIssue) {
    warnings.push({ field: "form", message: "Please complete previous fields first." });
  }

  return { errors, warnings };
}

export function isValid(state) {
  return validateState(state).errors.length === 0;
}

