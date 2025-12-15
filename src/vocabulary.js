export const VOCABULARY = /** @type {const} */ ({
  namespaces: {
    color: {
      label: "Color",
      description: "Color tokens for UI elements (text, backgrounds, borders, icons).",
      objects: [
        { value: "text", label: "Text", description: "Text foreground color." },
        { value: "background", label: "Background", description: "Surface/background color." },
        { value: "border", label: "Border", description: "Stroke/border color." },
        { value: "icon", label: "Icon", description: "Icon foreground color." },
      ],
      bases: [
        { value: "primary", label: "Primary", description: "Primary intent." },
        { value: "secondary", label: "Secondary", description: "Secondary intent." },
        { value: "accent", label: "Accent", description: "Accent/highlight intent." },
        { value: "default", label: "Default", description: "Default/neutral." },
        { value: "muted", label: "Muted", description: "De-emphasized." },
        { value: "subtle", label: "Subtle", description: "Lower emphasis." },
        { value: "strong", label: "Strong", description: "Higher emphasis." },
      ],
    },

    space: {
      label: "Space",
      description: "Spacing tokens (scale steps and layout spacing variants).",
      objects: [
        { value: "xs", label: "XS", description: "Extra small." },
        { value: "sm", label: "SM", description: "Small." },
        { value: "md", label: "MD", description: "Medium." },
        { value: "lg", label: "LG", description: "Large." },
        { value: "xl", label: "XL", description: "Extra large." },
        { value: "2xl", label: "2XL", description: "2x extra large." },
        { value: "3xl", label: "3XL", description: "3x extra large." },
      ],
      bases: [
        { value: "default", label: "Default", description: "Default spacing usage." },
        { value: "compact", label: "Compact", description: "Tighter spacing variant." },
        { value: "cozy", label: "Cozy", description: "Slightly tighter than default." },
        { value: "roomy", label: "Roomy", description: "Looser spacing variant." },
      ],
    },

    typography: {
      label: "Typography",
      description: "Typography tokens (font families, sizes, weights, and related properties).",
      objects: [
        { value: "font-family", label: "Font Family", description: "Typeface family." },
        { value: "font-size", label: "Font Size", description: "Type size." },
        { value: "line-height", label: "Line Height", description: "Line height." },
        { value: "font-weight", label: "Font Weight", description: "Weight value." },
        { value: "letter-spacing", label: "Letter Spacing", description: "Tracking/letter spacing." },
      ],
      bases: [
        { value: "body", label: "Body", description: "Default body text usage." },
        { value: "heading", label: "Heading", description: "Headings/titles usage." },
        { value: "caption", label: "Caption", description: "Small supporting text." },
        { value: "label", label: "Label", description: "UI labels." },
        { value: "code", label: "Code", description: "Monospace/code usage." },
      ],
    },

    radius: {
      label: "Radius",
      description: "Corner radius tokens by surface/component type.",
      objects: [
        { value: "button", label: "Button", description: "Button corners." },
        { value: "card", label: "Card", description: "Card/surface corners." },
        { value: "input", label: "Input", description: "Input field corners." },
        { value: "badge", label: "Badge", description: "Badge/pill corners." },
      ],
      bases: [
        { value: "default", label: "Default", description: "Default radius." },
        { value: "subtle", label: "Subtle", description: "Less rounded." },
        { value: "strong", label: "Strong", description: "More rounded." },
        { value: "pill", label: "Pill", description: "Fully rounded/pill." },
      ],
    },

    motion: {
      label: "Motion",
      description: "Motion tokens (duration, easing, delay).",
      objects: [
        { value: "duration", label: "Duration", description: "Animation/transition duration." },
        { value: "easing", label: "Easing", description: "Timing function." },
        { value: "delay", label: "Delay", description: "Animation/transition delay." },
      ],
      basesByObject: {
        duration: [
          { value: "fast", label: "Fast", description: "Fast duration." },
          { value: "medium", label: "Medium", description: "Medium duration." },
          { value: "slow", label: "Slow", description: "Slow duration." },
        ],
        delay: [
          { value: "fast", label: "Fast", description: "Fast delay." },
          { value: "medium", label: "Medium", description: "Medium delay." },
          { value: "slow", label: "Slow", description: "Slow delay." },
        ],
        easing: [
          { value: "standard", label: "Standard", description: "Standard easing curve." },
          { value: "emphasized", label: "Emphasized", description: "Stronger ease-in-out." },
          { value: "linear", label: "Linear", description: "Linear easing." },
        ],
      },
    },
  },

  modifiers: [
    { value: "hover", label: "Hover", description: "Hover state." },
    { value: "active", label: "Active", description: "Active/pressed state." },
    { value: "focus", label: "Focus", description: "Focus state." },
    { value: "disabled", label: "Disabled", description: "Disabled state." },
    { value: "subtle", label: "Subtle", description: "Lower emphasis variant." },
    { value: "strong", label: "Strong", description: "Higher emphasis variant." },
    { value: "muted", label: "Muted", description: "De-emphasized variant." },
  ],
});

