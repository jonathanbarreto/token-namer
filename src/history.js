import { saveHistory } from "./storage.js";

export function addToHistory(history, entry, limit = 10) {
  const next = [entry, ...(history || [])];
  const unique = [];
  const seen = new Set();
  for (const item of next) {
    const key = item?.tokenName + "::" + item?.framework + "::" + JSON.stringify(item?.fields || {});
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
    if (unique.length >= limit) break;
  }
  saveHistory(unique);
  return unique;
}

export function removeHistoryItem(history, id) {
  const next = (history || []).filter((x) => x.id !== id);
  saveHistory(next);
  return next;
}

export function clearHistory() {
  saveHistory([]);
  return [];
}

