import { VOCABULARY } from "./vocabulary.js";

function termsToValues(terms) {
  return (terms || []).map((t) => t.value);
}

/** @type {string[]} */
export const NAMESPACES = Object.keys(VOCABULARY.namespaces);

/** @type {Record<string, string[]>} */
export const OBJECTS_BY_NAMESPACE = Object.fromEntries(
  NAMESPACES.map((ns) => [ns, termsToValues(VOCABULARY.namespaces[ns]?.objects)]),
);

/** @type {Record<string, string[]>} */
export const BASES_BY_NAMESPACE = Object.fromEntries(
  NAMESPACES.map((ns) => [ns, termsToValues(VOCABULARY.namespaces[ns]?.bases)]),
);

/** @type {Record<string, string[]>} */
export const BASES_BY_MOTION_OBJECT = Object.fromEntries(
  Object.entries(VOCABULARY.namespaces.motion?.basesByObject || {}).map(([object, terms]) => [
    object,
    termsToValues(terms),
  ]),
);

/** @type {string[]} */
export const MODIFIERS = termsToValues(VOCABULARY.modifiers);

export function getNamespaceTerms() {
  return NAMESPACES.map((value) => ({ value, ...VOCABULARY.namespaces[value] }));
}

export function getObjectTerms(namespace) {
  return VOCABULARY.namespaces[namespace]?.objects ? [...VOCABULARY.namespaces[namespace].objects] : [];
}

export function getBaseTerms(namespace, object) {
  if (!namespace) return [];
  if (namespace === "motion") {
    if (!object) return [];
    const bases = VOCABULARY.namespaces.motion?.basesByObject?.[object];
    return bases ? [...bases] : [];
  }
  const bases = VOCABULARY.namespaces[namespace]?.bases;
  return bases ? [...bases] : [];
}

export function getModifierTerms() {
  return VOCABULARY.modifiers ? [...VOCABULARY.modifiers] : [];
}

export function getObjects(namespace) {
  return OBJECTS_BY_NAMESPACE[namespace] ? [...OBJECTS_BY_NAMESPACE[namespace]] : [];
}

export function getBases(namespace, object) {
  return termsToValues(getBaseTerms(namespace, object));
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

// Placeholder functions for new framework-specific fields
// These will be updated when vocabulary data is available
export function getBaseCategoryTerms(namespace) {
  // For now, use bases as categories
  return getBaseTerms(namespace, "");
}

export function getBaseConceptTerms(namespace, category) {
  // For now, return empty or use objects as concepts
  return getObjectTerms(namespace);
}

export function getBasePropertyTerms(namespace, category, concept) {
  // For now, use bases as properties
  return getBaseTerms(namespace, "");
}

export function getObjectGroupTerms(namespace) {
  // For now, return empty
  return [];
}

export function getObjectComponentTerms(namespace) {
  // For now, use objects as components
  return getObjectTerms(namespace);
}

export function getObjectElementTerms(namespace, component) {
  // For now, use bases as elements
  return getBaseTerms(namespace, component);
}
