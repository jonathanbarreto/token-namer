export const PRESETS_BY_NAMESPACE = /** @type {const} */ ({
  color: [
    { label: "text/primary", object: "text", base: "primary", modifiers: [] },
    { label: "background/default", object: "background", base: "default", modifiers: [] },
    { label: "border/subtle", object: "border", base: "subtle", modifiers: [] },
    { label: "text/primary/hover", object: "text", base: "primary", modifiers: ["hover"] },
    { label: "background/default/disabled", object: "background", base: "default", modifiers: ["disabled"] },
  ],
  space: [
    { label: "md/default", object: "md", base: "default", modifiers: [] },
    { label: "lg/default", object: "lg", base: "default", modifiers: [] },
    { label: "sm/compact", object: "sm", base: "compact", modifiers: [] },
  ],
  typography: [
    { label: "font-size/body", object: "font-size", base: "body", modifiers: [] },
    { label: "line-height/body", object: "line-height", base: "body", modifiers: [] },
    { label: "font-weight/heading", object: "font-weight", base: "heading", modifiers: [] },
  ],
  radius: [
    { label: "button/default", object: "button", base: "default", modifiers: [] },
    { label: "card/subtle", object: "card", base: "subtle", modifiers: [] },
    { label: "badge/pill", object: "badge", base: "pill", modifiers: [] },
  ],
  motion: [
    { label: "duration/fast", object: "duration", base: "fast", modifiers: [] },
    { label: "easing/standard", object: "easing", base: "standard", modifiers: [] },
    { label: "delay/medium", object: "delay", base: "medium", modifiers: [] },
  ],
});

export function getPresets(namespace) {
  return PRESETS_BY_NAMESPACE[namespace] ? [...PRESETS_BY_NAMESPACE[namespace]] : [];
}

