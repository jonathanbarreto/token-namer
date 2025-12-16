const HISTORY_KEY = "token-namer:history";

export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(items) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items || []));
  } catch {
    // ignore
  }
}

