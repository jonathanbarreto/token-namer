import {
  getBaseCategoryTerms,
  getBaseConceptTerms,
  getBasePropertyTerms,
  getModifierTerms,
  getNamespaceTerms,
  getObjectComponentTerms,
  getObjectElementTerms,
  getObjectGroupTerms,
} from "./data.js";
import { $, $all, fillSelectTerms, setText, setTone } from "./dom.js";
import { formatTokenName } from "./format.js";
import { addToHistory, clearHistory, removeHistoryItem, renderHistory } from "./history.js";
import { loadHistory, loadThemePreference, saveThemePreference } from "./storage.js";
import { showToast } from "./toast.js";
import { isValid, validateState } from "./validation.js";

initGlobalUI();
initTokenTool();

function initGlobalUI() {
  const btn = $(".menu-btn");
  const mobile = $(".mobile-nav");
  btn?.addEventListener("click", () => {
    const next = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", String(next));
    if (mobile) mobile.hidden = !next;
    document.body.classList.toggle("no-scroll", next);
  });

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  const theme = resolveInitialTheme();
  applyTheme(theme);

  $("#themeToggle")?.addEventListener("click", () => toggleTheme());
  for (const el of $all("[data-theme-toggle]")) {
    el.addEventListener("click", () => toggleTheme());
  }

  for (const info of $all(".info-btn")) {
    info.addEventListener("click", () => {
      const key = info.getAttribute("data-help");
      if (!key) return;
      const target = $(`#help-${key}`);
      if (!target) return;
      target.hidden = !target.hidden;
    });
  }
}

