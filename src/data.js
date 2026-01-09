import { VOCABULARY } from "./vocabulary.js";

const toTerms = (arr) =>
  (arr || []).map((v) => (typeof v === "string" ? { value: v, label: v, description: "" } : v));

export function getPrimitivePropertyTerms() {
  return toTerms(VOCABULARY.primitive.properties);
}

export function getPrimitiveGroupTerms(property) {
  if (property === "color") return toTerms(VOCABULARY.primitive.hues);
  if (property === "dimension") return toTerms(VOCABULARY.primitive.dimensionTypes);
  if (property === "shadow") return toTerms(VOCABULARY.primitive.shadowAttributes);
  if (property === "fontFamily") return toTerms(VOCABULARY.primitive.fontFamilyGroups);
  return [];
}

export function getPrimitiveIdentifierTerms(property, group) {
  if (property === "color") {
    const steps = Array.from({ length: 23 }, (_, i) => i * 50);
    return toTerms(
      steps.map((n) => ({
        value: String(n),
        label: String(n),
        description: `Color step ${n} in the hue ramp (append -aNN for alpha)`,
      }))
    );
  }
  if (property === "dimension") {
    if (group === "space") {
      const base = ["0", "2", "4", "8", "12", "16", "20", "24", "32", "40"];
      const neg = base.filter((v) => v !== "0").map((v) => `neg-${v}`);
      return toTerms(
        [...neg, ...base].map((value) => ({
          value,
          label: value,
          description: `Space step ${value}`,
        }))
      );
    }
    if (group === "size") {
      const steps = ["0", "8", "12", "16", "24", "32", "40", "48", "64", "80", "96", "120", "160", "200"];
      return toTerms(steps.map((value) => ({ value, label: value, description: `Size step ${value}` })));
    }
    if (group === "radius") {
      const steps = ["0", "2", "4", "8", "12", "16", "20", "24", "32", "999"];
      return toTerms(steps.map((value) => ({ value, label: value, description: `Radius step ${value}` })));
    }
    if (group === "stroke-width") {
      const steps = ["0", "1", "2", "4", "8"];
      return toTerms(steps.map((value) => ({ value, label: value, description: `Stroke width ${value}` })));
    }
    if (group === "breakpoint") {
      const steps = ["320", "480", "640", "768", "1024", "1280", "1440", "1920", "2560", "3200"];
      return toTerms(steps.map((value) => ({ value, label: value, description: `Breakpoint ${value}` })));
    }
    return [];
  }
  if (property === "shadow") {
    if (group === "offset-x" || group === "offset-y") {
      const steps = ["neg-24", "neg-16", "neg-8", "neg-4", "neg-2", "0", "2", "4", "8", "16", "24"];
      const axis = group === "offset-x" ? "X" : "Y";
      return toTerms(steps.map((value) => ({ value, label: value, description: `Shadow ${axis} offset ${value}` })));
    }
    if (group === "blur") {
      const steps = ["0", "2", "4", "8", "12", "16", "24", "32", "40", "48", "64"];
      return toTerms(steps.map((value) => ({ value, label: value, description: `Shadow blur ${value}` })));
    }
    if (group === "spread") {
      const steps = ["neg-16", "neg-8", "neg-4", "neg-2", "0", "2", "4", "8", "16"];
      return toTerms(steps.map((value) => ({ value, label: value, description: `Shadow spread ${value}` })));
    }
    return [];
  }
  if (property === "fontFamily") {
    if (group && VOCABULARY.primitive.fontFamilyNames?.[group]) {
      return toTerms(VOCABULARY.primitive.fontFamilyNames[group]);
    }
    const allNames = [
      ...(VOCABULARY.primitive.fontFamilyNames?.system || []),
      ...(VOCABULARY.primitive.fontFamilyNames?.brand || []),
    ];
    return toTerms(allNames);
  }
  if (property === "fontWeight") {
    const steps = Array.from({ length: 9 }, (_, i) => (i + 1) * 100);
    return toTerms(steps.map((n) => ({ value: String(n), label: String(n), description: `Font weight ${n}` })));
  }
  if (property === "fontSize") {
    const steps = Array.from({ length: 65 }, (_, i) => 8 + i);
    return toTerms(steps.map((n) => ({ value: String(n), label: String(n), description: `Font size ${n}` })));
  }
  if (property === "lineHeight") {
    const steps = Array.from({ length: 87 }, (_, i) => 10 + i);
    return toTerms(steps.map((n) => ({ value: String(n), label: String(n), description: `Line height ${n}` })));
  }
  if (property === "letterSpacing") {
    const steps = Array.from({ length: 13 }, (_, i) => i - 2);
    return toTerms(
      steps.map((n) => {
        const value = n < 0 ? `neg-${Math.abs(n)}` : String(n);
        return { value, label: value, description: `Letter spacing ${value}` };
      })
    );
  }
  if (property === "opacity") {
    return toTerms(
      Array.from({ length: 21 }, (_, i) => {
        const value = String(i * 5);
        return { value, label: value, description: `Opacity ${value}%` };
      })
    );
  }
  if (property === "blur") {
    const steps = ["0", "2", "4", "8", "12", "16", "24", "32", "40"];
    return toTerms(steps.map((value) => ({ value, label: value, description: `Blur step ${value}` })));
  }
  if (property === "duration") {
    const steps = ["0", "75", "100", "150", "200", "300", "500", "800", "1200", "2000"];
    return toTerms(steps.map((value) => ({ value, label: value, description: `Duration ${value}ms` })));
  }
  if (property === "layer") {
    const steps = Array.from({ length: 11 }, (_, i) => i);
    return toTerms(steps.map((n) => ({ value: String(n), label: String(n), description: `Layer ${n}` })));
  }
  if (property === "easing") return toTerms(VOCABULARY.primitive.easing);
  if (property === "textCase") return toTerms(VOCABULARY.primitive.textCase);
  if (property === "textDecoration") return toTerms(VOCABULARY.primitive.textDecoration);
  return [];
}

export function getSemanticRoleTerms() {
  return toTerms(VOCABULARY.semantic.roles);
}

export function getSemanticElementTerms(role) {
  return toTerms(VOCABULARY.semantic.elementsByRole?.[role] || []);
}

export function getSemanticVariantTerms(role) {
  const variants = VOCABULARY.semantic.variantsByRole?.[role] || VOCABULARY.semantic.variants || [];
  return toTerms(variants);
}

export function getSemanticContextTerms() {
  return toTerms(VOCABULARY.semantic.contexts);
}

export function getSemanticStateTerms(role) {
  const states = VOCABULARY.semantic.statesByRole?.[role] || VOCABULARY.semantic.states || [];
  return toTerms(states);
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
