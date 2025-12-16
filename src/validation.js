const SEGMENT_RE = /^[a-z0-9-]+$/;

export function validateRequired(fields, requiredIds) {
  const errors = {};
  for (const id of requiredIds) {
    const v = String(fields[id] || "").trim();
    if (!v) errors[id] = "Required.";
  }
  return errors;
}

export function validateSegments(fields, fieldIds) {
  const errors = {};
  for (const id of fieldIds) {
    const v = String(fields[id] || "").trim();
    if (!v) continue;
    if (!SEGMENT_RE.test(v)) errors[id] = "Use only a-z, 0-9, and '-'.";
  }
  return errors;
}

export function isValid(errors) {
  return !errors || Object.keys(errors).length === 0;
}

