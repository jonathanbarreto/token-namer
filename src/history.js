import { formatTokenName } from "./format.js";
import { loadHistory, saveHistory } from "./storage.js";

const MAX_ITEMS = 10;

function keyForEntry(entry) {
  const modifiers = Array.isArray(entry.modifiers) ? [...entry.modifiers].sort().join(",") : "";
  return `${entry.namespace}|${entry.prefixSystem}|${entry.prefixTheme}|${entry.prefixDomain}|${entry.baseCategory}|${entry.baseConcept}|${entry.baseProperty}|${entry.objectGroup}|${entry.objectComponent}|${entry.objectElement}|${modifiers}`;
}

export function addToHistory(state) {
  const items = loadHistory();
  const entry = {
    ...state,
    modifiers: [...(state.modifiers || [])],
    ts: Date.now(),
  };

  const entryKey = keyForEntry(entry);
  const deduped = items.filter((x) => x && keyForEntry(x) !== entryKey);
  const next = [entry, ...deduped].slice(0, MAX_ITEMS);
  saveHistory(next);
  return next;
}

export function removeHistoryItem(ts) {
  const items = loadHistory();
  const next = items.filter((x) => x && x.ts !== ts);
  saveHistory(next);
  return next;
}

export function clearHistory() {
  saveHistory([]);
  return [];
}

export function renderHistory(container, items, { onFill, onCopy, onRemove }) {
  container.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "field-msg";
    empty.textContent = "No history yet. Copy a token name to save it here.";
    container.appendChild(empty);
    return;
  }

  for (const item of items) {
    const row = document.createElement("div");
    row.className = "history-item";

    const name = document.createElement("div");
    name.className = "history-name";
    name.textContent = formatTokenName(item, "slash");
    row.appendChild(name);

    const actions = document.createElement("div");
    actions.className = "history-actions";

    const fillBtn = document.createElement("button");
    fillBtn.type = "button";
    fillBtn.className = "icon-btn";
    fillBtn.setAttribute("aria-label", "Fill form");
    fillBtn.textContent = "↩";
    fillBtn.addEventListener("click", () => onFill?.(item));
    actions.appendChild(fillBtn);

    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "icon-btn";
    copyBtn.setAttribute("aria-label", "Copy");
    copyBtn.textContent = "⧉";
    copyBtn.addEventListener("click", () => onCopy?.(item));
    actions.appendChild(copyBtn);

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "icon-btn";
    removeBtn.setAttribute("aria-label", "Remove");
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", () => onRemove?.(item));
    actions.appendChild(removeBtn);

    row.appendChild(actions);
    container.appendChild(row);
  }
}

