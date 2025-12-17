import { VOCABULARY } from "./vocabulary.js";

const toTerms = (arr) =>
  (arr || []).map((v) => (typeof v === "string" ? { value: v, label: v, description: "" } : v));

export function getPrimitiveCategoryTerms() {
  return toTerms(VOCABULARY.primitive.categories);
}

export function getPrimitiveSetTerms(category) {
  if (category === "color") return toTerms(VOCABULARY.primitive.hues);
  return toTerms([{ value: "core", label: "core", description: "Common/default set" }]);
}

export function getPrimitiveStepTerms(category) {
  if (category === "color") {
    const steps = [0, 50, ...Array.from({ length: 11 }, (_, i) => (i + 1) * 100)];
    return toTerms(steps.map((n) => String(n)));
  }
  if (category === "opacity") return toTerms(Array.from({ length: 11 }, (_, i) => String(i * 10)));
  if (category === "shadow") return toTerms(["0", "1", "2", "3", "4", "5"]);
  return toTerms(["0", "1", "2", "4", "8", "12", "16", "24", "32"]);
}

export function getPrimitiveVariantTerms(category) {
  if (category === "color") {
    const variants = Array.from({ length: 11 }, (_, i) => `a${i * 10}`);
    return toTerms(variants);
  }
  return [];
}

export function getSemanticDomainTerms() {
  return toTerms(VOCABULARY.semantic.domains);
}

export function getSemanticObjectTerms(domain) {
  return toTerms(VOCABULARY.semantic.objectsByDomain?.[domain] || []);
}

export function getSemanticRoleTerms() {
  return toTerms(VOCABULARY.semantic.roles);
}

export function getSemanticContextTerms() {
  return toTerms(VOCABULARY.semantic.contexts);
}

export function getSemanticStateTerms() {
  return toTerms(VOCABULARY.semantic.states);
}

export function getSemanticEmphasisTerms() {
  return toTerms(VOCABULARY.semantic.emphasis);
}

export function getComponentNameTerms() {
  return toTerms(VOCABULARY.component.components);
}

export function getComponentPartTerms() {
  return toTerms(VOCABULARY.component.parts);
}

export function getComponentPropertyTerms() {
  return toTerms(VOCABULARY.component.properties);
}

export function getComponentVariantTerms() {
  return toTerms(VOCABULARY.component.variants);
}

export function getComponentStateTerms() {
  return toTerms(VOCABULARY.component.states);
}

export function getComponentContextTerms() {
  return toTerms(VOCABULARY.component.contexts);
}

