import { $, $all, setText, setTone } from "./dom.js";
import { formatTokenName } from "./format.js";
import { normalizeSegment } from "./normalize.js";
import { showToast } from "./toast.js";
import { loadHistory } from "./storage.js";
import { addToHistory, clearHistory as clearHistoryStore, removeHistoryItem } from "./history.js";
import { createCombobox } from "./combobox.js";
import { isValid, validateRequired, validateSegments } from "./validation.js";
import {
  getPrefixTerms,
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

const FRAMEWORKS = /** @type {const} */ (["primitive", "semantic", "component"]);

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

  const prefixContainer = $("#prefixFields");
  const fieldsContainer = $("#frameworkFields");
  const previewEl = $("#preview");
  const previewPillsEl = $("#previewPills");
  const statusEl = $("#status");
  const formatSelect = /** @type {HTMLSelectElement | null} */ ($("#format"));
  const copyNameBtn = /** @type {HTMLButtonElement | null} */ ($("#copyName"));
  const copyJsonBtn = /** @type {HTMLButtonElement | null} */ ($("#copyJson"));
  const clearNameBtn = /** @type {HTMLButtonElement | null} */ ($("#clearName"));
  const historyEl = $("#history");
  const clearHistoryBtn = /** @type {HTMLButtonElement | null} */ ($("#clearHistory"));

  if (
    !prefixContainer ||
    !fieldsContainer ||
    !previewEl ||
    !previewPillsEl ||
    !statusEl ||
    !formatSelect ||
    !copyNameBtn ||
    !copyJsonBtn ||
    !clearNameBtn ||
    !historyEl ||
    !clearHistoryBtn
  ) {
    return;
  }

  /** @type {Record<string, any>} */
  const stateByFramework = {
    primitive: {
      prefixSystem: "",
      prefixTheme: "",
      prefixDomain: "",
      category: "",
      set: "",
      step: "",
      variant: "",
    },
    semantic: {
      prefixSystem: "",
      prefixTheme: "",
      prefixDomain: "",
      domain: "",
      object: "",
      role: "",
      context: "",
      state: "",
      emphasis: "",
    },
    component: {
      prefixSystem: "",
      prefixTheme: "",
      prefixDomain: "",
      component: "",
      part: "",
      property: "",
      variant: "",
      state: "",
      context: "",
    },
  };

  let activeFramework = "primitive";
  let history = loadHistory();

  /** @type {Record<string, ReturnType<typeof createCombobox>>} */
  let fieldControls = {};
  /** @type {Record<string, ReturnType<typeof createCombobox>>} */
  let prefixControls = {};

  function makeFieldDefs(framework) {
    if (framework === "primitive") {
      return [
        { id: "category", label: "Category", required: true, description: "The token type family (what kind of value it is), like color, space, or radius.", placeholder: "Select or enter a term", options: () => getPrimitiveCategoryTerms() },
        { id: "set", label: "Set", required: true, description: "The named group within a category, like a hue (gray) or a shared scale (core).", placeholder: "Select or enter a term", options: (s) => getPrimitiveSetTerms(s.category) },
        { id: "step", label: "Step", required: true, description: "The position on the scale (the specific level), like 050, 500, or 16.", placeholder: "Select or enter a term", options: (s) => getPrimitiveStepTerms(s.category) },
        { id: "variant", label: "Variant", required: false, description: "A purposeful variation of the same step, like A20 for alpha or a special case you want to keep grouped with the base.", placeholder: "Select or enter a term", options: (s) => getPrimitiveVariantTerms(s.category) },
      ];
    }
    if (framework === "semantic") {
      return [
        { id: "domain", label: "Domain", required: true, description: "The usage area the token supports, like surface, content, or action.", placeholder: "Select or enter a term", options: () => getSemanticDomainTerms() },
        { id: "object", label: "Object", required: true, description: "The UI thing being styled inside that domain, like text, background, border, or ring.", placeholder: "Select or enter a term", options: (s) => getSemanticObjectTerms(s.domain) },
        { id: "role", label: "Role", required: true, description: "The intended meaning or job within the object, like primary, secondary, placeholder, or default.", placeholder: "Select or enter a term", options: () => getSemanticRoleTerms() },
        { id: "context", label: "Context", required: false, description: "Where it's rendered, when the same role needs a specific contrast setup, like inverse or on-media.", placeholder: "Select or enter a term", options: () => getSemanticContextTerms() },
        { id: "state", label: "State", required: false, description: "The interactive or conditional situation, like hover, pressed, disabled, or selected.", placeholder: "Select or enter a term", options: () => getSemanticStateTerms() },
        { id: "emphasis", label: "Emphasis", required: false, description: "The intensity level on a consistent ladder, like weakest → strongest (only use if your system truly needs it).", placeholder: "Select or enter a term", options: () => getSemanticEmphasisTerms() },
      ];
    }
    return [
      { id: "component", label: "Component", required: true, description: "The specific UI component this token belongs to, like button, text-field, or nav-item.", placeholder: "Select or enter a term", options: () => getComponentNameTerms() },
      { id: "part", label: "Part", required: true, description: "The component sub-area being styled, like container, label, icon, track, or thumb.", placeholder: "Select or enter a term", options: () => getComponentPartTerms() },
      { id: "property", label: "Property", required: true, description: "The visual attribute being set, like bg, text, border-color, radius, or shadow.", placeholder: "Select or enter a term", options: () => getComponentPropertyTerms() },
      { id: "variant", label: "Variant", required: false, description: "The component option that changes styling, like primary, secondary, outline, or compact.", placeholder: "Select or enter a term", options: () => getComponentVariantTerms() },
      { id: "state", label: "State", required: false, description: "The component interaction/condition, like hover, pressed, disabled, selected, or focus.", placeholder: "Select or enter a term", options: () => getComponentStateTerms() },
      { id: "context", label: "Context", required: false, description: "A special rendering environment that changes contrast needs, like inverse or on-media.", placeholder: "Select or enter a term", options: () => getComponentContextTerms() },
    ];
  }

  function getPrefixDefs() {
    return [
      { id: "prefixSystem", label: "System", required: false, placeholder: "Select or enter a term", options: () => getPrefixTerms("system") },
      { id: "prefixTheme", label: "Mode", required: false, description: "A mode is a system-level variant applied consistently across tokens", placeholder: "Select or enter a term", options: () => getPrefixTerms("theme") },
      { id: "prefixDomain", label: "Theme", required: false, description: "A theme is an opinionated configuration of token values that produces a distinct visual identity. Examples: Core, Brand X, Marketing, Seasonal, Enterprise, Consumer.", placeholder: "Select or enter a term", options: () => getPrefixTerms("domain") },
    ];
  }

  function buildSegments(framework, fields) {
    const prefix = [fields.prefixSystem, fields.prefixTheme, fields.prefixDomain].filter(Boolean);
    if (framework === "primitive") {
      return [...prefix, fields.category, fields.set, fields.step, fields.variant].filter(Boolean);
    }
    if (framework === "semantic") {
      return [...prefix, fields.domain, fields.object, fields.role, fields.context, fields.state, fields.emphasis].filter(Boolean);
    }
    return [...prefix, "component", fields.component, fields.part, fields.property, fields.variant, fields.state, fields.context].filter(Boolean);
  }

  function getSegmentLabels(framework, fields) {
    const prefixDefs = getPrefixDefs();
    const fieldDefs = makeFieldDefs(framework);
    const allDefs = [...prefixDefs, ...fieldDefs];
    
    const labels = [];
    
    // Add prefix fields
    if (fields.prefixSystem) {
      labels.push({ label: "System", value: fields.prefixSystem });
    }
    if (fields.prefixTheme) {
      labels.push({ label: "Mode", value: fields.prefixTheme });
    }
    if (fields.prefixDomain) {
      labels.push({ label: "Theme", value: fields.prefixDomain });
    }
    
    // Add framework-specific fields
    if (framework === "primitive") {
      if (fields.category) labels.push({ label: "Category", value: fields.category });
      if (fields.set) labels.push({ label: "Set", value: fields.set });
      if (fields.step) labels.push({ label: "Step", value: fields.step });
      if (fields.variant) labels.push({ label: "Variant", value: fields.variant });
    } else if (framework === "semantic") {
      if (fields.domain) labels.push({ label: "Domain", value: fields.domain });
      if (fields.object) labels.push({ label: "Object", value: fields.object });
      if (fields.role) labels.push({ label: "Role", value: fields.role });
      if (fields.context) labels.push({ label: "Context", value: fields.context });
      if (fields.state) labels.push({ label: "State", value: fields.state });
      if (fields.emphasis) labels.push({ label: "Emphasis", value: fields.emphasis });
    } else {
      // component framework - note: "component" is a literal string in segments
      if (fields.component) labels.push({ label: "Component", value: fields.component });
      if (fields.part) labels.push({ label: "Part", value: fields.part });
      if (fields.property) labels.push({ label: "Property", value: fields.property });
      if (fields.variant) labels.push({ label: "Variant", value: fields.variant });
      if (fields.state) labels.push({ label: "State", value: fields.state });
      if (fields.context) labels.push({ label: "Context", value: fields.context });
    }
    
    return labels;
  }

  function validateAndRender() {
    const fields = stateByFramework[activeFramework];
    const defs = makeFieldDefs(activeFramework);
    const fieldIds = defs.map((d) => d.id);
    const requiredIds = defs.filter((d) => d.required).map((d) => d.id);

    const errors = {
      ...validateRequired(fields, requiredIds),
      ...validateSegments(fields, [...fieldIds, "prefixSystem", "prefixTheme", "prefixDomain"]),
    };

    for (const id of Object.keys(fieldControls)) fieldControls[id].setError(errors[id] || "");
    for (const id of Object.keys(prefixControls)) prefixControls[id].setError(errors[id] || "");

    const segments = buildSegments(activeFramework, fields);
    const tokenName = formatTokenName(segments, formatSelect.value);
    setText(previewEl, tokenName || "—");

    // Render pills for each field that has a value
    const segmentLabels = getSegmentLabels(activeFramework, fields);
    previewPillsEl.innerHTML = "";
    if (segmentLabels.length > 0) {
      segmentLabels.forEach(({ label }) => {
        const pill = document.createElement("span");
        pill.className = "preview-pill";
        pill.textContent = label;
        previewPillsEl.appendChild(pill);
      });
    }

    const firstErrorId = Object.keys(errors)[0];
    if (firstErrorId) {
      setTone(statusEl, "danger");
      setText(statusEl, errors[firstErrorId]);
    } else {
      setTone(statusEl, "ok");
      setText(statusEl, tokenName ? "Ready to copy." : "Enter values to build a token name.");
    }

    const ok = isValid(errors) && Boolean(tokenName);
    copyNameBtn.disabled = !ok;
    copyJsonBtn.disabled = !ok;

    return { ok, errors, tokenName, fields, segments };
  }

  function setFramework(next) {
    if (!FRAMEWORKS.includes(next)) return;
    activeFramework = next;
    for (const btn of $all(".framework-tab")) {
      const isActive = btn.getAttribute("data-framework") === next;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
    }
    renderFrameworkFields();
    syncPrefixValues();
    validateAndRender();
  }

  function syncPrefixValues() {
    const fields = stateByFramework[activeFramework];
    for (const def of getPrefixDefs()) {
      prefixControls[def.id]?.setValue(fields[def.id] || "");
    }
  }

  function clearAllFields() {
    const fields = stateByFramework[activeFramework];
    // Reset all fields to empty strings
    for (const key in fields) {
      fields[key] = "";
    }
    // Update all prefix controls
    for (const id in prefixControls) {
      prefixControls[id]?.setValue("");
    }
    // Update all field controls
    for (const id in fieldControls) {
      fieldControls[id]?.setValue("");
    }
    // Re-render to update preview
    validateAndRender();
  }

  function renderPrefixFields() {
    prefixContainer.innerHTML = "";
    prefixControls = {};

    for (const def of getPrefixDefs()) {
      const control = createCombobox({
        id: def.id,
        label: def.label,
        description: def.description,
        placeholder: def.placeholder,
        required: def.required,
        options: def.options(),
        onInput: (v) => {
          stateByFramework[activeFramework][def.id] = normalizeSegment(v);
          validateAndRender();
        },
        onBlur: (v) => {
          const norm = normalizeSegment(v);
          stateByFramework[activeFramework][def.id] = norm;
          control.setValue(norm);
          validateAndRender();
        },
      });
      prefixControls[def.id] = control;
      prefixContainer.appendChild(control.el);
    }
  }

  function renderFrameworkFields() {
    fieldsContainer.innerHTML = "";
    fieldControls = {};

    const defs = makeFieldDefs(activeFramework);
    for (const def of defs) {
      const fields = stateByFramework[activeFramework];
      const control = createCombobox({
        id: def.id,
        label: def.label,
        description: def.description,
        placeholder: def.placeholder,
        required: def.required,
        options: def.options(fields),
        onInput: (v) => {
          fields[def.id] = normalizeSegment(v);
          if (activeFramework === "primitive" && def.id === "category") {
            fieldControls.set?.updateOptions(getPrimitiveSetTerms(fields.category));
            fieldControls.step?.updateOptions(getPrimitiveStepTerms(fields.category));
            fieldControls.variant?.updateOptions(getPrimitiveVariantTerms(fields.category));
          }
          if (activeFramework === "semantic" && def.id === "domain") {
            fieldControls.object?.updateOptions(getSemanticObjectTerms(fields.domain));
          }
          validateAndRender();
        },
        onBlur: (v) => {
          const norm = normalizeSegment(v);
          fields[def.id] = norm;
          control.setValue(norm);
          validateAndRender();
        },
      });

      control.setValue(fields[def.id] || "");
      fieldControls[def.id] = control;
      fieldsContainer.appendChild(control.el);
    }
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

      const fillBtn = document.createElement("button");
      fillBtn.type = "button";
      fillBtn.className = "btn btn-ghost btn-sm";
      fillBtn.textContent = "Fill";
      fillBtn.addEventListener("click", () => {
        setFramework(item.framework);
        stateByFramework[item.framework] = { ...stateByFramework[item.framework], ...(item.fields || {}) };
        syncPrefixValues();
        renderFrameworkFields();
        validateAndRender();
      });

      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "btn btn-ghost btn-sm";
      copyBtn.textContent = "Copy";
      copyBtn.addEventListener("click", async () => {
        const ok = await copyText(item.tokenName || "");
        showToast(ok ? "Copied." : "Copy failed.");
      });

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "btn btn-ghost btn-sm";
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => {
        history = removeHistoryItem(history, item.id);
        renderHistory();
      });

      actions.appendChild(fillBtn);
      actions.appendChild(copyBtn);
      actions.appendChild(removeBtn);

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
    const { ok, tokenName, fields, segments } = validateAndRender();
    if (!ok) {
      showToast("Fix validation errors before copying.");
      return;
    }
    const copied = await copyText(tokenName);
    showToast(copied ? "Copied." : "Copy failed.");
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
    const { ok, tokenName, fields, segments } = validateAndRender();
    if (!ok) {
      showToast("Fix validation errors before copying.");
      return;
    }
    const payload = {
      framework: activeFramework,
      format: formatSelect.value,
      tokenName,
      segments,
      fields,
    };
    const copied = await copyText(JSON.stringify(payload, null, 2));
    showToast(copied ? "Copied JSON." : "Copy failed.");
  });

  clearHistoryBtn.addEventListener("click", () => {
    history = clearHistoryStore();
    renderHistory();
    showToast("History cleared.");
  });

  clearNameBtn.addEventListener("click", () => {
    clearAllFields();
    showToast("Fields cleared.");
  });

  renderPrefixFields();
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
