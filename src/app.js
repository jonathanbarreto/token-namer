import { MODIFIERS, NAMESPACES, getBases, getObjects } from "./data.js";
import { $, $all, fillSelect, setText, setTone } from "./dom.js";
import { formatTokenName, formatTokenPreviewSegments, getDelimiters } from "./format.js";
import { addToHistory, clearHistory, removeHistoryItem, renderHistory } from "./history.js";
import { getPresets } from "./presets.js";
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

  /** @type {{ namespace: string, object: string, base: string, modifiers: string[] }} */
  const state = { namespace: "", object: "", base: "", modifiers: [] };
  const touched = { namespace: false, object: false, base: false, modifier: false };
  let copyAttempted = false;

  const namespaceSelect = /** @type {HTMLSelectElement | null} */ ($("#namespace"));
  const objectSelect = /** @type {HTMLSelectElement | null} */ ($("#object"));
  const baseSelect = /** @type {HTMLSelectElement | null} */ ($("#base"));
  const formatSelect = /** @type {HTMLSelectElement | null} */ ($("#format"));
  const modifierSearch = /** @type {HTMLInputElement | null} */ ($("#modifierSearch"));
  const modifiersEl = $("#modifiers");
  const presetsEl = $("#presets");
  const previewEl = $("#preview");
  const statusEl = $("#status");
  const copyNameBtn = $("#copyName");
  const copyJsonBtn = $("#copyJson");
  const historyEl = $("#history");
  const clearHistoryBtn = $("#clearHistory");

  fillSelect(namespaceSelect, NAMESPACES, { placeholder: "Select namespace…" });
  renderModifierChips(modifiersEl, MODIFIERS, state, {
    onChange: () => {
      touched.modifier = true;
      syncMessages();
      syncPreview();
    },
  });
  renderPresets(presetsEl, [], () => {});
  hydrateHistory();

  namespaceSelect?.addEventListener("change", () => {
    touched.namespace = true;
    state.namespace = namespaceSelect.value;
    state.object = "";
    state.base = "";
    state.modifiers = [];

    fillSelect(objectSelect, getObjects(state.namespace), { placeholder: "Select object…" });
    if (objectSelect) objectSelect.disabled = !state.namespace;

    fillSelect(baseSelect, [], { placeholder: "Select base…" });
    if (baseSelect) baseSelect.disabled = true;

    if (modifierSearch) modifierSearch.disabled = true;
    renderModifierChips(modifiersEl, MODIFIERS, state, {
      onChange: () => {
        syncMessages();
        syncPreview();
      },
    });
    renderPresets(presetsEl, getPresets(state.namespace), (preset) => applyPreset(preset));

    syncMessages();
    syncPreview();
  });

  objectSelect?.addEventListener("change", () => {
    touched.object = true;
    state.object = objectSelect.value;
    state.base = "";
    state.modifiers = [];

    fillSelect(baseSelect, getBases(state.namespace, state.object), { placeholder: "Select base…" });
    if (baseSelect) baseSelect.disabled = !state.object;

    if (modifierSearch) modifierSearch.disabled = true;
    renderModifierChips(modifiersEl, MODIFIERS, state, {
      onChange: () => {
        syncMessages();
        syncPreview();
      },
    });

    syncMessages();
    syncPreview();
  });

  baseSelect?.addEventListener("change", () => {
    touched.base = true;
    state.base = baseSelect.value;
    state.modifiers = [];
    if (modifierSearch) modifierSearch.disabled = !state.base;
    renderModifierChips(modifiersEl, MODIFIERS, state, {
      onChange: () => {
        syncMessages();
        syncPreview();
      },
    });
    syncMessages();
    syncPreview();
  });

  formatSelect?.addEventListener("change", () => {
    syncPreview();
  });

  modifierSearch?.addEventListener("input", () => {
    const q = modifierSearch.value.trim().toLowerCase();
    for (const btn of $all(".chip-btn", modifiersEl || document)) {
      const value = btn.getAttribute("data-value") || "";
      btn.hidden = q ? !value.includes(q) : false;
    }
  });

  copyNameBtn?.addEventListener("click", async () => {
    await onCopy("name");
  });

  copyJsonBtn?.addEventListener("click", async () => {
    await onCopy("json");
  });

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

  syncMessages();
  syncPreview();

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
    const name = formatTokenName(state, format);

    const text =
      kind === "json"
        ? JSON.stringify(
            {
              name,
              namespace: state.namespace,
              object: state.object,
              base: state.base,
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

  function applyPreset(preset) {
    if (!preset || !state.namespace) return;
    state.object = preset.object || "";
    state.base = preset.base || "";
    state.modifiers = [...(preset.modifiers || [])];

    if (objectSelect) objectSelect.value = state.object;
    fillSelect(baseSelect, getBases(state.namespace, state.object), { placeholder: "Select base…" });
    if (baseSelect) {
      baseSelect.disabled = !state.object;
      baseSelect.value = state.base;
    }

    if (modifierSearch) modifierSearch.disabled = !state.base;
    if (modifierSearch) modifierSearch.value = "";
    renderModifierChips(modifiersEl, MODIFIERS, state, {
      onChange: () => {
        syncMessages();
        syncPreview();
      },
    });

    syncMessages();
    syncPreview();
  }

  function hydrateHistory() {
    if (!historyEl) return;
    const items = loadHistory();
    renderHistory(historyEl, items, {
      onFill: (item) => {
        state.namespace = item.namespace || "";
        state.object = item.object || "";
        state.base = item.base || "";
        state.modifiers = [...(item.modifiers || [])];

        if (namespaceSelect) namespaceSelect.value = state.namespace;

        fillSelect(objectSelect, getObjects(state.namespace), { placeholder: "Select object…" });
        if (objectSelect) {
          objectSelect.disabled = !state.namespace;
          objectSelect.value = state.object;
        }

        fillSelect(baseSelect, getBases(state.namespace, state.object), { placeholder: "Select base…" });
        if (baseSelect) {
          baseSelect.disabled = !state.object;
          baseSelect.value = state.base;
        }

        renderPresets(presetsEl, getPresets(state.namespace), (preset) => applyPreset(preset));
        if (modifierSearch) modifierSearch.disabled = !state.base;
        if (modifierSearch) modifierSearch.value = "";
        renderModifierChips(modifiersEl, MODIFIERS, state, {
          onChange: () => {
            syncMessages();
            syncPreview();
          },
        });

        syncMessages();
        syncPreview();
      },
      onCopy: async (item) => {
        const format = formatSelect?.value || "slash";
        const name = formatTokenName(item, format);
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
      if (e.message !== "This field is required.") return true;
      if (copyAttempted) return true;
      if (e.field === "namespace") return touched.namespace;
      if (e.field === "object") return touched.object;
      if (e.field === "base") return touched.base;
      return true;
    });
    const warnings = copyAttempted ? validation.warnings : [];

    setFieldMessage("namespace", errors, warnings);
    setFieldMessage("object", errors, warnings);
    setFieldMessage("base", errors, warnings);
    setFieldMessage("modifier", errors, warnings);

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
    const { previewSep } = getDelimiters(format);
    const segs = formatTokenPreviewSegments(state);
    const parts = [
      renderSeg(segs.namespace, segs.hasNamespace),
      renderSep(previewSep),
      renderSeg(segs.object, segs.hasObject),
      renderSep(previewSep),
      renderSeg(segs.base, segs.hasBase),
      renderSep(previewSep),
      renderSeg(segs.modifier, segs.hasModifier),
    ];
    previewEl.innerHTML = "";
    for (const part of parts) previewEl.appendChild(part);
  }

  function renderSeg(text, filled) {
    const span = document.createElement("span");
    span.textContent = text;
    if (!filled) span.className = "preview-seg-empty";
    return span;
  }

  function renderSep(text) {
    const span = document.createElement("span");
    span.className = "preview-sep";
    span.textContent = text;
    return span;
  }
}

function renderModifierChips(container, modifiers, state, { onChange } = {}) {
  if (!container) return;
  container.innerHTML = "";
  for (const value of modifiers) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip-btn";
    btn.setAttribute("data-value", value);
    btn.setAttribute("aria-pressed", state.modifiers.includes(value) ? "true" : "false");
    btn.textContent = value;
    btn.disabled = !state.base;
    btn.addEventListener("click", () => {
      if (!state.base) return;
      if (state.modifiers.includes(value)) state.modifiers = state.modifiers.filter((x) => x !== value);
      else state.modifiers = [...state.modifiers, value];
      btn.setAttribute("aria-pressed", state.modifiers.includes(value) ? "true" : "false");
      $("#modifierSearch")?.dispatchEvent(new Event("input"));
      onChange?.();
    });
    container.appendChild(btn);
  }
}

function renderPresets(container, presets, onSelect) {
  if (!container) return;
  container.innerHTML = "";
  if (!presets.length) {
    const msg = document.createElement("div");
    msg.className = "field-msg";
    msg.textContent = "Select a namespace to see presets.";
    container.appendChild(msg);
    return;
  }

  for (const preset of presets) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "preset-btn";
    btn.textContent = preset.label;
    btn.addEventListener("click", () => onSelect?.(preset));
    container.appendChild(btn);
  }
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
