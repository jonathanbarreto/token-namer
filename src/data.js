export const NAMESPACES = /** @type {const} */ (["color", "space", "typography", "radius", "motion"]);

export const OBJECTS_BY_NAMESPACE = /** @type {const} */ ({
  color: ["text", "background", "border", "icon"],
  space: ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"],
  typography: ["font-family", "font-size", "line-height", "font-weight", "letter-spacing"],
  radius: ["button", "card", "input", "badge"],
  motion: ["duration", "easing", "delay"],
});

export const BASES_BY_NAMESPACE = /** @type {const} */ ({
  color: ["primary", "secondary", "accent", "default", "muted", "subtle", "strong"],
  space: ["default", "compact", "cozy", "roomy"],
  typography: ["body", "heading", "caption", "label", "code"],
  radius: ["default", "subtle", "strong", "pill"],
});

export const BASES_BY_MOTION_OBJECT = /** @type {const} */ ({
  duration: ["fast", "medium", "slow"],
  delay: ["fast", "medium", "slow"],
  easing: ["standard", "emphasized", "linear"],
});

export const MODIFIERS = /** @type {const} */ ([
  "hover",
  "active",
  "focus",
  "disabled",
  "subtle",
  "strong",
  "muted",
]);

export function getObjects(namespace) {
  return OBJECTS_BY_NAMESPACE[namespace] ? [...OBJECTS_BY_NAMESPACE[namespace]] : [];
}

export function getBases(namespace, object) {
  if (!namespace) return [];
  if (namespace === "motion") {
    if (!object) return [];
    const bases = BASES_BY_MOTION_OBJECT[object];
    return bases ? [...bases] : [];
  }
  const bases = BASES_BY_NAMESPACE[namespace];
  return bases ? [...bases] : [];
}

export function isAllowedNamespace(value) {
  return NAMESPACES.includes(value);
}

export function isAllowedObject(namespace, value) {
  return getObjects(namespace).includes(value);
}

export function isAllowedBase(namespace, object, value) {
  return getBases(namespace, object).includes(value);
}

export function isAllowedModifier(value) {
  return MODIFIERS.includes(value);
}

