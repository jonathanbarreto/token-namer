import { $, $all, setText, setTone } from "./dom.js";
import { formatTokenName } from "./format.js";
import { normalizeSegment } from "./normalize.js";
import { showToast } from "./toast.js";
import { loadHistory } from "./storage.js";
import { addToHistory, clearHistory as clearHistoryStore } from "./history.js";
import { createCombobox } from "./combobox.js";
import { isValid, validateRequired, validateSegments } from "./validation.js";
import {
  getPrimitiveCategoryTerms,
  getPrimitiveSetTerms,
  getPrimitiveStepTerms,
  getPrimitiveVariantTerms,
  getSemanticDomainTerms,
  getSemanticObjectTerms,
  getSemanticRoleTerms,
  getSemanticContextTerms,
  getSemanticStateTerms,
  getSemanticEmphasisTerms,
  getComponentNameTerms,
  getComponentPartTerms,
  getComponentPropertyTerms,
  getComponentVariantTerms,
  getComponentStateTerms,
  getComponentContextTerms,
} from "./data.js";

/** @typedef {"primitive" | "semantic" | "component"} Framework */
/** @typedef {{ id: string, label: string, required: boolean, description?: string, placeholder?: string, options: (fields: any) => any[] }} FieldDef */

const FRAMEWORKS = /** @type {const} */ (["primitive", "semantic", "component"]);
const DEFAULT_PLACEHOLDER = "Select or enter a term";

function buildFrameworkConfig({ defs, segmentPrefix = [], dependentUpdates = {} }) {
  const fieldIds = defs.map((d) => d.id);
  const requiredIds = defs.filter((d) => d.required).map((d) => d.id);
  return { defs, segmentPrefix, dependentUpdates, fieldIds, requiredIds };
}

