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

  const {
    framework,
    namespace,
    prefixSystem,
    prefixTheme,
    prefixDomain,
    baseCategory,
    baseConcept,
    baseProperty,
    objectGroup,
    objectComponent,
    objectElement,
    modifiers,
  } = state;

  // Namespace validation (required for all frameworks)
  if (!namespace) errors.push({ field: "namespace", message: "Namespace is required." });
  if (namespace && !isAllowedNamespace(namespace)) {
    errors.push({ field: "namespace", message: "Invalid namespace selection." });
  }
  if (hasInvalidChars(namespace)) errors.push({ field: "namespace", message: "Invalid characters." });

  // Prefix fields are optional, but validate if present
  if (prefixSystem && hasInvalidChars(prefixSystem)) {
    errors.push({ field: "prefixSystem", message: "Invalid characters in prefix system." });
  }
  if (prefixTheme && hasInvalidChars(prefixTheme)) {
    errors.push({ field: "prefixTheme", message: "Invalid characters in prefix theme." });
  }
  if (prefixDomain && hasInvalidChars(prefixDomain)) {
    errors.push({ field: "prefixDomain", message: "Invalid characters in prefix domain." });
  }

  // Framework-specific validation
  if (framework === "primitive" || framework === "semantic") {
    // Base section validation
    if (!baseCategory) {
      errors.push({ field: "baseCategory", message: "Category is required." });
    }
    if (baseCategory && hasInvalidChars(baseCategory)) {
      errors.push({ field: "baseCategory", message: "Invalid characters in category." });
    }

    if (baseConcept && hasInvalidChars(baseConcept)) {
      errors.push({ field: "baseConcept", message: "Invalid characters in concept." });
    }
    if (baseProperty && hasInvalidChars(baseProperty)) {
      errors.push({ field: "baseProperty", message: "Invalid characters in property." });
    }

    // Semantic requires all three base fields
    if (framework === "semantic") {
      if (!baseConcept) {
        errors.push({ field: "baseConcept", message: "Concept is required for semantic tokens." });
      }
      if (!baseProperty) {
        errors.push({ field: "baseProperty", message: "Property is required for semantic tokens." });
      }
    }
  } else if (framework === "component") {
    // Object section validation
    if (objectGroup && hasInvalidChars(objectGroup)) {
      errors.push({ field: "objectGroup", message: "Invalid characters in group." });
    }

    if (!objectComponent) {
      errors.push({ field: "objectComponent", message: "Component is required." });
    }
    if (objectComponent && hasInvalidChars(objectComponent)) {
      errors.push({ field: "objectComponent", message: "Invalid characters in component." });
    }

    if (!objectElement) {
      errors.push({ field: "objectElement", message: "Element is required." });
    }
    if (objectElement && hasInvalidChars(objectElement)) {
      errors.push({ field: "objectElement", message: "Invalid characters in element." });
    }
  }

  // Modifier validation
  const normalizedModifiers = Array.isArray(modifiers) ? modifiers.filter(Boolean) : [];
  for (const mod of normalizedModifiers) {
    if (!isAllowedModifier(mod)) errors.push({ field: "modifier", message: `Modifier "${mod}" is not allowed.` });
    if (hasInvalidChars(mod)) errors.push({ field: "modifier", message: "Invalid characters in modifier." });
  }

  return { errors, warnings };
}

export function isValid(state) {
  return validateState(state).errors.length === 0;
}