function resolveInitialTheme() {
  const stored = loadThemePreference();
  if (stored) return stored;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  return prefersDark ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  saveThemePreference(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
}

function initTokenTool() {
  const form = $("#tokenForm");
  if (!form) return;

  const FRAMEWORKS = ["primitive", "semantic", "component"];

  /**
   * @typedef {Object} TokenState
   * @property {string} framework
   * @property {string} prefixSystem
   * @property {string} prefixTheme
   * @property {string} prefixDomain
   * @property {string} namespace
   * @property {string} baseCategory
   * @property {string} baseConcept
   * @property {string} baseProperty
   * @property {string} objectGroup
   * @property {string} objectComponent
   * @property {string} objectElement
   * @property {string[]} modifiers
   */
  /** @type {Record<string, TokenState>} */
  const frameworkStates = {
    primitive: createEmptyState("primitive"),
    semantic: createEmptyState("semantic"),
    component: createEmptyState("component"),
  };

  function createEmptyState(framework) {
    return {
      framework,
      prefixSystem: "",
      prefixTheme: "",
      prefixDomain: "",
      namespace: "",
      baseCategory: "",
      baseConcept: "",
      baseProperty: "",
      objectGroup: "",
      objectComponent: "",
      objectElement: "",
      modifiers: [],
    };
  }

  let activeFramework = "primitive";
  let state = frameworkStates[activeFramework];
  const touched = {
    namespace: false,
    prefixSystem: false,
    prefixTheme: false,
    prefixDomain: false,
    baseCategory: false,
    baseConcept: false,
    baseProperty: false,
    objectGroup: false,
    objectComponent: false,
    objectElement: false,
    modifier: false,
  };
  let copyAttempted = false;

  // DOM element references
  const namespaceSelect = /** @type {HTMLSelectElement | null} */ ($("#namespace"));
  const prefixFieldsContainer = /** @type {HTMLElement | null} */ ($("#prefixFields"));
  const addPrefixSystemBtn = /** @type {HTMLButtonElement | null} */ ($("#addPrefixSystem"));
  const addPrefixThemeBtn = /** @type {HTMLButtonElement | null} */ ($("#addPrefixTheme"));
  const addPrefixDomainBtn = /** @type {HTMLButtonElement | null} */ ($("#addPrefixDomain"));
  const prefixAccordionHeader = /** @type {HTMLButtonElement | null} */ ($("#prefixAccordionBtn"));
  const prefixAccordionContent = /** @type {HTMLElement | null} */ ($("#prefixContent"));

  const activePrefixFields = new Set();

  const baseCategoryCheck = /** @type {HTMLInputElement | null} */ ($("#baseCategoryCheck"));
  const baseCategoryInput = /** @type {HTMLInputElement | null} */ ($("#baseCategory"));
  const baseCategoryInputWrapper = /** @type {HTMLElement | null} */ ($("#baseCategoryInputWrapper"));
  const baseConceptCheck = /** @type {HTMLInputElement | null} */ ($("#baseConceptCheck"));
  const baseConceptInput = /** @type {HTMLInputElement | null} */ ($("#baseConcept"));
  const baseConceptInputWrapper = /** @type {HTMLElement | null} */ ($("#baseConceptInputWrapper"));
  const basePropertyCheck = /** @type {HTMLInputElement | null} */ ($("#basePropertyCheck"));
  const basePropertyInput = /** @type {HTMLInputElement | null} */ ($("#baseProperty"));
  const basePropertyInputWrapper = /** @type {HTMLElement | null} */ ($("#basePropertyInputWrapper"));
  const baseAccordionHeader = /** @type {HTMLButtonElement | null} */ ($("#baseAccordionBtn"));
  const baseAccordionContent = /** @type {HTMLElement | null} */ ($("#baseContent"));

  const objectGroupSelect = /** @type {HTMLSelectElement | null} */ ($("#objectGroup"));
  const objectComponentSelect = /** @type {HTMLSelectElement | null} */ ($("#objectComponent"));
  const objectElementSelect = /** @type {HTMLSelectElement | null} */ ($("#objectElement"));

  const formatSelect = /** @type {HTMLSelectElement | null} */ ($("#format"));
  const modifierSearch = /** @type {HTMLInputElement | null} */ ($("#modifierSearch"));
  const modifiersEl = $("#modifiers");

  const variantCheck = /** @type {HTMLInputElement | null} */ ($("#variantCheck"));
  const variantInput = /** @type {HTMLInputElement | null} */ ($("#variant"));
  const variantInputWrapper = /** @type {HTMLElement | null} */ ($("#variantInputWrapper"));
  const stateCheck = /** @type {HTMLInputElement | null} */ ($("#stateCheck"));
  const stateInput = /** @type {HTMLInputElement | null} */ ($("#state"));
  const stateInputWrapper = /** @type {HTMLElement | null} */ ($("#stateInputWrapper"));
  const scaleCheck = /** @type {HTMLInputElement | null} */ ($("#scaleCheck"));
  const scaleInput = /** @type {HTMLInputElement | null} */ ($("#scale"));
  const scaleInputWrapper = /** @type {HTMLElement | null} */ ($("#scaleInputWrapper"));
  const modeCheck = /** @type {HTMLInputElement | null} */ ($("#modeCheck"));
  const modeInput = /** @type {HTMLInputElement | null} */ ($("#mode"));
  const modeInputWrapper = /** @type {HTMLElement | null} */ ($("#modeInputWrapper"));
  const suffixAccordionHeader = /** @type {HTMLButtonElement | null} */ ($("#suffixAccordionBtn"));
  const suffixAccordionContent = /** @type {HTMLElement | null} */ ($("#suffixContent"));

  const baseSection = $("#baseSection");
  const objectSection = $("#objectSection");
  const previewEl = $("#preview");
  const statusEl = $("#status");
  const copyNameBtn = $("#copyName");
  const copyJsonBtn = $("#copyJson");
  const historyEl = $("#history");
  const clearHistoryBtn = $("#clearHistory");
  const frameworkTabs = $all(".framework-tab");

  // Initialize namespace select
  const namespaceTerms = getNamespaceTerms().map((t) => ({
    value: t.value,
    label: t.label,
    description: t.description,
  }));
  fillSelectTerms(namespaceSelect, namespaceTerms, { placeholder: "Select namespace…" });

  // Prefix field management
  function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function getPrefixFieldId(type) {
    return `prefix${capitalizeFirst(type)}`;
  }

  function addPrefixField(type) {
    if (activePrefixFields.has(type) || !prefixFieldsContainer) return;

    activePrefixFields.add(type);
    const fieldId = getPrefixFieldId(type);
    const fieldWrapper = document.createElement("div");
    fieldWrapper.className = "prefix-field-wrapper";
    fieldWrapper.setAttribute("data-prefix-type", type);

    const fieldHeader = document.createElement("div");
    fieldHeader.className = "prefix-field-header";

    const label = document.createElement("label");
    label.setAttribute("for", fieldId);
    label.className = "prefix-field-label";
    label.textContent = capitalizeFirst(type);

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "prefix-remove-btn";
    removeBtn.setAttribute("aria-label", `Remove ${type} field`);
    removeBtn.innerHTML = "×";
    removeBtn.addEventListener("click", () => removePrefixField(type));

    fieldHeader.appendChild(label);
    fieldHeader.appendChild(removeBtn);

    const select = document.createElement("select");
    select.id = fieldId;
    select.name = fieldId;
    select.className = "prefix-select";

    const terms = getNamespaceTerms().map((t) => ({
      value: t.value,
      label: t.label || t.value,
    }));
    fillSelectTerms(select, terms, { placeholder: `Select ${type}…` });

    select.addEventListener("change", () => {
      touched[fieldId] = true;
      state[fieldId] = select.value;
      syncPreview();
    });

    const msgDiv = document.createElement("div");
    msgDiv.className = "field-msg";
    msgDiv.id = `msg-${fieldId}`;
    msgDiv.setAttribute("aria-live", "polite");

    fieldWrapper.appendChild(fieldHeader);
    fieldWrapper.appendChild(select);
    fieldWrapper.appendChild(msgDiv);
    prefixFieldsContainer.appendChild(fieldWrapper);

    const addBtn = $(`#addPrefix${capitalizeFirst(type)}`);
    if (addBtn) addBtn.style.display = "none";

    if (state[fieldId]) {
      select.value = state[fieldId];
    }
  }

  function removePrefixField(type) {
    if (!activePrefixFields.has(type) || !prefixFieldsContainer) return;

    activePrefixFields.delete(type);
    const fieldWrapper = prefixFieldsContainer.querySelector(`[data-prefix-type="${type}"]`);
    if (fieldWrapper) {
      fieldWrapper.remove();
    }

    const fieldId = getPrefixFieldId(type);
    state[fieldId] = "";

    const addBtn = $(`#addPrefix${capitalizeFirst(type)}`);
    if (addBtn) addBtn.style.display = "inline-flex";

    syncPreview();
  }

  addPrefixSystemBtn?.addEventListener("click", () => addPrefixField("system"));
  addPrefixThemeBtn?.addEventListener("click", () => addPrefixField("theme"));
  addPrefixDomainBtn?.addEventListener("click", () => addPrefixField("domain"));

  // Accordion helpers
  function toggleAccordion(header, content) {
    if (!header || !content) return;
    const isExpanded = header.getAttribute("aria-expanded") === "true";
    const newState = !isExpanded;
    header.setAttribute("aria-expanded", String(newState));
    if (newState) {
      content.removeAttribute("hidden");
    } else {
      content.setAttribute("hidden", "");
    }
  }

  function setupAccordion(header, content) {
    if (!header || !content) return;
    header.addEventListener("click", () => toggleAccordion(header, content));
    header.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleAccordion(header, content);
      }
    });
  }

  setupAccordion(prefixAccordionHeader, prefixAccordionContent);
  setupAccordion(baseAccordionHeader, baseAccordionContent);
  setupAccordion(suffixAccordionHeader, suffixAccordionContent);

  // Checkbox toggle helper
  function setupCheckboxToggle(check, inputWrapper, input) {
    if (!check || !inputWrapper || !input) return;
    check.addEventListener("change", () => {
      inputWrapper.style.display = check.checked ? "block" : "none";
      if (!check.checked) {
        input.value = "";
      }
    });
  }

  setupCheckboxToggle(baseCategoryCheck, baseCategoryInputWrapper, baseCategoryInput);
  setupCheckboxToggle(baseConceptCheck, baseConceptInputWrapper, baseConceptInput);
  setupCheckboxToggle(basePropertyCheck, basePropertyInputWrapper, basePropertyInput);
  setupCheckboxToggle(variantCheck, variantInputWrapper, variantInput);
  setupCheckboxToggle(stateCheck, stateInputWrapper, stateInput);
  setupCheckboxToggle(scaleCheck, scaleInputWrapper, scaleInput);
  setupCheckboxToggle(modeCheck, modeInputWrapper, modeInput);

  // Base field handlers helper
  function setupBaseFieldHandler(check, input, fieldName) {
    const updateState = () => {
      touched[fieldName] = true;
      state[fieldName] = check?.checked ? (input?.value.trim() || "") : "";
      syncMessages();
      syncPreview();
    };

    input?.addEventListener("input", () => {
      touched[fieldName] = true;
      state[fieldName] = input.value.trim();
      syncMessages();
      syncPreview();
    });

    check?.addEventListener("change", updateState);
  }

  setupBaseFieldHandler(baseCategoryCheck, baseCategoryInput, "baseCategory");
  setupBaseFieldHandler(baseConceptCheck, baseConceptInput, "baseConcept");
  setupBaseFieldHandler(basePropertyCheck, basePropertyInput, "baseProperty");

  // Object section handlers
  objectGroupSelect?.addEventListener("change", () => {
    touched.objectGroup = true;
    state.objectGroup = objectGroupSelect.value;
    syncMessages();
    syncPreview();
  });

  objectComponentSelect?.addEventListener("change", () => {
    touched.objectComponent = true;
    state.objectComponent = objectComponentSelect.value;
    state.objectElement = "";
    if (objectElementSelect) {
      objectElementSelect.value = "";
      fillSelectTerms(objectElementSelect, getObjectElementTerms(state.namespace, state.objectComponent), {
        placeholder: "Select element…",
      });
      objectElementSelect.disabled = !state.objectComponent;
    }
    syncMessages();
    syncPreview();
  });

  objectElementSelect?.addEventListener("change", () => {
    touched.objectElement = true;
    state.objectElement = objectElementSelect.value;
    syncMessages();
    syncPreview();
  });

  formatSelect?.addEventListener("change", () => syncPreview());

  modifierSearch?.addEventListener("input", () => {
    const q = modifierSearch.value.trim().toLowerCase();
    for (const btn of $all(".chip-btn", modifiersEl || document)) {
      const value = (btn.getAttribute("data-value") || "").toLowerCase();
      const label = (btn.textContent || "").toLowerCase();
      btn.hidden = q ? !(value.includes(q) || label.includes(q)) : false;
    }
  });

  // Suffix modifier handlers helper
  function syncModifierStateFromSuffix() {
    const mods = [];
    if (variantCheck?.checked && variantInput?.value.trim()) mods.push(variantInput.value.trim());
    if (stateCheck?.checked && stateInput?.value.trim()) mods.push(stateInput.value.trim());
    if (scaleCheck?.checked && scaleInput?.value.trim()) mods.push(scaleInput.value.trim());
    if (modeCheck?.checked && modeInput?.value.trim()) mods.push(modeInput.value.trim());
    state.modifiers = mods;
  }

  function setupSuffixFieldHandler(check, input) {
    const updateState = () => {
      touched.modifier = true;
      syncModifierStateFromSuffix();
      syncMessages();
      syncPreview();
    };

    input?.addEventListener("input", updateState);
    check?.addEventListener("change", updateState);
  }

  setupSuffixFieldHandler(variantCheck, variantInput);
  setupSuffixFieldHandler(stateCheck, stateInput);
  setupSuffixFieldHandler(scaleCheck, scaleInput);
  setupSuffixFieldHandler(modeCheck, modeInput);

  // Copy handlers
  copyNameBtn?.addEventListener("click", () => onCopy("name"));
  copyJsonBtn?.addEventListener("click", () => onCopy("json"));

  previewEl?.addEventListener("keydown", async (e) => {
    if (!(e instanceof KeyboardEvent)) return;
    if (!(e.metaKey || e.ctrlKey)) return;
    if (e.key.toLowerCase() !== "c") return;
    e.preventDefault();
    await onCopy("name");
  });

  clearHistoryBtn?.addEventListener("click", () => {
    clearHistory();
    hydrateHistory();
    showToast("History cleared.");
  });

  // Framework tab handlers
  for (const tab of frameworkTabs) {
    tab.addEventListener("click", () => {
      const id = tab.getAttribute("data-framework");
      if (!id || !FRAMEWORKS.includes(id) || id === activeFramework) return;
      setActiveFramework(id);
    });

    tab.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const id = tab.getAttribute("data-framework");
        if (!id || !FRAMEWORKS.includes(id) || id === activeFramework) return;
        setActiveFramework(id);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const tabs = Array.from(frameworkTabs);
        const currentIndex = tabs.indexOf(tab);
        const nextIndex =
          e.key === "ArrowLeft"
            ? currentIndex > 0
              ? currentIndex - 1
              : tabs.length - 1
            : currentIndex < tabs.length - 1
              ? currentIndex + 1
              : 0;
        tabs[nextIndex]?.focus();
      }
    });
  }

  namespaceSelect?.addEventListener("change", () => {
    handleNamespaceChange(namespaceSelect.value);
  });

  function handleNamespaceChange(value) {
    touched.namespace = true;
    state.namespace = value;

    // Reset all framework-specific fields
    state.prefixSystem = "";
    state.prefixTheme = "";
    state.prefixDomain = "";
    state.baseCategory = "";
    state.baseConcept = "";
    state.baseProperty = "";
    state.objectGroup = "";
    state.objectComponent = "";
    state.objectElement = "";
    state.modifiers = [];

    if (namespaceSelect && namespaceSelect.value !== value) {
      namespaceSelect.value = value;
    }

    activePrefixFields.forEach((type) => removePrefixField(type));

    // Clear base fields
    clearField(baseCategoryCheck, baseCategoryInputWrapper, baseCategoryInput);
    clearField(baseConceptCheck, baseConceptInputWrapper, baseConceptInput);
    clearField(basePropertyCheck, basePropertyInputWrapper, basePropertyInput);

    // Clear object fields
    if (objectGroupSelect) {
      objectGroupSelect.value = "";
      fillSelectTerms(objectGroupSelect, getObjectGroupTerms(state.namespace), {
        placeholder: "Select group…",
      });
      objectGroupSelect.disabled = !state.namespace;
    }
    if (objectComponentSelect) {
      objectComponentSelect.value = "";
      fillSelectTerms(objectComponentSelect, getObjectComponentTerms(state.namespace), {
        placeholder: "Select component…",
      });
      objectComponentSelect.disabled = !state.namespace;
    }
    if (objectElementSelect) {
      objectElementSelect.value = "";
      objectElementSelect.disabled = true;
    }

    // Clear suffix fields
    clearField(variantCheck, variantInputWrapper, variantInput);
    clearField(stateCheck, stateInputWrapper, stateInput);
    clearField(scaleCheck, scaleInputWrapper, scaleInput);
    clearField(modeCheck, modeInputWrapper, modeInput);
    syncModifierStateFromSuffix();

    syncMessages();
    syncPreview();
  }

  function clearField(check, wrapper, input) {
    if (check) {
      check.checked = false;
      if (wrapper) wrapper.style.display = "none";
    }
    if (input) input.value = "";
  }

  function setActiveFramework(id) {
    if (!FRAMEWORKS.includes(id)) return;
    activeFramework = id;
    state = frameworkStates[activeFramework];

    for (const tab of frameworkTabs) {
      const tabId = tab.getAttribute("data-framework");
      const isActive = tabId === activeFramework;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    }

    if (baseSection) {
      baseSection.style.display = id === "primitive" || id === "semantic" ? "block" : "none";
    }
    if (objectSection) {
      objectSection.style.display = id === "component" ? "block" : "none";
    }

    const reqBaseCategory = $("#req-baseCategory");
    const reqBaseConcept = $("#req-baseConcept");
    const reqBaseProperty = $("#req-baseProperty");
    if (reqBaseCategory) reqBaseCategory.style.display = "inline";
    if (reqBaseConcept) reqBaseConcept.style.display = id === "semantic" ? "inline" : "none";
    if (reqBaseProperty) reqBaseProperty.style.display = id === "semantic" ? "inline" : "none";

    applyStateToForm();
  }

  function applyStateToForm() {
    if (namespaceSelect) namespaceSelect.value = state.namespace || "";

    // Restore prefix fields
    for (const type of ["system", "theme", "domain"]) {
      const fieldId = getPrefixFieldId(type);
      if (state[fieldId]) {
        if (!activePrefixFields.has(type)) addPrefixField(type);
        const select = $(`#${fieldId}`);
        if (select) select.value = state[fieldId];
      }
    }

    // Restore base fields
    restoreCheckboxField(baseCategoryCheck, baseCategoryInput, baseCategoryInputWrapper, "baseCategory");
    restoreCheckboxField(baseConceptCheck, baseConceptInput, baseConceptInputWrapper, "baseConcept");
    restoreCheckboxField(basePropertyCheck, basePropertyInput, basePropertyInputWrapper, "baseProperty");

    // Restore object fields
    if (objectGroupSelect) {
      fillSelectTerms(objectGroupSelect, getObjectGroupTerms(state.namespace), {
        placeholder: "Select group…",
      });
      objectGroupSelect.value = state.objectGroup || "";
      objectGroupSelect.disabled = !state.namespace;
    }
    if (objectComponentSelect) {
      fillSelectTerms(objectComponentSelect, getObjectComponentTerms(state.namespace), {
        placeholder: "Select component…",
      });
      objectComponentSelect.value = state.objectComponent || "";
      objectComponentSelect.disabled = !state.namespace;
    }
    if (objectElementSelect) {
      fillSelectTerms(objectElementSelect, getObjectElementTerms(state.namespace, state.objectComponent), {
        placeholder: "Select element…",
      });
      objectElementSelect.value = state.objectElement || "";
      objectElementSelect.disabled = !state.objectComponent;
    }

    // Restore suffix modifiers
    const mods = state.modifiers || [];
    restoreCheckboxField(variantCheck, variantInput, variantInputWrapper, null, mods[0]);
    restoreCheckboxField(stateCheck, stateInput, stateInputWrapper, null, mods[1]);
    restoreCheckboxField(scaleCheck, scaleInput, scaleInputWrapper, null, mods[2]);
    restoreCheckboxField(modeCheck, modeInput, modeInputWrapper, null, mods[3]);

    syncMessages();
    syncPreview();
  }

  function restoreCheckboxField(check, input, wrapper, stateKey, value) {
    const fieldValue = value !== undefined ? value : state[stateKey] || "";
    if (input) {
      input.value = fieldValue;
      if (check) {
        check.checked = !!fieldValue;
        if (wrapper) wrapper.style.display = check.checked ? "block" : "none";
      }
    }
  }

  async function onCopy(kind) {
    copyAttempted = true;
    const validation = validateState(state);
    if (validation.errors.length) {
      setTone(statusEl, "error");
      setText(statusEl, validation.errors[0].message);
      await showToast("Fix validation errors before copying.", { title: "Not ready" });
      syncMessages();
      return;
    }

    const format = formatSelect?.value || "slash";
    const name = formatTokenName({ ...state, framework: activeFramework }, format);

    const text =
      kind === "json"
        ? JSON.stringify(
            {
              name,
              namespace: state.namespace,
              prefixSystem: state.prefixSystem,
              prefixTheme: state.prefixTheme,
              prefixDomain: state.prefixDomain,
              baseCategory: state.baseCategory,
              baseConcept: state.baseConcept,
              baseProperty: state.baseProperty,
              objectGroup: state.objectGroup,
              objectComponent: state.objectComponent,
              objectElement: state.objectElement,
              modifiers: [...state.modifiers].sort(),
            },
            null,
            2,
          )
        : name;

    const ok = await copyToClipboard(text);
    if (!ok) {
      setTone(statusEl, "error");
      setText(statusEl, "Copy failed. Your browser may block clipboard access.");
      await showToast("Copy failed.", { title: "Clipboard" });
      return;
    }

    setTone(statusEl, "ok");
    setText(statusEl, kind === "json" ? "Copied JSON." : "Copied token name.");
    await showToast("Copied.");

    addToHistory(state);
    hydrateHistory();
  }

  function hydrateHistory() {
    if (!historyEl) return;
    const items = loadHistory();
    renderHistory(historyEl, items, {
      onFill: (item) => {
        if (item.namespace) {
          handleNamespaceChange(item.namespace);
        }
      },
      onCopy: async (item) => {
        const format = formatSelect?.value || "slash";
        const name = formatTokenName({ ...item, framework: activeFramework }, format);
        const ok = await copyToClipboard(name);
        await showToast(ok ? "Copied." : "Copy failed.");
      },
      onRemove: (item) => {
        removeHistoryItem(item.ts);
        hydrateHistory();
      },
    });
  }

  function syncMessages() {
    const validation = validateState(state);
    const errors = validation.errors.filter((e) => {
      if (!e.message.includes("required")) return true;
      if (copyAttempted) return true;
      const fieldTouched = touched[e.field];
      return fieldTouched !== undefined ? fieldTouched : true;
    });
    const warnings = copyAttempted ? validation.warnings : [];

    const fields = [
      "namespace",
      "prefixSystem",
      "prefixTheme",
      "prefixDomain",
      "baseCategory",
      "baseConcept",
      "baseProperty",
      "objectGroup",
      "objectComponent",
      "objectElement",
      "modifier",
    ];
    for (const field of fields) {
      setFieldMessage(field, errors, warnings);
    }

    const canCopy = errors.length === 0 && isValid(state);
    if (copyNameBtn) copyNameBtn.disabled = !canCopy;
    if (copyJsonBtn) copyJsonBtn.disabled = !canCopy;

    if (!statusEl) return;

    if (errors.length) {
      setTone(statusEl, "error");
      setText(statusEl, errors[0].message);
      return;
    }
    if (warnings.length) {
      setTone(statusEl, "warn");
      setText(statusEl, warnings[0].message);
      return;
    }
    if (isValid(state)) {
      setTone(statusEl, "ok");
      setText(statusEl, "Ready to copy.");
      return;
    }

    setTone(statusEl, null);
    setText(statusEl, "");
  }

  function setFieldMessage(field, errors, warnings) {
    const el = $(`#msg-${field}`);
    if (!el) return;
    const err = errors.find((e) => e.field === field);
    if (err) {
      setTone(el, "error");
      setText(el, err.message);
      return;
    }
    const warn = warnings.find((w) => w.field === field);
    if (warn) {
      setTone(el, "warn");
      setText(el, warn.message);
      return;
    }

    setTone(el, null);
    setText(el, "");
  }

  function syncPreview() {
    if (!previewEl) return;
    const format = formatSelect?.value || "slash";
    const tokenName = formatTokenName({ ...state, framework: activeFramework }, format);
    previewEl.textContent = tokenName || "_";
    previewEl.classList.toggle("preview-seg-empty", !tokenName);
  }

  syncMessages();
  syncPreview();
}

async function copyToClipboard(text) {
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