/** @type {Record<Framework, ReturnType<typeof buildFrameworkConfig>>} */
const FRAMEWORK_CONFIG = {
  primitive: buildFrameworkConfig({
    defs: /** @type {FieldDef[]} */ ([
      {
        id: "category",
        label: "Category",
        required: true,
        description: "The token type family (what kind of value it is), like color, space, or radius.",
        placeholder: DEFAULT_PLACEHOLDER,
        options: () => getPrimitiveCategoryTerms(),
      },
      {
        id: "set",
        label: "Set",
        required: true,
        description: "The named group within a category, like a hue (gray) or a shared scale (core).",
        placeholder: DEFAULT_PLACEHOLDER,
        options: (s) => getPrimitiveSetTerms(s.category),
      },
      {
        id: "step",
        label: "Step",
        required: true,
        description: "The position on the scale (the specific level), like 050, 500, or 16.",
        placeholder: DEFAULT_PLACEHOLDER,
        options: (s) => getPrimitiveStepTerms(s.category),
      },
      {
        id: "variant",
        label: "Variant",
        required: false,
        description:
          "A purposeful variation of the same step, like A20 for alpha or a special case you want to keep grouped with the base.",
        placeholder: DEFAULT_PLACEHOLDER,
        options: (s) => getPrimitiveVariantTerms(s.category),
      },
    ]),
    dependentUpdates: {
      category(fields, controls) {
        controls.set?.updateOptions(getPrimitiveSetTerms(fields.category));
        controls.step?.updateOptions(getPrimitiveStepTerms(fields.category));
        controls.variant?.updateOptions(getPrimitiveVariantTerms(fields.category));
      },
    },
  }),
  semantic: buildFrameworkConfig({
    defs: /** @type {FieldDef[]} */ ([
      {
        id: "domain",
        label: "Domain",
        required: true,
        description: "The usage area the token supports, like surface, content, or action.",
        placeholder: DEFAULT_PLACEHOLDER,
        options: () => getSemanticDomainTerms(),
      },
      {
        id: "object",
        label: "Object",
        required: true,
        description: "The UI thing being styled inside that domain, like text, background, border, or ring.",
        placeholder: DEFAULT_PLACEHOLDER,
        options: (s) => getSemanticObjectTerms(s.domain),
      },
      {
        id: "role",
        label: "Role",
        required: true,
        description: "The intended meaning or job within the object, like primary, secondary, placeholder, or default.",
        placeholder: DEFAULT_PLACEHOLDER,
        options: () => getSemanticRoleTerms(),
      },
      {
        id: "context",
        label: "Context",
        required: false,
        description:
          "Where it's rendered, when the same role needs a specific contrast setup, like inverse or on-media.",
        placeholder: DEFAULT_PLACEHOLDER,
        options: () => getSemanticContextTerms(),
      },
      {
        id: "state",
        label: "State",
        required: false,
        description: "The interactive or conditional situation, like hover, pressed, disabled, or selected.",
        placeholder: DEFAULT_PLACEHOLDER,
        options: () => getSemanticStateTerms(),
      },
      {
        id: "emphasis",
        label: "Emphasis",
        required: false,
        description:
          "The intensity level on a consistent ladder, like weakest → strongest (only use if your system truly needs it).",
        placeholder: DEFAULT_PLACEHOLDER,
        options: () => getSemanticEmphasisTerms(),
      },
    ]),
    dependentUpdates: {
      domain(fields, controls) {
        controls.object?.updateOptions(getSemanticObjectTerms(fields.domain));
      },
    },
  }),
  component: buildFrameworkConfig({
    segmentPrefix: ["component"],
    defs: /** @type {FieldDef[]} */ ([
      {
        id: "component",
        label: "Component",
        required: true,
        description: "The specific UI component this token belongs to, like button, text-field, or nav-item.",
        placeholder: DEFAULT_PLACEHOLDER,
        options: () => getComponentNameTerms(),
      },
      {
        id: "part",
        label: "Part",
        required: true,
        description: "The component sub-area being styled, like container, label, icon, track, or thumb.",
        placeholder: DEFAULT_PLACEHOLDER,
        options: () => getComponentPartTerms(),
      },
      {
        id: "property",
        label: "Property",
        required: true,
        description: "The visual attribute being set, like bg, text, border-color, radius, or shadow.",
        placeholder: DEFAULT_PLACEHOLDER,
        options: () => getComponentPropertyTerms(),
      },
      {
        id: "variant",
        label: "Variant",
        required: false,
        description: "The component option that changes styling, like primary, secondary, outline, or compact.",
        placeholder: DEFAULT_PLACEHOLDER,
        options: () => getComponentVariantTerms(),
      },
      {
        id: "state",
        label: "State",
        required: false,
        description: "The component interaction/condition, like hover, pressed, disabled, selected, or focus.",
        placeholder: DEFAULT_PLACEHOLDER,
        options: () => getComponentStateTerms(),
      },
      {
        id: "context",
        label: "Context",
        required: false,
        description: "A special rendering environment that changes contrast needs, like inverse or on-media.",
        placeholder: DEFAULT_PLACEHOLDER,
        options: () => getComponentContextTerms(),
      },
    ]),
  }),
};

function initGlobalUI() {
  const btn = $(".menu-btn");
  const mobile = $(".mobile-nav");
  btn?.addEventListener("click", () => {
    const next = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", String(next));
    if (mobile) mobile.hidden = !next;
  });

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
}

