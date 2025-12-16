export function $(selector, root = document) {
  return root.querySelector(selector);
}

export function $all(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

export function setText(el, text) {
  if (!el) return;
  el.textContent = text == null ? "" : String(text);
}

export function setTone(el, tone) {
  if (!el) return;
  if (!tone) delete el.dataset.tone;
  else el.dataset.tone = tone;
}