function initTokenTool() {
  const form = $("#tokenForm");
  if (!form) return;

  const previewEl = $("#preview");
  const statusEl = $("#status");
  // NOTE: Do not add back the frameworkTemplate element - it has been removed per user request
  const requiredFieldsEl = $("#frameworkFieldsRequired");
  const optionalFieldsEl = $("#frameworkFieldsOptional");
  const howItWorksToggleEl = /** @type {HTMLButtonElement | null} */ ($("#howItWorksToggle"));
  const howItWorksPanelEl = /** @type {HTMLElement | null} */ ($("#howItWorksPanel"));
  const optionalDetailsEl = /** @type {HTMLDetailsElement | null} */ ($("#optionalFields"));
  const optionalCountEl = $("#optionalCount");
  const formatSelect = /** @type {HTMLSelectElement | null} */ ($("#format"));
  const copyNameBtn = /** @type {HTMLButtonElement | null} */ ($("#copyName"));
  const copyJsonBtn = /** @type {HTMLButtonElement | null} */ ($("#copyJson"));
  const clearNameBtn = /** @type {HTMLButtonElement | null} */ ($("#clearName"));
  const historyEl = $("#history");
  const clearHistoryBtn = /** @type {HTMLButtonElement | null} */ ($("#clearHistory"));
  const clearHistoryDialog = /** @type {HTMLDialogElement | null} */ ($("#clearHistoryDialog"));
  const confirmClearHistoryBtn = /** @type {HTMLButtonElement | null} */ ($("#confirmClearHistory"));
  const cancelClearHistoryBtn = /** @type {HTMLButtonElement | null} */ ($("#cancelClearHistory"));
  const clearFieldsDialog = /** @type {HTMLDialogElement | null} */ ($("#clearFieldsDialog"));
  const confirmClearFieldsBtn = /** @type {HTMLButtonElement | null} */ ($("#confirmClearFields"));
  const cancelClearFieldsBtn = /** @type {HTMLButtonElement | null} */ ($("#cancelClearFields"));

  if (
    !previewEl ||
    !statusEl ||
    !requiredFieldsEl ||
    !optionalFieldsEl ||
    !optionalDetailsEl ||
    !optionalCountEl ||
    !formatSelect ||
    !copyNameBtn ||
    !copyJsonBtn ||
    !clearNameBtn ||
    !historyEl ||
    !clearHistoryBtn ||
    !clearHistoryDialog ||
    !confirmClearHistoryBtn ||
    !cancelClearHistoryBtn ||
    !clearFieldsDialog ||
    !confirmClearFieldsBtn ||
    !cancelClearFieldsBtn
  ) {
    return;
  }

  if (howItWorksToggleEl && howItWorksPanelEl) {
    const setExpanded = (expanded) => {
      howItWorksToggleEl.setAttribute("aria-expanded", String(expanded));
      howItWorksPanelEl.hidden = !expanded;
    };
    setExpanded(false);
    howItWorksToggleEl.addEventListener("click", () => {
      const next = howItWorksToggleEl.getAttribute("aria-expanded") !== "true";
      setExpanded(next);
    });
  }

  /** @type {Record<Framework, any>} */
  const stateByFramework = /** @type {const} */ ({
    primitive: {
      category: "",
      set: "",
      step: "",
      variant: "",
    },
    semantic: {
      domain: "",
      object: "",
      role: "",
      context: "",
      state: "",
      emphasis: "",
    },
    component: {
      component: "",
      part: "",
      property: "",
      variant: "",
      state: "",
      context: "",
    },
  });

  /** @type {Framework} */
  let activeFramework = "primitive";
  let history = loadHistory();

  function createInteractionState() {
    return { touched: new Set(), dirty: new Set(), submitted: false };
  }

  /** @type {Record<Framework, ReturnType<typeof createInteractionState>>} */
  const interactionByFramework = {
    primitive: createInteractionState(),
    semantic: createInteractionState(),
    component: createInteractionState(),
  };

  /** @type {Record<string, ReturnType<typeof createCombobox>>} */
  let fieldControls = {};

  function getEmptyPreviewMessage(framework) {
    if (framework === "semantic") return "Select a domain to start building a name.";
    if (framework === "component") return "Select a component to start building a name.";
    return "Select a category to start building a name.";
  }

  // NOTE: getFrameworkTemplate function removed - do not add back the framework template display

  function buildSegments(framework, fields) {
    const config = FRAMEWORK_CONFIG[framework];
    const fieldSegments = config.defs.map((d) => fields[d.id]).filter(Boolean);
    return [...config.segmentPrefix, ...fieldSegments].filter(Boolean);
  }

  function isFieldEmpty(v) {
    return !String(v || "").trim();
  }

  function setActionEnabled(btn, enabled) {
    btn.setAttribute("aria-disabled", String(!enabled));
    btn.classList.toggle("is-disabled", !enabled);
  }

  function flashButtonLabel(btn, label, ms = 1500) {
    const prev = btn.textContent || "";
    btn.textContent = label;
    window.setTimeout(() => {
      if (btn.textContent === label) btn.textContent = prev;
    }, ms);
  }

  function focusField(fieldId) {
    const config = FRAMEWORK_CONFIG[activeFramework];
    const def = config.defs.find((d) => d.id === fieldId);
    if (def && !def.required) optionalDetailsEl.open = true;

    const input = fieldControls[fieldId]?.input;
    if (!input) return;
    input.focus({ preventScroll: true });
    input.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function renderPreviewChips(framework, fields) {
    const config = FRAMEWORK_CONFIG[framework];
    previewEl.classList.remove("is-empty-state");
    previewEl.innerHTML = "";

    const hasAnyRequired = config.requiredIds.some((id) => !isFieldEmpty(fields[id]));
    if (!hasAnyRequired) {
      previewEl.classList.add("is-empty-state");
      previewEl.textContent = getEmptyPreviewMessage(framework);
      return;
    }

    const separator = formatSelect.value === "underscore" ? "_" : "/";
    const isDSPFormat = formatSelect.value === "underscore";

    /** @type {{ key: string, label: string, value?: string, fieldId?: string, optional?: boolean, interactive?: boolean }[]} */
    const parts = [];

    for (const value of config.segmentPrefix) {
      parts.push({ key: `prefix:${value}`, label: value, value, interactive: false });
    }
    for (const def of config.defs) {
      parts.push({
        key: `field:${def.id}`,
        label: def.id,
        value: fields[def.id],
        fieldId: def.id,
        optional: !def.required,
        interactive: true,
      });
    }

    const frag = document.createDocumentFragment();
    parts.forEach((part, idx) => {
      if (idx > 0) {
        const sep = document.createElement("span");
        sep.className = "segment-sep";
        sep.textContent = separator;
        frag.appendChild(sep);
      }

      const hasValue = !isFieldEmpty(part.value);
      let text = hasValue ? String(part.value) : part.label;
      // Convert to uppercase for DSP (underscore) format
      if (isDSPFormat) {
        text = text.toUpperCase();
      }

      if (!part.interactive) {
        // Static parts (prefixes) always render as plain text
        const textEl = document.createElement("span");
        textEl.textContent = text;
        frag.appendChild(textEl);
        return;
      }

      // For interactive parts, render as plain text when value exists, chip when empty
      if (hasValue) {
        const textEl = document.createElement("button");
        textEl.type = "button";
        textEl.className = "segment-text";
        textEl.textContent = text;
        textEl.setAttribute("aria-label", `${part.label}: ${text}`);
        textEl.addEventListener("click", () => focusField(part.fieldId));
        frag.appendChild(textEl);
      } else {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "segment-chip";
        chip.classList.add("is-empty");
        if (part.optional) chip.classList.add("is-optional");
        chip.textContent = text;
        chip.setAttribute("aria-label", `${part.label} (empty)`);
        chip.addEventListener("click", () => focusField(part.fieldId));
        frag.appendChild(chip);
      }
    });

    previewEl.appendChild(frag);
  }

  function renderOptionalCount(framework, fields) {
    const config = FRAMEWORK_CONFIG[framework];
    const filled = config.defs.filter((d) => !d.required && !isFieldEmpty(fields[d.id])).length;
    setText(optionalCountEl, String(filled));
  }

  function validateAndRender() {
    const fields = stateByFramework[activeFramework];
    const config = FRAMEWORK_CONFIG[activeFramework];
    const interaction = interactionByFramework[activeFramework];

    const errors = {
      ...validateRequired(fields, config.requiredIds),
      ...validateSegments(fields, config.fieldIds),
    };

    const visibleErrors = {};
    for (const [id, control] of Object.entries(fieldControls)) {
      const shouldShow = interaction.submitted || interaction.touched.has(id);
      const msg = shouldShow ? errors[id] || "" : "";
      control.setError(msg);
      if (msg) visibleErrors[id] = msg;
    }

    const segments = buildSegments(activeFramework, fields);
    const tokenName = formatTokenName(segments, formatSelect.value);
    renderPreviewChips(activeFramework, fields);
    renderOptionalCount(activeFramework, fields);

    const firstErrorId = Object.keys(visibleErrors)[0];
    if (firstErrorId) {
      setTone(statusEl, "danger");
      setText(statusEl, visibleErrors[firstErrorId]);
    } else {
      setTone(statusEl, tokenName ? "ok" : "");
      setText(statusEl, tokenName ? "Ready to copy." : "Enter values to build a token name.");
    }

    const ok = isValid(errors) && Boolean(tokenName);
    setActionEnabled(copyNameBtn, ok);
    setActionEnabled(copyJsonBtn, ok);

    return { ok, errors, tokenName, fields, segments };
  }

  function setFramework(next) {
    if (!FRAMEWORKS.includes(next)) return;

    const prevFocusId = document.activeElement instanceof HTMLInputElement ? document.activeElement.id : "";

    activeFramework = next;
    for (const btn of $all(".framework-tab")) {
      const isActive = btn.getAttribute("data-framework") === next;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
    }
    // NOTE: Template display removed - do not add back
    optionalDetailsEl.open = false;
    renderFrameworkFields();
    validateAndRender();

    if (prevFocusId && fieldControls[prevFocusId]) {
      focusField(prevFocusId);
      return;
    }

    // Removed auto-focus on first empty required field - users should engage with fields manually
  }

  function clearAllFields() {
    const fields = stateByFramework[activeFramework];
    for (const key in fields) {
      fields[key] = "";
    }
    for (const id in fieldControls) {
      fieldControls[id]?.setValue("");
    }

    const interaction = interactionByFramework[activeFramework];
    interaction.touched.clear();
    interaction.dirty.clear();
    interaction.submitted = false;
    optionalDetailsEl.open = false;

    validateAndRender();
  }

  function renderFrameworkFields() {
    requiredFieldsEl.innerHTML = "";
    optionalFieldsEl.innerHTML = "";
    fieldControls = {};

    const framework = activeFramework;
    const fields = stateByFramework[framework];
    const config = FRAMEWORK_CONFIG[framework];

    const requiredDefs = config.defs.filter((d) => d.required);
    const optionalDefs = config.defs.filter((d) => !d.required);
    optionalDetailsEl.hidden = optionalDefs.length === 0;

    const interaction = interactionByFramework[framework];

    /** @param {FieldDef} def */
    function renderField(def, parent) {
      const control = createCombobox({
        id: def.id,
        label: def.label,
        description: def.description,
        placeholder: def.placeholder,
        required: def.required,
        options: def.options(fields),
        onInput: (v) => {
          fields[def.id] = normalizeSegment(v);
          interaction.dirty.add(def.id);
          config.dependentUpdates?.[def.id]?.(fields, fieldControls);
          validateAndRender();
        },
        onBlur: (v) => {
          interaction.touched.add(def.id);
          const norm = normalizeSegment(v);
          fields[def.id] = norm;
          control.setValue(norm);
          validateAndRender();
        },
      });

      control.setValue(fields[def.id] || "");
      fieldControls[def.id] = control;
      parent.appendChild(control.el);
    }

    for (const def of requiredDefs) renderField(def, requiredFieldsEl);
    for (const def of optionalDefs) renderField(def, optionalFieldsEl);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        return ok;
      } catch {
        return false;
      }
    }
  }

  function renderHistory() {
    historyEl.innerHTML = "";
    if (!history.length) {
      const li = document.createElement("li");
      li.className = "history-item";
      li.innerHTML = `<div class="history-name" style="color: rgba(0,0,0,.55)">No history yet. Copy a token name to save it here.</div>`;
      historyEl.appendChild(li);
      return;
    }

    for (const item of history) {
      const li = document.createElement("li");
      li.className = "history-item";

      const name = document.createElement("div");
      name.className = "history-name";
      name.textContent = item.tokenName || "—";

      const actions = document.createElement("div");
      actions.className = "history-actions";

      const loadBtn = document.createElement("button");
      loadBtn.type = "button";
      loadBtn.className = "btn btn-ghost btn-sm";
      loadBtn.textContent = "Load";
      loadBtn.addEventListener("click", () => {
        const fw = /** @type {Framework} */ (item.framework);
        if (!FRAMEWORKS.includes(fw)) return;

        stateByFramework[fw] = { ...stateByFramework[fw], ...(item.fields || {}) };
        if (item.format) formatSelect.value = item.format;

        const interaction = interactionByFramework[fw];
        interaction.touched.clear();
        interaction.dirty.clear();
        interaction.submitted = false;

        if (fw !== activeFramework) setFramework(fw);
        else {
          optionalDetailsEl.open = false;
          renderFrameworkFields();
          validateAndRender();
        }
      });

      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "btn btn-ghost btn-sm";
      copyBtn.textContent = "Copy";
      copyBtn.addEventListener("click", async () => {
        const ok = await copyText(item.tokenName || "");
        showToast(ok ? "Copied." : "Copy failed.");
      });

      actions.appendChild(loadBtn);
      actions.appendChild(copyBtn);

      li.appendChild(name);
      li.appendChild(actions);
      historyEl.appendChild(li);
    }
  }

  formatSelect.addEventListener("change", () => validateAndRender());

  for (const tab of $all(".framework-tab")) {
    tab.addEventListener("click", () => {
      const fw = tab.getAttribute("data-framework") || "";
      setFramework(fw);
    });
  }

  copyNameBtn.addEventListener("click", async () => {
    interactionByFramework[activeFramework].submitted = true;
    const result = validateAndRender();
    if (!result.ok) {
      showToast("Fix validation errors before copying.");
      return;
    }
    const { tokenName, fields, segments } = result;
    const copied = await copyText(tokenName);
    showToast(copied ? "Copied." : "Copy failed.");
    if (copied) flashButtonLabel(copyNameBtn, "Copied");
    if (copied) {
      const fieldsCopy = { ...fields };
      const segmentsCopy = [...segments];
      history = addToHistory(history, {
        id: String(Date.now()),
        framework: activeFramework,
        format: formatSelect.value,
        fields: fieldsCopy,
        segments: segmentsCopy,
        tokenName,
      });
      renderHistory();
    }
  });

  copyJsonBtn.addEventListener("click", async () => {
    interactionByFramework[activeFramework].submitted = true;
    const result = validateAndRender();
    if (!result.ok) {
      showToast("Fix validation errors before copying.");
      return;
    }
    const { tokenName, fields, segments } = result;
    const payload = {
      framework: activeFramework,
      format: formatSelect.value,
      tokenName,
      segments,
      fields,
    };
    const copied = await copyText(JSON.stringify(payload, null, 2));
    showToast(copied ? "Copied JSON." : "Copy failed.");
    if (copied) flashButtonLabel(copyJsonBtn, "Copied");
  });

  function showClearHistoryConfirm() {
    clearHistoryDialog?.showModal();
  }

  function hideClearHistoryConfirm() {
    clearHistoryDialog?.close();
  }

  function showClearFieldsConfirm() {
    clearFieldsDialog?.showModal();
  }

  function hideClearFieldsConfirm() {
    clearFieldsDialog?.close();
  }

  clearHistoryBtn.addEventListener("click", () => showClearHistoryConfirm());
  cancelClearHistoryBtn.addEventListener("click", () => hideClearHistoryConfirm());
  confirmClearHistoryBtn.addEventListener("click", () => {
    history = clearHistoryStore();
    renderHistory();
    hideClearHistoryConfirm();
    showToast("History cleared.");
  });

  clearNameBtn.addEventListener("click", () => showClearFieldsConfirm());
  cancelClearFieldsBtn.addEventListener("click", () => hideClearFieldsConfirm());
  confirmClearFieldsBtn.addEventListener("click", () => {
    clearAllFields();
    hideClearFieldsConfirm();
    showToast("Fields cleared.");
  });

  // NOTE: Template display removed - do not add back
  renderFrameworkFields();
  renderHistory();
  validateAndRender();
}

function initialize() {
  initGlobalUI();
  initTokenTool();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
else initialize();
